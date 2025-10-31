import crypto from 'crypto';

/**
 * Generate a unique confirmation code
 */
export const generateConfirmationCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

/**
 * Format time to HH:mm
 */
export const formatTime = (date) => {
  return date.toTimeString().slice(0, 5);
};

/**
 * Check if a date is in the past
 */
export const isPastDate = (date) => {
  return new Date(date) < new Date();
};

/**
 * Add minutes to a date
 */
export const addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60000);
};

/**
 * Check if two time ranges overlap
 */
export const timeRangesOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};
