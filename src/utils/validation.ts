/**
 * Utility functions for form validation
 */

/**
 * Validate email address
 * 
 * @param email - Email to validate
 * @returns True if valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate phone number
 * 
 * @param phone - Phone number to validate
 * @returns True if valid phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid US phone number (10 digits) or international (7-15 digits)
  return cleaned.length >= 7 && cleaned.length <= 15;
}

/**
 * Validate password strength
 * 
 * @param password - Password to validate
 * @returns Validation result with strength and messages
 */
export function validatePassword(password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  messages: string[];
} {
  const messages: string[] = [];
  let score = 0;

  if (password.length < 8) {
    messages.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    messages.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    messages.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    messages.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    messages.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  let strength: 'weak' | 'medium' | 'strong';
  if (score < 3) {
    strength = 'weak';
  } else if (score < 5) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  return {
    isValid: messages.length === 0,
    strength,
    messages,
  };
}

/**
 * Validate required field
 * 
 * @param value - Value to validate
 * @returns True if field has value
 */
export function isRequired(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  
  return true;
}

/**
 * Validate minimum length
 * 
 * @param value - Value to validate
 * @param minLength - Minimum required length
 * @returns True if value meets minimum length
 */
export function hasMinLength(value: string, minLength: number): boolean {
  return value.trim().length >= minLength;
}

/**
 * Validate maximum length
 * 
 * @param value - Value to validate
 * @param maxLength - Maximum allowed length
 * @returns True if value doesn't exceed maximum length
 */
export function hasMaxLength(value: string, maxLength: number): boolean {
  return value.trim().length <= maxLength;
}

/**
 * Validate numeric value
 * 
 * @param value - Value to validate
 * @returns True if value is a valid number
 */
export function isNumeric(value: string): boolean {
  return !isNaN(Number(value)) && !isNaN(parseFloat(value));
}

/**
 * Validate positive number
 * 
 * @param value - Value to validate
 * @returns True if value is a positive number
 */
export function isPositiveNumber(value: string | number): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num > 0;
}

/**
 * Validate URL
 * 
 * @param url - URL to validate
 * @returns True if valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate date range
 * 
 * @param startDate - Start date
 * @param endDate - End date
 * @returns True if end date is after start date
 */
export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return endDate > startDate;
}

/**
 * Validate future date
 * 
 * @param date - Date to validate
 * @returns True if date is in the future
 */
export function isFutureDate(date: Date): boolean {
  return date > new Date();
}

/**
 * Validate past date
 * 
 * @param date - Date to validate
 * @returns True if date is in the past
 */
export function isPastDate(date: Date): boolean {
  return date < new Date();
}

/**
 * Generic form validation function
 * 
 * @param data - Form data to validate
 * @param rules - Validation rules
 * @returns Validation result
 */
export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, Array<(value: any) => string | null>>
): {
  isValid: boolean;
  errors: Partial<Record<keyof T, string[]>>;
} {
  const errors: Partial<Record<keyof T, string[]>> = {};
  let isValid = true;

  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field as keyof T];
    const value = data[field as keyof T];
    const fieldErrors: string[] = [];

    fieldRules.forEach((rule) => {
      const error = rule(value);
      if (error) {
        fieldErrors.push(error);
      }
    });

    if (fieldErrors.length > 0) {
      errors[field as keyof T] = fieldErrors;
      isValid = false;
    }
  });

  return { isValid, errors };
}

/**
 * Common validation rule creators
 */
export const ValidationRules = {
  required: (message = 'This field is required') => (value: any) =>
    isRequired(value) ? null : message,

  email: (message = 'Please enter a valid email address') => (value: string) =>
    !value || isValidEmail(value) ? null : message,

  phone: (message = 'Please enter a valid phone number') => (value: string) =>
    !value || isValidPhoneNumber(value) ? null : message,

  minLength: (min: number, message?: string) => (value: string) =>
    !value || hasMinLength(value, min)
      ? null
      : message || `Must be at least ${min} characters long`,

  maxLength: (max: number, message?: string) => (value: string) =>
    !value || hasMaxLength(value, max)
      ? null
      : message || `Must be no more than ${max} characters long`,

  numeric: (message = 'Please enter a valid number') => (value: string) =>
    !value || isNumeric(value) ? null : message,

  positive: (message = 'Please enter a positive number') => (value: string) =>
    !value || isPositiveNumber(value) ? null : message,

  url: (message = 'Please enter a valid URL') => (value: string) =>
    !value || isValidUrl(value) ? null : message,
};
