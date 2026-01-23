import type { QuoteRequest } from '../types/quote.types';
import type { RateCardFormData } from '../types/rateCard.types';

export interface ValidationError {
  field: string;
  message: string;
}

/* ===========================
   QUOTE REQUEST VALIDATION
=========================== */
export const validateQuoteRequest = (
  data: Partial<QuoteRequest>
): ValidationError[] => {
  const errors: ValidationError[] = [];

  /* ===== Route ===== */
  if (!data.origin || data.origin.trim().length < 2) {
    errors.push({
      field: 'origin',
      message: 'Origin is required (minimum 2 characters)',
    });
  }

  if (!data.destination || data.destination.trim().length < 2) {
    errors.push({
      field: 'destination',
      message: 'Destination is required (minimum 2 characters)',
    });
  }

  /* ===== Container validation (optional, sea freight) ===== */
  if (data.containerQuantity !== undefined) {
    if (data.containerQuantity <= 0) {
      errors.push({
        field: 'containerQuantity',
        message: 'Container quantity must be greater than 0',
      });
    }
  }

  if (data.containerMaxWeight !== undefined) {
    if (data.containerMaxWeight <= 0) {
      errors.push({
        field: 'containerMaxWeight',
        message: 'Container max weight must be greater than 0',
      });
    }
  }

  if (data.containerQuantity && !data.containerSize) {
    errors.push({
      field: 'containerSize',
      message: 'Container size is required when container quantity is provided',
    });
  }

  return errors;
};

/* ===========================
   RATE CARD VALIDATION
=========================== */
export const validateRateCard = (
  data: Partial<RateCardFormData>
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // if (data.rate_per_km === undefined || data.rate_per_km < 0) {
  //   errors.push({
  //     field: 'rate_per_km',
  //     message: 'Rate per km must be 0 or greater',
  //   });
  // }

  // if (data.rate_per_kg === undefined || data.rate_per_kg < 0) {
  //   errors.push({
  //     field: 'rate_per_kg',
  //     message: 'Rate per kg must be 0 or greater',
  //   });
  // }

  // if (
  //   data.fuel_surcharge === undefined ||
  //   data.fuel_surcharge < 0 ||
  //   data.fuel_surcharge > 100
  // ) {
  //   errors.push({
  //     field: 'fuel_surcharge',
  //     message: 'Fuel surcharge must be between 0 and 100%',
  //   });
  // }

  // if (data.handling_fee === undefined || data.handling_fee < 0) {
  //   errors.push({
  //     field: 'handling_fee',
  //     message: 'Handling fee must be 0 or greater',
  //   });
  // }

  if (!data.currency) {
    errors.push({ field: 'currency', message: 'Currency is required' });
  }

  return errors;
};

/* ===========================
   UTILITIES
=========================== */
export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPhone = (phone: string): boolean =>
  /^\+?[\d\s\-()]+$/.test(phone) &&
  phone.replace(/\D/g, '').length >= 8;

export const sanitizeInput = (input: string): string =>
  input.trim().replace(/[<>]/g, '');
