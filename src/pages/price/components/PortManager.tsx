import React, { useState, useEffect } from 'react';
import { usePorts } from '../hooks/usePorts';
import type { Port, PortFormData, PortType } from '../types/port.types';
import { PORT_TYPES, DEFAULT_PAGINATION } from '../utils/constants';
import { showSuccess, showError, confirmDelete } from '../../../admin/utils/swalHelper';
import { importFromGoogleMapsUrl, isGoogleMapsUrl, type ParsedMapLocation } from '../utils/googleMapsImport';

const PAGE_SIZE = DEFAULT_PAGINATION.limit;

// ── Shared input style (matches AdminPanel / RateCard form) ────────────
const inputCls =
  'w-full px-3 py-2.5 rounded-lg border text-sm bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all';

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>
    {children}
  </label>
);

// ── Live map preview for the Lat/Lon fields ─────────────────────────────
// Uses OpenStreetMap's embeddable export view — no API key required. Shows
// a pin at the current coordinates so an admin can visually sanity-check a
// port's location before saving (catches swapped/mistyped lat-lon, a wrong
// hemisphere, etc.).
const isValidLatLon = (lat: number, lon: number): boolean =>
  Number.isFinite(lat) && Number.isFinite(lon) &&
  !(lat === 0 && lon === 0) &&
  lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;

const MapPreview = ({
  lat, lon, name, onExpand,
}: {
  lat: number; lon: number; name: string; onExpand: () => void;
}) => {
  const valid = isValidLatLon(lat, lon);

  if (!valid) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border text-xs text-slate-400 bg-slate-50"
        style={{ borderColor: '#e2e8f0', height: 220 }}
      >
        Enter a valid latitude (−90 to 90) and longitude (−180 to 180) to preview the location on a map.
      </div>
    );
  }

  // Small bounding box around the point for a reasonably zoomed-in view.
  const delta = 0.02;
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  const embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
      <iframe
        key={`${lat},${lon}`}
        title={`Map preview${name ? ` — ${name}` : ''}`}
        src={embedSrc}
        width="100%"
        height={220}
        style={{ border: 0, display: 'block' }}
        loading="lazy"
      />
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 text-xs" style={{ borderTop: '1px solid #e2e8f0' }}>
        <span className="text-slate-500">{lat.toFixed(5)}, {lon.toFixed(5)}</span>
        <button type="button" onClick={onExpand} className="font-medium" style={{ color: '#1B4F8A' }}>
          Expand map ↗
        </button>
      </div>
    </div>
  );
};

// ── In-app "larger map" popup ───────────────────────────────────────
// Replaces navigating out to openstreetmap.org: this stays inside the app
// as its own modal, same overlay/close pattern as the Add/Edit Port modal.
const LargeMapModal = ({
  lat, lon, name, onClose,
}: {
  lat: number; lon: number; name: string; onClose: () => void;
}) => {
  const delta = 0.06;
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  const embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(10,22,40,0.6)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#e2e8f0' }}>
          <div>
            <h3 className="text-base font-bold" style={{ color: '#0A1628' }}>{name || 'Location'}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{lat.toFixed(5)}, {lon.toFixed(5)}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        <iframe
          title={`Map${name ? ` — ${name}` : ''}`}
          src={embedSrc}
          width="100%"
          height={480}
          style={{ border: 0, display: 'block' }}
        />
      </div>
    </div>
  );
};

const PORT_TYPE_COLORS: Record<PortType, string> = {
  sea: 'bg-blue-50 text-blue-700',
  air: 'bg-purple-50 text-purple-700',
  road: 'bg-amber-50 text-amber-700'
};

const portTypeLabel = (type: PortType): string =>
  PORT_TYPES.find(t => t.value === type)?.label ?? type;

const PortTypeBadge = ({ type }: { type: PortType }) => (
  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${PORT_TYPE_COLORS[type] ?? 'bg-slate-100 text-slate-600'}`}>
    {portTypeLabel(type)}
  </span>
);

const EMPTY_FORM: PortFormData = {
  name: '',
  code: '',
  city: '',
  country: '',
  type: 'sea',
  lat: 0,
  lon: 0,
};

// ── "Paste a Google Maps link" auto-fill ────────────────────────────────
// Drop in a Google Maps URL (a full share link, a shortened maps.app.goo.gl
// link, or just a pin's address-bar URL) and this fills in Name, Code,
// Type, City, Country, Latitude and Longitude below — the admin just
// reviews/adjusts what came back before saving. See googleMapsImport.ts
// for how each field is derived.
const GoogleMapsImportField = ({
  onImport,
}: {
  onImport: (data: ParsedMapLocation) => void;
}) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filledCount, setFilledCount] = useState<number | null>(null);

  const handleFetch = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setFilledCount(null);
    try {
      const parsed = await importFromGoogleMapsUrl(trimmed);
      onImport(parsed);
      const count = Object.values(parsed).filter(v => v !== undefined && v !== '').length;
      setFilledCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that link.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFetch();
    }
  };

  return (
    <div className="sm:col-span-2 rounded-xl border p-3" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
      <FieldLabel>Import from Google Maps</FieldLabel>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          value={url}
          onChange={e => { setUrl(e.target.value); setError(null); setFilledCount(null); }}
          onKeyDown={handleKeyDown}
          placeholder="Paste a Google Maps link, e.g. https://maps.app.goo.gl/CLoDRVVcwHWPHUfQ6"
          className={inputCls + ' flex-1'}
        />
        <button
          type="button"
          onClick={handleFetch}
          disabled={loading || !url.trim() || !isGoogleMapsUrl(url.trim())}
          className="px-4 py-2.5 text-sm font-semibold rounded-lg text-white transition-colors disabled:opacity-50 whitespace-nowrap"
          style={{ background: '#1B4F8A' }}
        >
          {loading ? 'Fetching…' : 'Auto-fill'}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      {!error && filledCount !== null && (
        <p className="text-xs mt-2" style={{ color: '#0F9D58' }}>
          Filled {filledCount} field{filledCount === 1 ? '' : 's'} below from that link — double-check them before saving.
        </p>
      )}
      <p className="text-xs text-slate-400 mt-2">
        Works with full google.com/maps links and shortened maps.app.goo.gl links. City, country and type are
        a best guess from the pin's coordinates — always review before saving.
      </p>
    </div>
  );
};

// ── Form modal ───────────────────────────────────────────────────────
interface ModalProps {
  editingPort: Port | null;
  formData: PortFormData;
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onExpandMap: () => void;
  onImport: (data: ParsedMapLocation) => void;
}

const PortFormModal: React.FC<ModalProps> = ({ editingPort, formData, loading, onChange, onSubmit, onClose, onExpandMap, onImport }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(10,22,40,0.5)' }}>
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#e2e8f0' }}>
        <h3 className="text-lg font-bold" style={{ color: '#0A1628' }}>
          {editingPort ? 'Edit Port' : 'Add Port'}
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GoogleMapsImportField onImport={onImport} />

          <div className="sm:col-span-2">
            <FieldLabel>Port / Location Name *</FieldLabel>
            <input
              type="text" name="name" required
              value={formData.name} onChange={onChange}
              placeholder="e.g. Phnom Penh Autonomous Port"
              className={inputCls}
            />
          </div>

          <div>
            <FieldLabel>Code *</FieldLabel>
            <input
              type="text" name="code" required
              value={formData.code} onChange={onChange}
              placeholder="UN/LOCODE or IATA, e.g. KHPNH"
              className={inputCls}
            />
          </div>

          <div>
            <FieldLabel>Type *</FieldLabel>
            <select name="type" required value={formData.type} onChange={onChange} className={inputCls}>
              {PORT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>City *</FieldLabel>
            <input
              type="text" name="city" required
              value={formData.city} onChange={onChange}
              placeholder="e.g. Phnom Penh"
              className={inputCls}
            />
          </div>

          <div>
            <FieldLabel>Country *</FieldLabel>
            <input
              type="text" name="country" required
              value={formData.country} onChange={onChange}
              placeholder="e.g. Cambodia"
              className={inputCls}
            />
          </div>

          <div>
            <FieldLabel>Latitude *</FieldLabel>
            <input
              type="number" name="lat" required step="any"
              value={formData.lat} onChange={onChange}
              placeholder="e.g. 11.5564"
              className={inputCls}
            />
          </div>

          <div>
            <FieldLabel>Longitude *</FieldLabel>
            <input
              type="number" name="lon" required step="any"
              value={formData.lon} onChange={onChange}
              placeholder="e.g. 104.9282"
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <FieldLabel>Map Preview</FieldLabel>
            <MapPreview lat={formData.lat} lon={formData.lon} name={formData.name} onExpand={onExpandMap} />
          </div>
        </div>

        <p className="text-xs text-slate-400">
          This is exactly what customers will see and search by on the quote form's Origin / Destination fields —
          use a name, code, city and country your customers will recognize.
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button" onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors hover:bg-slate-100"
            style={{ borderColor: '#e2e8f0', color: '#475569' }}
          >
            Cancel
          </button>
          <button
            type="submit" disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-50"
            style={{ background: '#1B4F8A' }}
          >
            {loading ? 'Saving…' : editingPort ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  </div>
);

// ── Pagination (client-side — ports are fetched in full, same as Rate
// Cards, then sliced per page; mirrors QuoteHistory's server-paginated UI) ──
const Pagination = ({
  page,
  pages,
  loading,
  onPage,
}: {
  page: number;
  pages: number;
  loading: boolean;
  onPage: (p: number) => void;
}) => {
  if (pages <= 1) return null;
  const btnCls = (disabled: boolean) =>
    `px-3 py-1.5 text-sm rounded-lg border transition-colors ${
      disabled
        ? 'opacity-40 cursor-not-allowed'
        : 'hover:bg-slate-100 cursor-pointer'
    }`;
  return (
    <div className="flex items-center justify-end gap-2 px-4 py-3" style={{ borderTop: '1px solid #f1f5f9' }}>
      <button
        className={btnCls(page === 1 || loading)}
        disabled={page === 1 || loading}
        onClick={() => onPage(page - 1)}
        style={{ borderColor: '#e2e8f0', color: '#475569' }}
      >
        ‹ Prev
      </button>
      <span className="px-3 py-1.5 text-sm text-slate-600">
        {page} / {pages}
      </span>
      <button
        className={btnCls(page === pages || loading)}
        disabled={page === pages || loading}
        onClick={() => onPage(page + 1)}
        style={{ borderColor: '#e2e8f0', color: '#475569' }}
      >
        Next ›
      </button>
    </div>
  );
};

// ── Main component ──────────────────────────────────────────────────
const PortManager: React.FC = () => {
  const { loading, error, ports, createPort, updatePort, deletePort } = usePorts(true);

  const [editingPort, setEditingPort] = useState<Port | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [viewingMap, setViewingMap] = useState<{ lat: number; lon: number; name: string } | null>(null);
  const [formData, setFormData] = useState<PortFormData>(EMPTY_FORM);

  // Search + country/type filters. Ports are fetched in full (no server
  // pagination), so filtering happens client-side — same pattern as the
  // Rate Card table.
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<PortType | ''>('');

  const filteredPorts = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return ports.filter(port => {
      if (term) {
        const haystack = [port.name, port.code, port.city, port.country].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (countryFilter && port.country.toLowerCase() !== countryFilter.toLowerCase()) return false;
      if (typeFilter && port.type !== typeFilter) return false;
      return true;
    });
  }, [ports, search, countryFilter, typeFilter]);

  const hasActiveFilters = Boolean(search || countryFilter || typeFilter);
  const clearFilters = () => { setSearch(''); setCountryFilter(''); setTypeFilter(''); };

  // Client-side pagination over the filtered results — ports are fetched in
  // full (no server pagination), same as Rate Cards, so we page in-memory.
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(filteredPorts.length / PAGE_SIZE));
  const pagedPorts = React.useMemo(
    () => filteredPorts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredPorts, page]
  );

  // Reset to page 1 whenever the search/filters change, and clamp down if
  // the current page no longer exists (e.g. after a delete empties the last page).
  useEffect(() => { setPage(1); }, [search, countryFilter, typeFilter]);
  useEffect(() => { setPage(p => Math.min(p, pageCount)); }, [pageCount]);

  // Distinct countries currently on file, for the filter dropdown.
  const countryOptions = React.useMemo(
    () => Array.from(new Set(ports.map(p => p.country))).sort(),
    [ports]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['lat', 'lon'].includes(name) ? parseFloat(value) || 0 : value,
    }));
  };

  const openCreate = () => {
    setEditingPort(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  // Merge whatever fields importFromGoogleMapsUrl() could confidently derive
  // into the open form — undefined fields (e.g. no IATA/UN-LOCODE found) are
  // left as-is so we never clobber something the admin already typed.
  const handleImport = (data: ParsedMapLocation) => {
    setFormData(prev => ({
      ...prev,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.code !== undefined && { code: data.code }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.country !== undefined && { country: data.country }),
      lat: data.lat,
      lon: data.lon,
    }));
  };

  const openEdit = (port: Port) => {
    setEditingPort(port);
    setFormData({
      name: port.name, code: port.code, city: port.city, country: port.country,
      type: port.type, lat: port.lat, lon: port.lon,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = editingPort
      ? await updatePort(editingPort._id, formData)
      : await createPort(formData);

    if (ok) {
      showSuccess(editingPort ? 'Port updated' : 'Port created');
      setShowModal(false);
    } else {
      showError('Something went wrong', error ?? undefined);
    }
  };

  const handleDelete = async (port: Port) => {
    const confirmed = await confirmDelete(
      'Deactivate this port?',
      `"${port.name}" will no longer appear in Origin/Destination search results.`,
      'Yes, deactivate it'
    );
    if (!confirmed) return;
    const ok = await deletePort(port._id);
    if (ok) showSuccess('Port deactivated');
  };

  if (loading && ports.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading ports…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-b-4">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#0A1628' }}>Port Manager</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage the seaports, airports and locations customers can pick as Origin / Destination
          </p>
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
          Add Port
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

      {/* Search + filters */}
      <div className="bg-white rounded-xl border shadow-sm p-4" style={{ borderColor: '#e2e8f0' }}>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1 min-w-[180px]">
            <FieldLabel>Search</FieldLabel>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Name, code, or city…"
              className={inputCls}
            />
          </div>
          <div>
            <FieldLabel>Country</FieldLabel>
            <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} className={inputCls}>
              <option value="">All countries</option>
              {countryOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>Type</FieldLabel>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as PortType | '')} className={inputCls}>
              <option value="">All types</option>
              {PORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors hover:bg-slate-100"
              style={{ borderColor: '#e2e8f0', color: '#475569' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm" style={{ borderColor: '#e2e8f0' }}>
        {filteredPorts.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 mx-auto mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {hasActiveFilters ? (
              <>
                <p className="text-sm">No ports match your search/filters.</p>
                <button onClick={clearFilters} className="mt-3 text-sm font-medium" style={{ color: '#1B4F8A' }}>
                  Clear filters →
                </button>
              </>
            ) : (
              <>
                <p className="text-sm">No ports yet.</p>
                <button onClick={openCreate} className="mt-3 text-sm font-medium" style={{ color: '#1B4F8A' }}>
                  Add your first port →
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Name', 'Code', 'City', 'Country', 'Type', 'Coordinates', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedPorts.map((port, i) => (
                  <tr
                    key={port._id}
                    style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 1 ? '#fafafa' : 'white' }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-slate-800 text-nowrap">{port.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium text-nowrap">{port.code}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs text-nowrap">{port.city}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs text-nowrap">{port.country}</td>
                    <td className="px-4 py-3 text-nowrap"><PortTypeBadge type={port.type} /></td>
                    <td className="px-4 py-3 text-slate-500 text-xs text-nowrap">
                      <button
                        type="button"
                        onClick={() => setViewingMap({ lat: port.lat, lon: port.lon, name: port.name })}
                        className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
                        title="View on map"
                      >
                        {port.lat.toFixed(4)}, {port.lon.toFixed(4)}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEdit(port)}
                          title="Edit port"
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(port)}
                          title="Deactivate port"
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
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

        {filteredPorts.length > 0 && (
          <>
            <div className="px-4 pt-3 text-xs text-slate-400" style={{ borderTop: pageCount > 1 ? undefined : '1px solid #f1f5f9' }}>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredPorts.length)} of {filteredPorts.length} port{filteredPorts.length === 1 ? '' : 's'}
            </div>
            <Pagination page={page} pages={pageCount} loading={loading} onPage={setPage} />
          </>
        )}
      </div>

      {showModal && (
        <PortFormModal
          editingPort={editingPort}
          formData={formData}
          loading={loading}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
          onExpandMap={() => setViewingMap({ lat: formData.lat, lon: formData.lon, name: formData.name })}
          onImport={handleImport}
        />
      )}

      {viewingMap && (
        <LargeMapModal
          lat={viewingMap.lat}
          lon={viewingMap.lon}
          name={viewingMap.name}
          onClose={() => setViewingMap(null)}
        />
      )}
    </div>
  );
};

export default PortManager;
