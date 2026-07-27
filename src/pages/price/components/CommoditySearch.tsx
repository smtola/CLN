// ── LocationSearch.tsx ────────────────────────────────────────────────
import React, { useState, useEffect, useCallback, useRef } from 'react';
import quoteService from '../services/quoteService';
import { useDebounce } from '../hooks/useDebounce';
import type { Commodity } from '../types/common.types';
const inputCls =
  'w-full h-16 px-4 rounded-xl border border-slate-300 text-base bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all';

interface CommoditySearchProps {
  label:       string;
  value:       string;
  onChange:    (value: string) => void;
  placeholder?: string;
  required?:   boolean;
  disabled?:   boolean;
  className?:   string;
}

export const CommoditySearch: React.FC<CommoditySearchProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Search for commodity',
  required    = false,
  disabled    = false,
  className,
}) => {
  const [searchTerm,      setSearchTerm]      = useState(value);
  const [suggestions,     setSuggestions]     = useState<Commodity[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [hasSelected,     setHasSelected]     = useState(false);
  const hasSelectedRef = useRef(false);
  const debouncedTerm  = useDebounce(searchTerm, 100);

  useEffect(() => { hasSelectedRef.current = hasSelected; }, [hasSelected]);

  const searchCommodities = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const results: Commodity[] = await quoteService.searchCommodities(query);
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
    if (debouncedTerm.length >= 2 && !disabled) {
      searchCommodities(debouncedTerm);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedTerm, disabled, searchCommodities]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearchTerm(v);
    setHasSelected(false);
    hasSelectedRef.current = false;
    // Don't call onChange(v) here — typed text isn't a valid commodity yet.
    // Clear the parent's committed value instead, so a stale valid value
    // can't accidentally get submitted after the user starts retyping.
    onChange('');
  };

  const handleSelect = (commodity: Commodity) => {
    setSearchTerm(commodity.name);
    onChange(commodity.name); // only commit here, on explicit selection
    setSuggestions([]);
    setShowSuggestions(false);
    setHasSelected(true);
    hasSelectedRef.current = true;
  };

  const handleBlur  = () => setTimeout(() => setShowSuggestions(false), 50);
  const handleFocus = () => { if (suggestions.length > 0 && !hasSelected) setShowSuggestions(true); };

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={disabled ? 'Fill origin and destination first' : placeholder}
          required={required}
          disabled={disabled}
          className={`${inputCls} pr-8 ${className ?? ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border overflow-hidden"
          style={{ borderColor: '#e2e8f0', maxHeight: 240, overflowY: 'auto' }}
        >
          {suggestions.map((item, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => handleSelect(item)}
              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors border-b last:border-b-0"
              style={{ borderColor: '#f1f5f9' }}
            >
              <p className="text-sm">
                {/* <span className="font-mono text-xs px-1.5 py-0.5 rounded mr-2" style={{ background: '#f1f5f9', color: '#475569' }}>
                  HS {item.code}
                </span> */}
                <span className="font-semibold text-blue-700">{item.name}</span>
              </p>
              {item.description && (
                <p className="text-xs text-slate-400 mt-0.5 truncate">{item.description}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommoditySearch;