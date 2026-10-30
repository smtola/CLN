import BaseApi from '../../../admin/api/baseApi'; // adjust path to your BaseApi file
import type { FreightQuoteRequest, FreightQuoteResponse } from '../types/quote.types';

export const requestFreightQuote = (payload: FreightQuoteRequest) =>
  BaseApi.post<FreightQuoteResponse>('/docs/web/request-quote', payload);