import React, { useState } from 'react';
import { useRateCards } from '../hooks/useRateCards';
import { useCommodities } from '../hooks/useCommodities';
import type {
  RateCard,
  RateCardFormData,
  ClearanceDirection,
  ContainerType,
  ContainerPricing,
  DirectionPricing,
} from '../types/rateCard.types';
import { validateRateCard } from '../utils/validators';
import {
  CURRENCIES,
  TRANSPORT_MODES,
  SERVICE_LEVELS,
  SERVICE_COLORS,
  CLEARANCE_OPTIONS,
  CONTAINER_TYPE_OPTIONS,
} from '../utils/constants';
import { formatCurrency, capitalizeFirst } from '../utils/formatters';
import LocationSearch from './LocationSearch';
import type { Location } from '../types/common.types';
import { showError } from '../../../admin/utils/swalHelper';
import CommoditySearch from './CommoditySearch';

type Option = { value?: string; label?: string; name?: string };
type Service = keyof typeof SERVICE_COLORS;
const COST_LINES = ['clearance', 'trucking'] as const;
type CostLine = (typeof COST_LINES)[number];

// ── Shared input style ──────────────────────────────────────────────
const inputCls =
  'w-full px-3 py-2.5 rounded-lg border text-sm bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all';

// ── Field label ──────────────────────────────────────────────────────
const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block text-sm font-semibold text-slate-600 mb-2">
    {children}{required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

// ── Service badge ────────────────────────────────────────────────────
const ServiceBadge = ({ service }: { service: Service }) => {
  const cls = SERVICE_COLORS[service] ?? 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {capitalizeFirst(service)}
    </span>
  );
};

// ── Empty pricing scaffolds ────────────────────────────────────────────
// Commodity is the parent: each commodity gets its own full Import/Export ×
// Clearance/Trucking × Container-Type grid.
const emptyDirectionPricing = (): ContainerPricing => ({
  export: { clearance: {}, trucking: {} },
  import: { clearance: {}, trucking: {} },
});

// ── Container pricing block (per clearance direction, for one commodity) ──
// The clearance direction (export/import) shares its price down to the two
// cost lines (clearance & trucking), each priced per container type. This
// whole grid lives *under* whichever commodity is currently selected.
const ContainerPricingGroup = ({
  direction,
  pricing,
  currency,
  onPriceChange,
}: {
  direction: ClearanceDirection;
  pricing: DirectionPricing;
  currency: string;
  onPriceChange: (direction: ClearanceDirection, line: CostLine, type: ContainerType, value: number) => void;
}) => {
  const containerTypes = CONTAINER_TYPE_OPTIONS[direction];
  const dirLabel = direction === 'export' ? 'Export' : 'Import';

  return (
    <div className="rounded-xl border p-4" style={{ borderColor: '#e2e8f0' }}>
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: direction === 'export' ? '#1B4F8A' : '#66a55f' }}>
        {dirLabel} — Clearance &amp; Trucking by Container Type
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left text-xs font-semibold text-slate-500 pb-2 pr-2">Container Type</th>
              {COST_LINES.map(line => (
                <th key={line} className="text-left text-xs font-semibold text-slate-500 pb-2 pr-2 capitalize">
                  {line}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {containerTypes.map(type => (
              <tr key={type}>
                <td className="pr-2 py-1 text-xs font-semibold text-slate-700 whitespace-nowrap">{type}</td>
                {COST_LINES.map(line => (
                  <td key={line} className="pr-2 py-1">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={pricing[line][type] ?? ''}
                      onChange={e => onPriceChange(direction, line, type, parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className={inputCls}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Preview for customers */}
      {containerTypes.some(t => (pricing.clearance[t] ?? 0) > 0 || (pricing.trucking[t] ?? 0) > 0) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {containerTypes.map(type => {
            const clearancePrice = pricing.clearance[type] ?? 0;
            const truckingPrice = pricing.trucking[type] ?? 0;
            if (!clearancePrice && !truckingPrice) return null;
            return (
              <span key={type} className="px-2 py-1 rounded-lg bg-slate-50 border text-xs" style={{ borderColor: '#e2e8f0' }}>
                <span className="font-semibold text-slate-700">{type}</span>
                <span className="text-slate-500">
                  {' '}· Clearance {formatCurrency(clearancePrice, currency)} · Trucking {formatCurrency(truckingPrice, currency)}
                </span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Commodity selector (the "parent" picker) ──────────────────────────
// Lets the admin pick which commodity's Import/Export pricing grid they're
// editing. Selecting a commodity from search and clicking "Add" adds it as
// a priced commodity on this rate card; its chip can then be clicked to
// switch the grids below to that commodity.
const CommodityPicker = ({
  containers,
  commodityToAdd,
  activeCommodity,
  onCommodityToAddChange,
  onAddCommodity,
  onSelectCommodity,
  onRemoveCommodity,
}: {
  containers: RateCardFormData['containers'];
  commodityToAdd: string;
  activeCommodity: string;
  onCommodityToAddChange: (name: string) => void;
  onAddCommodity: () => void;
  onSelectCommodity: (name: string) => void;
  onRemoveCommodity: (name: string) => void;
}) => {
  const addedNames = Object.keys(containers);
  const alreadyAdded = commodityToAdd.length > 0 && addedNames.includes(commodityToAdd);

  return (
    <div className="rounded-xl border p-4" style={{ borderColor: '#e2e8f0' }}>
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#0A1628' }}>
        Commodity
      </p>
      <p className="text-xs text-slate-400 mb-3">
        Commodity is the parent for both Import and Export — Clearance &amp; Trucking by Container Type. Select a commodity to price it.
      </p>

      <div className="flex flex-wrap items-end gap-2 mb-1">
        <div className="flex-1 min-w-[220px]">
          <FieldLabel>Select commodity</FieldLabel>
          <CommoditySearch
            label=""
            value={commodityToAdd}
            onChange={onCommodityToAddChange}
          />
        </div>
        <button
          type="button"
          onClick={onAddCommodity}
          disabled={!commodityToAdd || alreadyAdded}
          className="h-[64px] px-4 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40"
          style={{ background: '#1B4F8A' }}
        >
          + Add
        </button>
      </div>
      {alreadyAdded && (
        <p className="text-xs text-amber-600 mb-2">This commodity is already priced on this rate card.</p>
      )}

      {addedNames.length === 0 ? (
        <p className="text-xs text-slate-400 mt-2">No commodities priced yet. Select one above and click Add.</p>
      ) : (
        <div className="flex flex-wrap gap-2 mt-2">
          {addedNames.map(name => {
            const selected = activeCommodity === name;
            return (
              <span
                key={name}
                className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full border text-xs font-semibold transition-colors"
                style={{
                  borderColor: selected ? '#1B4F8A' : '#e2e8f0',
                  background: selected ? '#EEF2FF' : '#f8fafc',
                  color: selected ? '#1B4F8A' : '#334155',
                }}
              >
                <button type="button" onClick={() => onSelectCommodity(name)}>{name}</button>
                <button
                  type="button"
                  onClick={() => onRemoveCommodity(name)}
                  className="text-slate-400 hover:text-red-500 leading-none px-0.5"
                  title="Remove commodity pricing"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Form modal ───────────────────────────────────────────────────────
interface ModalProps {
  editingCard: RateCard | null;
  formData: RateCardFormData;
  loading: boolean;
  activeCommodity: string;
  commodityToAdd: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onLocationChange: (name: string, location: Location) => void;
  onContainerPriceChange: (commodity: string, direction: ClearanceDirection, line: CostLine, type: ContainerType, value: number) => void;
  onCommodityToAddChange: (name: string) => void;
  onAddCommodity: () => void;
  onSelectCommodity: (name: string) => void;
  onRemoveCommodity: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const RateCardModal: React.FC<ModalProps> = ({
  editingCard, formData, loading, activeCommodity, commodityToAdd,
  onChange, onLocationChange, onContainerPriceChange,
  onCommodityToAddChange, onAddCommodity, onSelectCommodity, onRemoveCommodity,
  onSubmit, onClose,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(10,22,50,0.65)', backdropFilter: 'blur(2px)' }}
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ background: '#66a55f' }}>
        <h3 className="text-white font-bold text-base">
          {editingCard ? 'Edit Rate Card' : 'Add Rate Card'}
        </h3>
        <button onClick={onClose} className="text-slate-100 hover:text-white transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <form onSubmit={onSubmit} className="overflow-y-auto flex-1 px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Origin / Destination */}
          <div>
            <FieldLabel required>Origin </FieldLabel>
            <LocationSearch
              label=""
              value={formData.origin}
              onChange={loc => onLocationChange('origin', loc)}
              required
              placeholder="Origin Port"
            />
          </div>
          <div>
            <FieldLabel required>Destination</FieldLabel>
            <LocationSearch
              label=""
              value={formData.destination}
              onChange={loc => onLocationChange('destination', loc)}
              required
              placeholder="Destination Port"
            />
          </div>

          {/* Transport Mode / Service / Currency */}
          {([
            { label: 'Transport Mode', name: 'mode',     options: TRANSPORT_MODES },
            { label: 'Service',        name: 'service',  options: SERVICE_LEVELS  },
            { label: 'Currency',       name: 'currency', options: CURRENCIES      },
          ] as const).map(({ label, name, options }) => (
            <div key={name}>
              <FieldLabel required>{label}</FieldLabel>
              <select
                name={name}
                value={formData[name as keyof RateCardFormData] as string}
                onChange={onChange}
                className={inputCls}
                required
              >
                {(options as Option[]).map(o => (
                  <option key={o.value ?? o.name} value={o.value ?? o.name}>
                    {o.label ?? o.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* ── Local charge: commodity is the parent of Import/Export container-type pricing ── */}
        {formData.service === 'local_charge' && (
          <div className="mt-4 space-y-4">
            <CommodityPicker
              containers={formData.containers}
              commodityToAdd={commodityToAdd}
              activeCommodity={activeCommodity}
              onCommodityToAddChange={onCommodityToAddChange}
              onAddCommodity={onAddCommodity}
              onSelectCommodity={onSelectCommodity}
              onRemoveCommodity={onRemoveCommodity}
            />

            {activeCommodity && formData.containers[activeCommodity] && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Editing pricing for <span className="font-semibold text-slate-700">{activeCommodity}</span>
                </p>
                {(CLEARANCE_OPTIONS.map(o => o.value) as ClearanceDirection[]).map(direction => (
                  <ContainerPricingGroup
                    key={direction}
                    direction={direction}
                    pricing={formData.containers[activeCommodity][direction]}
                    currency={formData.currency}
                    onPriceChange={(dir, line, type, value) =>
                      onContainerPriceChange(activeCommodity, dir, line, type, value)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Freight fields (unchanged) ── */}
        {formData.service === 'freight' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <FieldLabel required>Freight</FieldLabel>
              <input type="number" name="freight" value={formData.freight}
                onChange={onChange} min={0} step={0.01} required className={inputCls} />
            </div>
            <div>
              <FieldLabel required>OTHC</FieldLabel>
              <input type="number" name="othc" value={formData.othc}
                onChange={onChange} min={0} step={0.01} required className={inputCls} />
            </div>
          </div>
        )}

        {/* Remark */}
        <div className="mt-4">
          <FieldLabel>Remark</FieldLabel>
          <textarea
            rows={2}
            name="remark"
            value={formData.remark}
            onChange={onChange}
            placeholder="e.g. Subject to space availability"
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* Rate preview */}
        {formData.service === 'freight' && formData.freight > 0 && (
          <div className="mt-4 p-3 rounded-lg border text-sm" style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}>
            <p className="text-xs font-semibold text-blue-600 mb-1">Preview for customers</p>
            <p className="font-bold text-blue-800">
              Freight: {formatCurrency(formData.freight, formData.currency)} &nbsp;·&nbsp;
              OTHC: {formatCurrency(formData.othc, formData.currency)}
            </p>
          </div>
        )}
      </form>

      {/* Footer */}
      <div className="flex-shrink-0 flex justify-end gap-3 px-6 py-4 border-t bg-slate-50" style={{ borderColor: '#e2e8f0' }}>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-slate-600 border rounded-lg bg-white hover:bg-slate-100 transition-colors"
          style={{ borderColor: '#e2e8f0' }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSubmit as unknown as React.MouseEventHandler}
          disabled={loading}
          className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-50"
          style={{ background: '#66a55f' }}
        >
          {loading ? 'Saving…' : editingCard ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  </div>
);

// ── Pricing detail modal (read-only view of a rate card's commodities) ──
const PricingDetailModal = ({
  card,
  onClose,
}: {
  card: RateCard;
  onClose: () => void;
}) => {
  const containers = card.containers ?? {};
  const names = Object.keys(containers);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,22,50,0.65)', backdropFilter: 'blur(2px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ background: '#1B4F8A' }}>
          <div>
            <h3 className="text-white font-bold text-base">Commodity Pricing</h3>
            <p className="text-blue-100 text-xs mt-0.5">{card.origin} → {card.destination}</p>
          </div>
          <button onClick={onClose} className="text-slate-100 hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {names.length === 0 ? (
            <p className="text-sm text-slate-400">No commodity pricing set for this rate card.</p>
          ) : (
            names.map(name => (
              <div key={name}>
                <p className="text-sm font-bold mb-3" style={{ color: '#0A1628' }}>{name}</p>
                <div className="space-y-3">
                  {(['export', 'import'] as ClearanceDirection[]).map(direction => {
                    const pricing = containers[name][direction];
                    const containerTypes = CONTAINER_TYPE_OPTIONS[direction];
                    const rows = containerTypes.filter(
                      t => (pricing.clearance[t] ?? 0) > 0 || (pricing.trucking[t] ?? 0) > 0
                    );
                    if (rows.length === 0) return null;

                    return (
                      <div key={direction} className="rounded-xl border p-3" style={{ borderColor: '#e2e8f0' }}>
                        <p
                          className="text-xs font-bold uppercase tracking-wider mb-2"
                          style={{ color: direction === 'export' ? '#1B4F8A' : '#66a55f' }}
                        >
                          {direction === 'export' ? 'Export' : 'Import'}
                        </p>
                        <table className="w-full text-xs">
                          <thead>
                            <tr>
                              <th className="text-left font-semibold text-slate-500 pb-1.5 pr-2">Container</th>
                              <th className="text-right font-semibold text-slate-500 pb-1.5 pr-2">Clearance</th>
                              <th className="text-right font-semibold text-slate-500 pb-1.5">Trucking</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map(type => (
                              <tr key={type} style={{ borderTop: '1px solid #f1f5f9' }}>
                                <td className="py-1.5 pr-2 font-semibold text-slate-700">{type}</td>
                                <td className="py-1.5 pr-2 text-right font-mono text-slate-600">
                                  {formatCurrency(pricing.clearance[type] ?? 0, card.currency)}
                                </td>
                                <td className="py-1.5 text-right font-mono text-slate-600">
                                  {formatCurrency(pricing.trucking[type] ?? 0, card.currency)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ── Container pricing summary (table cell) ───────────────────────────
// Commodity is the parent, so a rate card can carry pricing for many
// commodities at once — show a compact "N commodities" button that opens
// the full read-only detail modal instead of relying on a cramped tooltip.
const ContainerPricingSummary = ({
  card,
  onView,
}: {
  card: RateCard;
  onView: () => void;
}) => {
  const count = Object.keys(card.containers ?? {}).length;
  if (count === 0) return <span className="text-slate-300">—</span>;

  return (
    <button
      type="button"
      onClick={onView}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors hover:bg-blue-50"
      style={{ borderColor: '#e2e8f0', color: '#1B4F8A' }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      {count} {count === 1 ? 'commodity' : 'commodities'}
    </button>
  );
};

// ── Main AdminPanel ───────────────────────────────────────────────────
const EMPTY_FORM: RateCardFormData = {
  origin: '', destination: '', mode: 'road', service: 'local_charge',
  containers: {},
  freight: 0, othc: 0, currency: 'USD', remark: '',
};

const AdminPanel: React.FC = () => {
  const { loading, error, rateCards, createRateCard, updateRateCard, deleteRateCard } =
    useRateCards(true);
  useCommodities(true); // kept mounted to warm the commodities list used by CommoditySearch's own hook/service

  const [editingCard, setEditingCard] = useState<RateCard | null>(null);
  const [showModal,   setShowModal]   = useState(false);
  const [viewingCard, setViewingCard] = useState<RateCard | null>(null);
  const [formData,    setFormData]    = useState<RateCardFormData>(EMPTY_FORM);

  // Which commodity's Import/Export pricing grid is currently shown/edited,
  // and which commodity is picked in the search box ready to be added.
  const [activeCommodity, setActiveCommodity] = useState('');
  const [commodityToAdd,  setCommodityToAdd]  = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['freight', 'othc'].includes(name)
        ? parseFloat(value) || 0
        : value,
    }));
  };

  // Adds the commodity picked in the search box as a newly-priced commodity
  // on this rate card (parent), scaffolding an empty Import/Export grid for
  // it, and makes it the active commodity being edited.
  const handleAddCommodity = () => {
    if (!commodityToAdd) return;
    const name = commodityToAdd;
    setFormData(prev => ({
      ...prev,
      containers: {
        ...prev.containers,
        [name]: prev.containers[name] ?? emptyDirectionPricing(),
      },
    }));
    setActiveCommodity(name);
    setCommodityToAdd('');
  };

  const handleRemoveCommodity = (name: string) => {
    setFormData(prev => {
      const next = { ...prev.containers };
      delete next[name];
      return { ...prev, containers: next };
    });
    setActiveCommodity(prev => (prev === name ? '' : prev));
  };

  // Updates a single container-type price for the given commodity. Commodity
  // is the parent; clearance direction (export/import) shares its price down
  // into the two cost lines (clearance & trucking), each keyed by container type.
  const handleContainerPriceChange = (
    commodity: string,
    direction: ClearanceDirection,
    line: CostLine,
    type: ContainerType,
    value: number,
  ) => {
    setFormData(prev => ({
      ...prev,
      containers: {
        ...prev.containers,
        [commodity]: {
          ...prev.containers[commodity],
          [direction]: {
            ...prev.containers[commodity][direction],
            [line]: {
              ...prev.containers[commodity][direction][line],
              [type]: value,
            },
          },
        },
      },
    }));
  };

  const handleLocationChange = (name: string, location: Location) => {
    // Only update name field to avoid overwriting valid data mid-type
    setFormData(prev => ({ ...prev, [name]: location.name }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateRateCard(formData);
    if (errs.length > 0) { showError(errs[0].message); return; }

    const ok = editingCard
      ? await updateRateCard(editingCard._id, formData)
      : await createRateCard(formData);

    if (ok) {
      setShowModal(false); setEditingCard(null); setFormData(EMPTY_FORM);
      setActiveCommodity(''); setCommodityToAdd('');
    }
  };

  const openCreate = () => {
    setEditingCard(null); setFormData(EMPTY_FORM);
    setActiveCommodity(''); setCommodityToAdd('');
    setShowModal(true);
  };

  const openEdit = (card: RateCard) => {
    setEditingCard(card);
    const containers = card.containers ?? {};
    setFormData({
      origin: card.origin, destination: card.destination,
      mode: card.mode, service: card.service,
      containers,
      freight: card.freight, othc: card.othc,
      currency: card.currency, remark: card.remark,
    });
    setActiveCommodity(Object.keys(containers)[0] ?? '');
    setCommodityToAdd('');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this rate card?')) return;
    await deleteRateCard(id);
  };

  if (loading && rateCards.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading rate cards…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#0A1628' }}>Rate Card Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage pricing by route, transport &amp; service type</p>
        </div>
        <button
          onClick={openCreate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-50"
          style={{ background: '#1B4F8A' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Rate Card
        </button>
      </div>

      {error && (
        <div className="flex gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0 mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm" style={{ borderColor: '#e2e8f0' }}>
        {rateCards.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 mx-auto mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            <p className="text-sm">No rate cards yet.</p>
            <button onClick={openCreate} className="mt-3 text-sm font-medium" style={{ color: '#1B4F8A' }}>
              Add your first rate card →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Origin', 'Destination', 'Mode', 'Service', 'Commodity Pricing (Import/Export)', 'Freight', 'OTHC', 'Remark', 'Currency', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rateCards.map((card, i) => (
                  <tr
                    key={card._id}
                    style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 1 ? '#fafafa' : 'white' }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">{card.origin}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">{card.destination}</span>
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-600 text-xs">{card.mode}</td>
                    <td className="px-4 py-3"><ServiceBadge service={card.service} /></td>

                    {/* Compact "N commodities" button; non-local_charge rows show N/A. */}
                    <td className="px-4 py-3 text-slate-700 text-xs">
                      {card.service === 'local_charge'
                        ? <ContainerPricingSummary card={card} onView={() => setViewingCard(card)} />
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700 font-mono text-xs">
                      {card.service === 'freight' ? formatCurrency(card.freight, card.currency) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700 font-mono text-xs">
                      {card.service === 'freight' ? formatCurrency(card.othc, card.currency) : <span className="text-slate-300">—</span>}
                    </td>

                    <td className="px-4 py-3 text-slate-500 text-xs max-w-[160px] truncate">{card.remark || '—'}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-600">{card.currency}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(card)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-green-100"
                          title="Edit"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={1.5} className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(card._id)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-red-100"
                          title="Delete"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={1.5} className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {loading && rateCards.length > 0 && (
          <div className="flex justify-center py-4 border-t" style={{ borderColor: '#e2e8f0' }}>
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Edit / Create modal */}
      {showModal && (
        <RateCardModal
          editingCard={editingCard}
          formData={formData}
          loading={loading}
          activeCommodity={activeCommodity}
          commodityToAdd={commodityToAdd}
          onChange={handleInputChange}
          onLocationChange={handleLocationChange}
          onContainerPriceChange={handleContainerPriceChange}
          onCommodityToAddChange={setCommodityToAdd}
          onAddCommodity={handleAddCommodity}
          onSelectCommodity={setActiveCommodity}
          onRemoveCommodity={handleRemoveCommodity}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false); setEditingCard(null); setFormData(EMPTY_FORM);
            setActiveCommodity(''); setCommodityToAdd('');
          }}
        />
      )}

      {/* Read-only pricing detail modal */}
      {viewingCard && (
        <PricingDetailModal card={viewingCard} onClose={() => setViewingCard(null)} />
      )}
    </div>
  );
};

export default AdminPanel;