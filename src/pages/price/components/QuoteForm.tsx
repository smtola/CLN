import React, { useState } from 'react';
import type { QuoteRequest, ServiceLevel } from '../types/quote.types';
import type { FormStep, Location } from '../types/common.types';
import { useQuotes } from '../hooks/useQuotes';
import { validateQuoteRequest } from '../utils/validators';
import LocationSearch from './LocationSearch';
import QuoteCard from './QuoteCard';
import CommoditySearch from './CommoditySearch';

const EQUIPMENT_TYPES = ['Dry Van', 'Flat Rack', 'Open Top'] as const;
const CONTAINER_SIZES  = ['20', '40'] as const;
const TRANSPORT_MODES  = ['Sea', 'Air', 'Road'] as const;

// ── Shared field label ──────────────────────────────────────────────
const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>
    {children}{required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

// ── Error text ──────────────────────────────────────────────────────
const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="mt-1 text-xs text-red-500">{msg}</p> : null;

// ── Radio group ─────────────────────────────────────────────────────
const RadioGroup = <T extends string>({
  options,
  value,
  onChange,
}: {
  name: string;
  options: readonly T[];
  value: string;
  onChange: (v: T) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    {options.map(opt => {
      const selected = value === opt;
      return (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className="px-3 py-1.5 rounded-lg border text-sm font-medium transition-all"
          style={{
            borderColor: selected ? '#1B4F8A' : '#e2e8f0',
            background:  selected ? '#1B4F8A' : '#ffffff',
            color:       selected ? '#ffffff' : '#475569',
          }}
        >
          {opt}
        </button>
      );
    })}
  </div>
);

// ── Step indicator ──────────────────────────────────────────────────
const STEPS = ['Route & Schedule', 'Cargo Details'];

const StepBar = ({ active }: { active: FormStep }) => (
  <div className="flex items-center mb-8">
    {STEPS.map((label, i) => {
      const done    = i + 1 < active;
      const current = i + 1 === active;
      return (
        <React.Fragment key={i}>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
              style={{
                background: done ? '#4F9848' : current ? '#1B4F8A' : '#e2e8f0',
                color:      done || current ? '#fff' : '#94a3b8',
              }}
            >
              {done
                ? <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                : i + 1}
            </div>
            <span className="text-sm font-medium" style={{ color: current ? '#1B4F8A' : done ? '#4F9848' : '#94a3b8' }}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-px mx-3" style={{ background: done ? '#4F9848' : '#e2e8f0' }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ── Input style ─────────────────────────────────────────────────────
const inputCls = "w-full px-3 py-2.5 rounded-lg border text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all";

const QuoteForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState<FormStep>(1);
  const [formData, setFormData] = useState<QuoteRequest>({
    origin:             '',
    destination:        '',
    containerSize:      '',
    containerQuantity:  1,
    containerMaxWeight: 0,
    soc:                false,
    equipmentType:      '',
    commodity:          '',
    vesselDeparture:    '',
    country:            '',
    mode:               '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { quoteResult, getQuote, resetQuote } = useQuotes();

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
  const validateStep = (step: FormStep): boolean => {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!formData.origin)         errs.origin         = 'Origin is required.';
      if (!formData.destination)    errs.destination    = 'Destination is required.';
      if (!formData.vesselDeparture) errs.vesselDeparture = 'Vessel departure date is required.';
    }
    if (step === 2) {
      const vErrs = validateQuoteRequest(formData);
      if (vErrs.length > 0) errs.general = vErrs[0].message;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(2)) return;
    await getQuote(formData);
    setActiveStep(2);
  };

  const handleReset = () => {
    resetQuote();
    setActiveStep(1);
    setErrors({});
    setFormData({
      origin: '', destination: '', containerSize: '', containerQuantity: 1,
      containerMaxWeight: 0, soc: false, equipmentType: '', commodity: '',
      vesselDeparture: '', country: '', mode: '',
    });
  };

  // ── Result view ───────────────────────────────────────────────────
  if (quoteResult) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Result header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#4F9848' }}>Quote Results</p>
            <h2 className="text-2xl font-bold" style={{ color: '#0A1628' }}>
              {quoteResult.origin} → {quoteResult.destination}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {(quoteResult.distance_km ?? 0).toLocaleString()} km · {quoteResult.chargeable_weight ?? 0} kg chargeable weight
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
            style={{ borderColor: '#e2e8f0', color: '#475569' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            New Quote
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(quoteResult.quotes).map(([service, quote]) => (
            <QuoteCard
              key={service}
              service={service as ServiceLevel}
              quote={quote}
              isPopular={service === 'standard'}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#ee3a23' }}>

        {/* Card header */}
        <div className="px-6 pt-6 pb-5" style={{ background: 'rgb(102, 165, 95, 0.50)' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(102, 165, 95, 0.50)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Freight Quote Calculator</h1>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Get instant indicative rates</p>
            </div>
          </div>
          <StepBar active={activeStep} />
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6 space-y-5">

            {/* ── Step 1 ── */}
            {activeStep === 1 && (
              <>
                <div>
                  <FieldLabel required>Origin Port / City</FieldLabel>
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
                  <FieldLabel required>Destination Port / City</FieldLabel>
                  <LocationSearch
                    label=""
                    value={formData.destination}
                    onChange={l => handleLocationChange('destination', l)}
                    placeholder="e.g. Shanghai"
                    required
                  />
                  <FieldError msg={errors.destination} />
                </div>

                <div>
                  <FieldLabel required>Vessel Departure Date</FieldLabel>
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
              </>
            )}

            {/* ── Step 2 ── */}
            {activeStep === 2 && (
              <>
                {errors.general && (
                  <div className="flex gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2} className="w-4 h-4 flex-shrink-0 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-600">{errors.general}</p>
                  </div>
                )}

                {/* Equipment type */}
                <div>
                  <FieldLabel>Equipment Type</FieldLabel>
                  <RadioGroup
                    name="equipmentType"
                    options={EQUIPMENT_TYPES}
                    value={formData.equipmentType}
                    onChange={v => setFormData(p => ({ ...p, equipmentType: v }))}
                  />
                </div>

                {/* Container size */}
                <div>
                  <FieldLabel>Container Size</FieldLabel>
                  <RadioGroup
                    name="containerSize"
                    options={CONTAINER_SIZES}
                    value={formData.containerSize}
                    onChange={v => setFormData(p => ({ ...p, containerSize: v }))}
                  />
                </div>

                {/* Transport mode */}
                <div>
                  <FieldLabel>Transport Mode</FieldLabel>
                  <RadioGroup
                    name="mode"
                    options={TRANSPORT_MODES}
                    value={formData.mode}
                    onChange={v => setFormData(p => ({ ...p, mode: v }))}
                  />
                </div>

                {/* Quantity */}
                <div>
                  <FieldLabel>Container Quantity</FieldLabel>
                  <div className="flex items-center gap-3">
                    {/* FIX: type="button" prevents accidental form submission */}
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(-1)}
                      className="w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-lg transition-colors hover:bg-slate-100"
                      style={{ borderColor: '#e2e8f0', color: '#475569' }}
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-lg font-semibold" style={{ color: '#0A1628' }}>
                      {formData.containerQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(1)}
                      className="w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-lg transition-colors hover:bg-slate-100"
                      style={{ borderColor: '#e2e8f0', color: '#475569' }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Gross weight */}
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

                {/* Commodity */}
                <div>
                  <FieldLabel>Commodity (HS Code)</FieldLabel>
                  <CommoditySearch
                    label=""
                    value={formData.commodity}
                    onChange={v => setFormData(p => ({ ...p, commodity: v }))}
                    disabled={!formData.origin || !formData.destination}
                  />
                </div>

                {/* SOC */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="soc"
                    checked={formData.soc}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-slate-300 accent-blue-600"
                  />
                  <span className="text-sm font-medium text-slate-700">Shipper Owned Container (SOC)</span>
                </label>
              </>
            )}
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50" style={{ borderColor: '#e2e8f0' }}>
            {activeStep > 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep(p => (p - 1) as FormStep)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border transition-colors hover:bg-white"
                style={{ borderColor: '#e2e8f0', color: '#475569' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            ) : <div />}

            {/* Step dots */}
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all"
                  style={{
                    width:      activeStep === i + 1 ? 20 : 6,
                    height:     6,
                    background: i + 1 < activeStep ? '#4F9848' : activeStep === i + 1 ? '#1B4F8A' : '#e2e8f0',
                  }}
                />
              ))}
            </div>

            {/* FIX: only type="submit" on last step; type="button" on next */}
            {activeStep < 2 ? (
              <button
                type="button"
                onClick={() => { if (validateStep(activeStep)) setActiveStep(p => (p + 1) as FormStep); }}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors"
                style={{ background: '#1B4F8A' }}
              >
                Next
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors"
                style={{ background: '#4F9848' }}
              >
                Get Quote
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteForm;