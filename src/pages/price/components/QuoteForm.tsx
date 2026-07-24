import React, { useState } from 'react';
import type { QuoteRequest, ServiceLevel } from '../types/quote.types';
import type { Location } from '../types/common.types';
import type { TransportMode } from '../types/quote.types';
import { useQuotes } from '../hooks/useQuotes';
import { validateQuoteRequest } from '../utils/validators';
import { MODE_STYLES, SERVICE_STYLES, CLEARANCE_OPTIONS, CONTAINER_TYPE_OPTIONS } from '../utils/constants';
import LocationSearch from './LocationSearch';
import QuoteCard from './QuoteCard';
import CommoditySearch from './CommoditySearch';

type Mode = keyof typeof MODE_STYLES; // 'sea' | 'air' | 'road'
type Service = keyof typeof SERVICE_STYLES;
type Clearance = 'import' | 'export';

// Common air-freight packaging unit types.
const PACKAGING_UNIT_OPTIONS: readonly string[] = [
  'Carton',
  'Pallet',
  'Crate',
  'Box',
  'Drum',
  'Bag',
  'Skid',
  'Roll',
  'Bundle',
  'Envelope',
  'Case',
  'Barrel',
  'Sack',
  'Tube',
  'Pail',
  'Bale',
  'Basket',
  'Bin',
  'Reel',
  'Tote',
];

// Per-mode cargo section shape. Sea and Road share the same fields
// (clearance → container type, commodity, weight, quantity). Air swaps
// container type for a packaging unit and drops quantity entirely.
const CARGO_FIELD_OPTIONS: Record<Mode, {
  showContainerType: boolean;
  showPackagingUnit: boolean;
  showQuantity: boolean;
}> = {
  sea:  { showContainerType: true,  showPackagingUnit: false, showQuantity: true },
  road: { showContainerType: true,  showPackagingUnit: false, showQuantity: true },
  air:  { showContainerType: false, showPackagingUnit: true,  showQuantity: false },
};

// ── Field label ──────────────────────────────────────────────────────
const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block text-sm font-semibold text-slate-600 mb-2">
    {children}{required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="mt-1.5 text-xs text-red-500">{msg}</p> : null;

// ── Pill option button (used for cargo-detail choices) ───────────────
const OptionPill = <T extends string>({
  options,
  value,
  onChange,
  accent,
}: {
  options: readonly T[];
  value: string;
  onChange: (v: T) => void;
  accent: string;
}) => (
  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto overflow-x-hidden pr-1">
    {options.map(opt => {
      const selected = value === opt;
      return (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className="px-4 h-16 rounded-xl border text-sm font-semibold transition-all duration-200"
          style={{
            borderColor: selected ? accent : '#cbd5e1',
            background:  selected ? accent : '#ffffff',
            color:       selected ? '#ffffff' : '#475569',
          }}
        >
          {opt}
        </button>
      );
    })}
  </div>
);

// ── Section wrapper ──────────────────────────────────────────────────
const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-5">{title}</h2>
    {children}
  </div>
);

// ── Transport mode selector card ─────────────────────────────────────
const ModeCard = ({
  modeKey,
  selected,
  onSelect,
}: {
  modeKey: Mode;
  selected: boolean;
  onSelect: () => void;
}) => {
  const style = MODE_STYLES[modeKey];
  return (
    <button
      type="button"
      onClick={onSelect}
      className="h-[130px] rounded-2xl border-2 px-5 flex flex-col items-start justify-center gap-1 text-left transition-all duration-300 hover:shadow-md"
      style={{
        borderColor: selected ? style.border : '#e2e8f0',
        background:  selected ? style.bg : '#ffffff',
      }}
    >
      <span className="text-2xl">{style.icon}</span>
      <span className="font-bold text-base" style={{ color: selected ? style.primary : '#0f172a' }}>
        {style.label}
      </span>
      <span className="text-xs text-slate-500">{style.tagline}</span>
    </button>
  );
};

// ── Service level selector card ──────────────────────────────────────
const ServiceCard = ({
  serviceKey,
  selected,
  onSelect,
}: {
  serviceKey: Service;
  selected: boolean;
  onSelect: () => void;
}) => {
  const style = SERVICE_STYLES[serviceKey];
  return (
    <button
      type="button"
      onClick={onSelect}
      className="h-[130px] rounded-2xl border-2 px-5 flex flex-col items-start justify-center gap-1 text-left transition-all duration-300 hover:shadow-md"
      style={{
        borderColor: selected ? style.border : '#e2e8f0',
        background:  selected ? style.bg : '#ffffff',
      }}
    >
      <span className="text-2xl">{style.icon}</span>
      <span className="font-bold text-base" style={{ color: selected ? style.primary : '#0f172a' }}>
        {style.label}
      </span>
      <span className="text-xs text-slate-500">{style.tagline}</span>
    </button>
  );
};

const inputCls = "w-full h-16 px-4 rounded-xl border border-slate-300 text-base text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all";

const QuoteForm: React.FC = () => {
  const [mode, setMode] = useState<Mode>('sea');
  // NOTE: pick whatever the real default key in SERVICE_STYLES is (e.g. 'standard').
  const [service, setService] = useState<Service>(Object.keys(SERVICE_STYLES)[0] as Service);
  const [clearance, setClearance] = useState<Clearance>('import');
  const [formData, setFormData] = useState<QuoteRequest>({
    origin:             '',
    destination:        '',
    clearance:          'import',
    containerSize:      '',
    containerQuantity:  1,
    containerMaxWeight: 0,
    soc:                false,
    equipmentType:      '',
    commodity:          '',
    vesselDeparture:    '',
    country:            '',
    mode:               'sea',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { quoteResult, getQuote, resetQuote, loading } = useQuotes();

  const activeStyle = MODE_STYLES[mode];
  const cargoConfig = CARGO_FIELD_OPTIONS[mode];

  // ── Handlers ──────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleLocationChange = (field: 'origin' | 'destination', location: Location) => {
    setFormData(prev => ({
      ...prev,
      [field]:  location.name,
      country: field === 'destination' ? location.country : prev.country,
    }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleModeChange = (next: Mode) => {
    setMode(next);
    // Reset the shared cargo fields so a stale value from another mode's
    // option set (e.g. "40" from Sea) can't leak into Air/Road submissions.
    setFormData(prev => ({
      ...prev,
      mode: next as TransportMode,
      equipmentType: '',
      containerSize: '',
    }));
  };

  const handleClearanceChange = (next: Clearance) => {
    setClearance(next);
    // Container type options depend on clearance (export has more options
    // than import), so drop any selection that may no longer be valid.
    // Also push clearance onto formData — rate lookup and pricing are keyed
    // by clearance direction (export/import), so it must reach the backend.
    setFormData(prev => ({ ...prev, clearance: next, containerSize: '' }));
  };

  const handleServiceChange = (next: Service) => {
    setService(next);
    // If service level ever needs to travel with the request payload, set it
    // on formData here too (once QuoteRequest has a matching field), e.g.:
    // setFormData(prev => ({ ...prev, serviceLevel: next }));
  };

  const handleQuantityChange = (delta: number) => {
    setFormData(prev => ({
      ...prev,
      containerQuantity: Math.max(1, prev.containerQuantity + delta),
    }));
  };

  const getMinDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // ── Validation ────────────────────────────────────────────────────
  const validateAll = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.origin)          errs.origin          = 'Origin is required.';
    if (!formData.destination)     errs.destination     = 'Destination is required.';
    if (!formData.vesselDeparture) errs.vesselDeparture  = 'Departure date is required.';

    const vErrs = validateQuoteRequest(formData);
    if (vErrs.length > 0) errs.general = vErrs[0].message;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;
    await getQuote(formData);
  };

  const handleReset = () => {
    resetQuote();
    setErrors({});
    setMode('sea');
    setService(Object.keys(SERVICE_STYLES)[0] as Service);
    setClearance('import');
    setFormData({
      origin: '', destination: '', clearance: 'import', containerSize: '', containerQuantity: 1,
      containerMaxWeight: 0, soc: false, equipmentType: '', commodity: '',
      vesselDeparture: '', country: '', mode: 'sea',
    });
  };

  // ── Result view ───────────────────────────────────────────────────
  if (quoteResult) {
    return (
      <div className="max-w-[1000px] mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: activeStyle.primary }}>
              Quote Results
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              {quoteResult.origin} → {quoteResult.destination}
            </h2>
            <p className="text-slate-500 mt-2">
              {(quoteResult.distance_km ?? 0).toLocaleString()} km · {quoteResult.chargeable_weight ?? 0} kg chargeable weight
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl border border-slate-300 text-slate-600 transition-colors hover:bg-slate-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            New Quote
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(quoteResult.quotes).map(([svc, quote]) => (
            <QuoteCard
              key={svc}
              service={svc as ServiceLevel}
              quote={quote}
              isPopular={svc === 'standard'}
              accentColor={activeStyle.primary}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-[1000px] mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
          Request an Instant Shipping Quote
        </h1>
        <p className="text-slate-500 text-lg mt-3">
          Calculate rates instantly with our upgraded logistics engine
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {errors.general && (
          <div className="flex gap-2 p-4 rounded-xl bg-red-50 border border-red-200">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2} className="w-4 h-4 flex-shrink-0 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {/* SECTION 1 — Route Details */}
        <Section title="Route Details">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Origin Location</FieldLabel>
              <LocationSearch
                label=""
                value={formData.origin}
                onChange={l => handleLocationChange('origin', l)}
                placeholder="e.g. Phnom Penh"
                required
              />
              <FieldError msg={errors.origin} />
            </div>

            <div>
              <FieldLabel required>Destination Location</FieldLabel>
              <LocationSearch
                label=""
                value={formData.destination}
                onChange={l => handleLocationChange('destination', l)}
                placeholder="e.g. Shanghai"
                required
              />
              <FieldError msg={errors.destination} />
            </div>

            <div className="md:col-span-2">
              <FieldLabel required>Departure Date</FieldLabel>
              <input
                type="date"
                name="vesselDeparture"
                value={formData.vesselDeparture}
                min={getMinDate()}
                onChange={handleInputChange}
                className={inputCls}
              />
              <FieldError msg={errors.vesselDeparture} />
            </div>
          </div>
        </Section>

        {/* SECTION 2 — Transport Mode */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 px-1">Transport Mode</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {(Object.keys(MODE_STYLES) as Mode[]).map(key => (
              <ModeCard
                key={key}
                modeKey={key}
                selected={mode === key}
                onSelect={() => handleModeChange(key)}
              />
            ))}
          </div>
        </div>

        {/* SECTION 3 — Service Level */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 px-1">Services</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {(Object.keys(SERVICE_STYLES) as Service[]).map(key => (
              <ServiceCard
                key={key}
                serviceKey={key}
                selected={service === key}
                onSelect={() => handleServiceChange(key)}
              />
            ))}
          </div>
        </div>

        {/* SECTION 4 — Cargo Details */}
        <Section title="Cargo Details">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Clearance</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {CLEARANCE_OPTIONS.map(opt => {
                  const selected = clearance === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleClearanceChange(opt.value)}
                      className="px-4 h-16 rounded-xl border text-sm font-semibold transition-all duration-200"
                      style={{
                        borderColor: selected ? activeStyle.primary : '#cbd5e1',
                        background:  selected ? activeStyle.primary : '#ffffff',
                        color:       selected ? '#ffffff' : '#475569',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {cargoConfig.showContainerType && (
              <div>
                <FieldLabel>Container Type</FieldLabel>
                <OptionPill
                  options={CONTAINER_TYPE_OPTIONS[clearance]}
                  value={formData.containerSize}
                  onChange={v => setFormData(p => ({ ...p, containerSize: v }))}
                  accent={activeStyle.primary}
                />
              </div>
            )}

            {cargoConfig.showPackagingUnit && (
              <div>
                <FieldLabel>Packaging Unit</FieldLabel>
                <OptionPill
                  options={PACKAGING_UNIT_OPTIONS}
                  value={formData.equipmentType}
                  onChange={v => setFormData(p => ({ ...p, equipmentType: v }))}
                  accent={activeStyle.primary}
                />
              </div>
            )}

            <div>
              <FieldLabel>Commodity (HS Code)</FieldLabel>
              <CommoditySearch
                label=""
                value={formData.commodity}
                onChange={v => setFormData(p => ({ ...p, commodity: v }))}
                disabled={!formData.origin || !formData.destination}
              />
            </div>

            <div>
              <FieldLabel>Gross Weight (kg)</FieldLabel>
              <input
                type="number"
                name="containerMaxWeight"
                value={formData.containerMaxWeight || ''}
                onChange={handleInputChange}
                placeholder="e.g. 18000"
                min={0}
                className={inputCls}
              />
            </div>

            {cargoConfig.showQuantity && (
              <div>
                <FieldLabel>Container Quantity</FieldLabel>
                <div className="w-full flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    className="w-[20%] h-16 rounded-xl border border-slate-300 flex items-center justify-center font-bold text-xl transition-colors hover:bg-slate-100 text-slate-600"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-lg font-semibold text-slate-900">
                    {formData.containerQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    className="w-[20%] h-16 rounded-xl border border-slate-300 flex items-center justify-center font-bold text-xl transition-colors hover:bg-slate-100 text-slate-600"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* BOTTOM CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[72px] rounded-2xl text-xl font-semibold text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-lg disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-2"
          style={{ background: activeStyle.primary }}
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Calculating…
            </>
          ) : (
            <>Calculate Quote Instantly →</>
          )}
        </button>
      </form>
    </div>
  );
};

export default QuoteForm;