/**
 * Validation Utilities
 * Centralized validation logic following DRY principle
 * Single Responsibility: Only performs validation
 */

import { VALIDATION } from '@/src/shared/constants';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Email validation
 */
export const validateEmail = (email: string): boolean => {
  return VALIDATION.EMAIL.REGEX.test(email);
};

/**
 * Password validation
 */
export const validatePassword = (password: string): boolean => {
  return password.length >= VALIDATION.PASSWORD.MIN_LENGTH;
};

/**
 * Form field validator
 */
export const validateField = (
  field: string,
  value: string,
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => boolean;
  }
): ValidationError | null => {
  if (rules.required && !value.trim()) {
    return {
      field,
      message: `${field} is required`,
    };
  }

  if (rules.minLength && value.length < rules.minLength) {
    return {
      field,
      message: `${field} must be at least ${rules.minLength} characters`,
    };
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return {
      field,
      message: `${field} must be at most ${rules.maxLength} characters`,
    };
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return {
      field,
      message: `${field} is invalid`,
    };
  }

  if (rules.custom && !rules.custom(value)) {
    return {
      field,
      message: `${field} is invalid`,
    };
  }

  return null;
};

/**
 * Sign-up form validation
 */
export const validateSignUpForm = (data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Map<string, string> => {
  const errors = new Map<string, string>();

  if (!data.name.trim()) {
    errors.set('name', 'Full name is required');
  }

  if (!data.email) {
    errors.set('email', 'Email is required');
  } else if (!validateEmail(data.email)) {
    errors.set('email', 'Please enter a valid email address');
  }

  if (!data.password) {
    errors.set('password', 'Password is required');
  } else if (!validatePassword(data.password)) {
    errors.set('password', `Password must be at least ${VALIDATION.PASSWORD.MIN_LENGTH} characters`);
  }

  if (!data.confirmPassword) {
    errors.set('confirmPassword', 'Please confirm your password');
  } else if (data.password !== data.confirmPassword) {
    errors.set('confirmPassword', 'Passwords do not match');
  }

  return errors;
};

/**
 * Login form validation
 */
export const validateLoginForm = (data: {
  email: string;
  password: string;
}): Map<string, string> => {
  const errors = new Map<string, string>();

  if (!data.email) {
    errors.set('email', 'Email is required');
  } else if (!validateEmail(data.email)) {
    errors.set('email', 'Please enter a valid email address');
  }

  if (!data.password) {
    errors.set('password', 'Password is required');
  }

  return errors;
};

/**
 * Job role validation
 */
export const validateJobRole = (jobRole: string): ValidationError | null => {
  const error = validateField('Job Role', jobRole, {
    required: true,
    minLength: VALIDATION.JOB_ROLE.MIN_LENGTH,
    maxLength: VALIDATION.JOB_ROLE.MAX_LENGTH,
  });

  return error;
};

/**
 * File validation
 */
export const validateFile = (file: File): ValidationError | null => {
  const maxSizeBytes = VALIDATION.FILE.MAX_SIZE_MB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return {
      field: 'file',
      message: `File size must be less than ${VALIDATION.FILE.MAX_SIZE_MB}MB`,
    };
  }

  const isAcceptedType = VALIDATION.FILE.ACCEPTED_TYPES.some(
    (type) => file.type === type || file.name.toLowerCase().endsWith(getExtension(type))
  );

  if (!isAcceptedType) {
    return {
      field: 'file',
      message: 'Please upload a valid file type (PDF or Word document)',
    };
  }

  return null;
};

/**
 * Helper function to get file extension from MIME type
 */
const getExtension = (mimeType: string): string => {
  const mimeToExt: Record<string, string> = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  };
  return mimeToExt[mimeType] || '';
};
