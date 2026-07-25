import type { QuoteRequest } from '../types/quote.types';
import type { RateCardFormData, ContainerType } from '../types/rateCard.types';
import { CONTAINER_WEIGHT_LIMITS, AIR_WEIGHT_LIMITS } from './constants';

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

  if (!data.commodity || !data.commodity.trim()) {
    errors.push({
      field: 'commodity',
      message: 'Commodity is required to look up pricing',
    });
  }

  /* ===== Container validation (optional, sea freight) ===== */
  if (data.mode !== 'air' && data.containerQuantity !== undefined) {
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

  if (data.mode !== 'air' && data.containerQuantity && !data.containerSize) {
    errors.push({
      field: 'containerSize',
      message: 'Container size is required when container quantity is provided',
    });
  }

  /* ===== Weight bracket validation (air freight) ===== */
  if (data.mode === 'air' && !data.weightBreak) {
    errors.push({
      field: 'weightBreak',
      message: 'Weight bracket is required to look up air freight pricing',
    });
  }

  if (data.containerSize && !data.clearance) {
    errors.push({
      field: 'clearance',
      message: 'Clearance (import/export) is required to look up container pricing',
    });
  }

  if (data.weightBreak && !data.clearance) {
    errors.push({
      field: 'clearance',
      message: 'Clearance (import/export) is required to look up weight-bracket pricing',
    });
  }

  /* ===== Gross weight range validation (container type / air) =====
     Road & Sea: gross weight must fall inside the min/max band for the
     selected container type (20'GP, 40'GP, 40'RF, 45'RF).
     Air: gross weight must fall inside the fixed 100kg–5,000kg band. */
  if (data.containerMaxWeight !== undefined && data.containerMaxWeight > 0) {
    if (data.mode === 'air') {
      const { min, max } = AIR_WEIGHT_LIMITS;
      if (data.containerMaxWeight < min || data.containerMaxWeight > max) {
        errors.push({
          field: 'containerMaxWeight',
          message: `Gross weight for Air freight must be between ${min.toLocaleString()}kg and ${max.toLocaleString()}kg`,
        });
      }
    } else if (data.containerSize) {
      const limits = CONTAINER_WEIGHT_LIMITS[data.containerSize as ContainerType];
      if (limits && (data.containerMaxWeight < limits.min || data.containerMaxWeight > limits.max)) {
        errors.push({
          field: 'containerMaxWeight',
          message: `Gross weight for ${data.containerSize} must be between ${limits.min.toLocaleString()}kg and ${limits.max.toLocaleString()}kg`,
        });
      }
    }
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

  if (data.service === 'local_charge' && (data.mode === 'road' || data.mode === 'sea')) {
    const containers = data.containers ?? {};
    const commodityNames = Object.keys(containers);

    if (commodityNames.length === 0) {
      errors.push({
        field: 'containers',
        message: 'Add at least one commodity and set its pricing',
      });
    } else {
      const hasAnyPrice = commodityNames.some(name =>
        (['export', 'import'] as const).some(direction =>
          (['clearance', 'trucking'] as const).some(line =>
            Object.values(containers[name]?.[direction]?.[line] ?? {}).some(v => (v ?? 0) > 0)
          )
        )
      );

      if (!hasAnyPrice) {
        errors.push({
          field: 'containers',
          message: 'Enter at least one clearance or trucking price for a container type',
        });
      }
    }
  }

  if (data.service === 'local_charge' && data.mode === 'air') {
    const weights = data.weights ?? {};
    const commodityNames = Object.keys(weights);

    if (commodityNames.length === 0) {
      errors.push({
        field: 'weights',
        message: 'Add at least one commodity and set its pricing',
      });
    } else {
      const hasAnyPrice = commodityNames.some(name =>
        (['export', 'import'] as const).some(direction =>
          (['clearance', 'trucking'] as const).some(line =>
            Object.values(weights[name]?.[direction]?.[line] ?? {}).some(v => (v ?? 0) > 0)
          )
        )
      );

      if (!hasAnyPrice) {
        errors.push({
          field: 'weights',
          message: 'Enter at least one clearance or trucking price for a weight bracket',
        });
      }
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