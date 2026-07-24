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

  if (data.containerSize && !data.clearance) {
    errors.push({
      field: 'clearance',
      message: 'Clearance (import/export) is required to look up container pricing',
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

  if (!data.currency) {
    errors.push({ field: 'currency', message: 'Currency is required' });
  }

  if (data.service === 'local_charge') {
    const containers = data.containers;
    const hasAnyPrice =
      !!containers &&
      (['export', 'import'] as const).some(direction =>
        (['clearance', 'trucking'] as const).some(line =>
          Object.values(containers[direction]?.[line] ?? {}).some(v => (v ?? 0) > 0)
        )
      );

    if (!hasAnyPrice) {
      errors.push({
        field: 'containers',
        message: 'Enter at least one clearance or trucking price for a container type',
      });
    }
  }

  if (data.service === 'freight') {
    if (data.freight === undefined || data.freight < 0) {
      errors.push({ field: 'freight', message: 'Freight must be 0 or greater' });
    }
    if (data.othc === undefined || data.othc < 0) {
      errors.push({ field: 'othc', message: 'OTHC must be 0 or greater' });
    }
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
