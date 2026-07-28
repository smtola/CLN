import { useState, useCallback, useEffect } from 'react';
import portService from '../services/portService';
import type { Port, PortFormData } from '../types/port.types';
import axios from 'axios';

export const usePorts = (autoFetch: boolean = false) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ports, setPorts] = useState<Port[]>([]);

  const fetchPorts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await portService.getAllPorts();
      setPorts(result);
    } catch (err: unknown) {
      let errorMessage = 'Failed to fetch ports';

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

  const createPort = useCallback(async (data: PortFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await portService.createPort(data);
      await fetchPorts();
      return true;
    } catch (err: unknown) {
      let errorMessage = 'Failed to create port';

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
  }, [fetchPorts]);

  const updatePort = useCallback(async (id: string, data: Partial<PortFormData>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await portService.updatePort(id, data);
      await fetchPorts();
      return true;
    } catch (err: unknown) {
      let errorMessage = 'Failed to update port';

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
  }, [fetchPorts]);

  const deletePort = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await portService.deletePort(id);
      await fetchPorts();
      return true;
    } catch (err: unknown) {
      let errorMessage = 'Failed to delete port';

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
  }, [fetchPorts]);

  useEffect(() => {
    if (autoFetch) {
      fetchPorts();
    }
  }, [autoFetch, fetchPorts]);

  return {
    loading,
    error,
    ports,
    fetchPorts,
    createPort,
    updatePort,
    deletePort,
  };
};
