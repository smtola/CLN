import { useState, useCallback, useEffect } from 'react';
import rateCardService from '../services/rateCardService';
import type { RateCard, RateCardFormData } from '../types/rateCard.types';
import axios from 'axios';

export const useRateCards = (autoFetch: boolean = false) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateCards, setRateCards] = useState<RateCard[]>([]);

  const fetchRateCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await rateCardService.getAllRateCards();
      setRateCards(result);
    }  catch (err: unknown) {
      let errorMessage = 'Failed to fetch rate card';
    
      if (axios.isAxiosError(err)) {
        errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          errorMessage;
      }
    
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createRateCard = useCallback(async (data: RateCardFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await rateCardService.createRateCard(data);
      await fetchRateCards();
      return true;
    } catch (err: unknown) {
      let errorMessage = 'Failed to create rate card';
    
      if (axios.isAxiosError(err)) {
        errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          errorMessage;
      }
    
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchRateCards]);

  const updateRateCard = useCallback(async (id: string, data: Partial<RateCardFormData>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await rateCardService.updateRateCard(id, data);
      await fetchRateCards();
      return true;
    } catch (err: unknown) {
      let errorMessage = 'Failed to update rate card';
    
      if (axios.isAxiosError(err)) {
        errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          errorMessage;
      }
    
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchRateCards]);

  const deleteRateCard = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await rateCardService.deleteRateCard(id);
      await fetchRateCards();
      return true;
    } catch (err: unknown) {
      let errorMessage = 'Failed to deleted rate card';
    
      if (axios.isAxiosError(err)) {
        errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          errorMessage;
      }
    
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchRateCards]);

  useEffect(() => {
    if (autoFetch) {
      fetchRateCards();
    }
  }, [autoFetch, fetchRateCards]);

  return {
    loading,
    error,
    rateCards,
    fetchRateCards,
    createRateCard,
    updateRateCard,
    deleteRateCard,
  };
};