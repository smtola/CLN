import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import quoteService from '../services/quoteService';
import type { Commodity } from '../types/common.types';

interface CommoditySearchProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const CommoditySearch: React.FC<CommoditySearchProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Search for commodity',
  required = false,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [suggestions, setSuggestions] = useState<Commodity[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const hasSelectedRef = useRef(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Keep ref in sync with state
  useEffect(() => {
    hasSelectedRef.current = hasSelected;
  }, [hasSelected]);

  const searchCommodities = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const results: Commodity[] = await quoteService.searchCommodities(query); // API should return Commodity[]
      setSuggestions(results);
      // Only show suggestions if we haven't selected yet and have results
      if (results.length > 0 && !hasSelectedRef.current) {
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('Failed to fetch commodities:', err);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm.length >= 2 && !disabled) {
      searchCommodities(debouncedSearchTerm);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearchTerm, disabled, searchCommodities]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setHasSelected(false); // Reset selection when user types
    hasSelectedRef.current = false; // Update ref immediately
    onChange(newValue);
  };

  const handleSelect = (commodity: Commodity) => {
    setSearchTerm(commodity.name);
    onChange(commodity.name);
    setSuggestions([]);
    setShowSuggestions(false);
    setHasSelected(true); // Mark that a selection was made
    hasSelectedRef.current = true; // Update ref immediately
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow click
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleFocus = () => {
    // Only show suggestions if we have results and haven't selected yet
    if (suggestions.length > 0 && !hasSelected) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="form-control w-full relative">
      <label className="label">
        <span className="label-text">{label}</span>
        {required && <span className="label-text-alt text-error">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={disabled ? 'Fill origin and destination first' : placeholder}
          className="w-full bg-gray-100 p-2 rounded"
          required={required}
          disabled={disabled}
        />
        {loading && (
          <span className="absolute right-3 top-3 loading loading-spinner loading-sm"></span>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-base-100 shadow-lg rounded-lg border border-base-300 max-h-60 overflow-y-auto top-full">
          {suggestions.map((item, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-base-200 cursor-pointer border-b border-base-200 last:border-b-0"
              onClick={() => handleSelect(item)}
            >
             (HS CODE: {item.code}) <b className='text-blue-600'>{item.name}</b> | {item.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommoditySearch;
