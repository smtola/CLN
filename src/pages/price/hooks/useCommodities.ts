import { useState, useCallback, useEffect } from 'react';
import apiService from '../services/api';
import type { Commodity } from '../types/common.types';

// Raw shape returned by the backend (Mongo documents use `_id`, not `id`).
interface RawCommodity {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  code?: string;
  active?: boolean;
}

const normalize = (raw: RawCommodity[]): Commodity[] =>
  (raw || [])
    .filter(c => c.active !== false)
    .map(c => ({
      id: c.id ?? c._id ?? c.name,
      name: c.name,
      description: c.description,
      code: c.code,
    }));

// Commodity is the parent for Import/Export clearance & trucking pricing —
// this hook powers the commodity dropdown on both the rate-card admin panel
// and the customer-facing quote form so they always select from the same
// canonical list.
export const useCommodities = (autoFetch: boolean = true) => {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommodities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await apiService.get<RawCommodity[]>('/commodities');
      setCommodities(normalize(raw));
    } catch {
      setError('Failed to load commodities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchCommodities();
  }, [autoFetch, fetchCommodities]);

  return { commodities, loading, error, fetchCommodities };
};

export default useCommodities;
