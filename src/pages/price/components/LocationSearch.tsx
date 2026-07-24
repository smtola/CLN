// ── LocationSearch.tsx ────────────────────────────────────────────────
import React, { useState, useEffect, useCallback, useRef } from 'react';
import quoteService from '../services/quoteService';
import type { Location } from '../types/common.types';
import { useDebounce } from '../hooks/useDebounce';

interface LocationSearchProps {
  label:        string;
  value:        string;
  onChange:     (location: Location) => void;
  placeholder?: string;
  required?:    boolean;
}

const inputCls =
  'w-full px-3 py-2.5 rounded-lg border text-sm bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all';

const LocationSearch: React.FC<LocationSearchProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Enter location',
  required    = false,
}) => {
  const [searchTerm,      setSearchTerm]      = useState(value);
  const [suggestions,     setSuggestions]     = useState<Location[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [hasSelected,     setHasSelected]     = useState(false);
  const hasSelectedRef = useRef(false);
  const debouncedTerm  = useDebounce(searchTerm, 500);

  useEffect(() => { hasSelectedRef.current = hasSelected; }, [hasSelected]);

  const searchLocations = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const results = await quoteService.searchLocations(query);
      setSuggestions(results);
      if (results.length > 0 && !hasSelectedRef.current) setShowSuggestions(true);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedTerm && debouncedTerm.length >= 2) {
      searchLocations(debouncedTerm);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedTerm, searchLocations]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearchTerm(v);
    setHasSelected(false);
    hasSelectedRef.current = false;
    // FIX: don't call onChange with empty Location fields while typing,
    // only update the display name so parent doesn't overwrite valid data.
    // Parent should treat partial input as unvalidated.
  };

  const handleSelect = (location: Location) => {
    setSearchTerm(location.name);
    onChange(location);
    setSuggestions([]);
    setShowSuggestions(false);
    setHasSelected(true);
    hasSelectedRef.current = true;
  };

  const handleBlur  = () => setTimeout(() => setShowSuggestions(false), 200);
  const handleFocus = () => { if (suggestions.length > 0 && !hasSelected) setShowSuggestions(true); };

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Search icon */}
        <svg
          viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        >
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={`${inputCls} pl-9 pr-8`}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border overflow-hidden"
          style={{ borderColor: '#e2e8f0', maxHeight: 240, overflowY: 'auto' }}
        >
          {suggestions.map((loc, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => handleSelect(loc)}
              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors border-b last:border-b-0"
              style={{ borderColor: '#f1f5f9' }}
            >
              <p className="text-sm font-semibold text-slate-800">{loc.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {loc.code} · {loc.country} · <span className="capitalize">{loc.type}</span>
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export { LocationSearch };
export default LocationSearch;