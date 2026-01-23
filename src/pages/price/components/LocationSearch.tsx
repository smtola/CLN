import React, { useState, useEffect, useCallback, useRef } from 'react';
import quoteService from '../services/quoteService';
import type { Location } from '../types/common.types';
import { useDebounce } from '../hooks/useDebounce';

interface LocationSearchProps {
  label: string;
  value: string;
  onChange: (location: Location) => void; // pass full location
  placeholder?: string;
  required?: boolean;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Enter location',
  required = false,
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const hasSelectedRef = useRef(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Keep ref in sync with state
  useEffect(() => {
    hasSelectedRef.current = hasSelected;
  }, [hasSelected]);

  const searchLocations = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const results = await quoteService.searchLocations(query);
      setSuggestions(results);
      // Only show suggestions if we haven't selected yet and have results
      if (results.length > 0 && !hasSelectedRef.current) {
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Failed to search locations:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.length >= 2) {
      searchLocations(debouncedSearchTerm);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearchTerm, searchLocations]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setHasSelected(false); // Reset selection when user types
    hasSelectedRef.current = false; // Update ref immediately
    // Optionally pass partial location (just name) for live validation
    // Pass a temporary Location object with empty required fields
    onChange({
      name: newValue,
      code: '',
      country: '',
      city: '',
      type: '',
      lat: 0,
      lon: 0,
    });
  };

  const handleSelectSuggestion = (location: Location) => {
    setSearchTerm(location.name);
    onChange(location); // Pass the full location object
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
    <div className="flex form-control w-full relative">
      <label className="space-x-1">
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
          placeholder={placeholder}
          className="w-full bg-gray-100 p-2 rounded"
          required={required}
        />
        {loading && (
          <span className="absolute right-3 top-3 loading loading-spinner loading-sm"></span>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-base-100 shadow-lg rounded-lg border border-base-300 max-h-60 overflow-y-auto top-full">
          {suggestions.map((location, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-base-200 cursor-pointer border-b border-base-200 last:border-b-0"
              onClick={() => handleSelectSuggestion(location)}
            >
              <div className="font-medium text-sm">{location.name}</div>
              <div className="text-xs opacity-60">
                CODE: {location.code} | {location.country}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
