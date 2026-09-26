import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, startOfDay, differenceInDays, parseISO } from 'date-fns';
import { CURRENCY } from './constants';
import { getValue } from './storage';

/**
 * Format currency amount in INR
 */
export function formatCurrency(amount) {
  const currencyCode = getValue('settings')?.currency || 'USD';
  let locale = 'en-US';
  if (currencyCode === 'EUR') locale = 'en-GB';
  if (currencyCode === 'GBP') locale = 'en-GB';
  if (currencyCode === 'INR') locale = 'en-IN';
  if (currencyCode === 'JPY') locale = 'ja-JP';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string or Date object
 */
export function formatDate(date, fmt = null) {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  
  if (!fmt) {
    const formatSetting = getValue('settings')?.dateFormat || 'MM/DD/YYYY';
    if (formatSetting === 'MM/DD/YYYY') fmt = 'MM/dd/yyyy';
    else if (formatSetting === 'DD/MM/YYYY') fmt = 'dd/MM/yyyy';
    else if (formatSetting === 'YYYY-MM-DD') fmt = 'yyyy-MM-dd';
    else fmt = 'MMM dd, yyyy';
  }
  
  return format(d, fmt);
}

/**
 * Get relative date label (Today, Tomorrow, Yesterday, or formatted)
 */
export function getRelativeDate(date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isYesterday(d)) return 'Yesterday';
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayISO() {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get current month as YYYY-MM
 */
export function getCurrentMonth() {
  return format(new Date(), 'yyyy-MM');
}

/**
 * Get greeting based on time of day
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Calculate streak from an array of date strings
 */
export function calculateStreak(dates) {
  if (!dates || dates.length === 0) return { current: 0, best: 0 };

  const sorted = [...dates]
    .map(d => startOfDay(typeof d === 'string' ? parseISO(d) : d).getTime())
    .sort((a, b) => b - a); // descending

  const unique = [...new Set(sorted)];
  const today = startOfDay(new Date()).getTime();
  const yesterday = today - 86400000;

  let current = 0;
  // Check if streak includes today or yesterday
  if (unique[0] === today || unique[0] === yesterday) {
    current = 1;
    for (let i = 1; i < unique.length; i++) {
      if (unique[i - 1] - unique[i] === 86400000) {
        current++;
      } else {
        break;
      }
    }
  }

  // Calculate best streak
  let best = 1;
  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    if (unique[i - 1] - unique[i] === 86400000) {
      streak++;
      best = Math.max(best, streak);
    } else {
      streak = 1;
    }
  }

  return { current, best: Math.max(best, current) };
}

/**
 * Generate a unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

/**
 * Get days until a date
 */
export function daysUntil(date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return differenceInDays(d, new Date());
}

/**
 * Clamp a number between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate percentage, safely
 */
export function percentage(current, total) {
  if (total === 0) return 0;
  return clamp(Math.round((current / total) * 100), 0, 100);
}

/**
 * Get the color for a progress bar based on percentage
 */
export function getProgressColor(pct) {
  if (pct >= 90) return 'progress-red';
  if (pct >= 70) return 'progress-yellow';
  return 'progress-green';
}

/**
 * Format time from seconds to MM:SS
 */
export function formatTimer(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Debounce a function
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Get next billing date from day-of-month
 */
export function getNextBillingDate(dayOfMonth) {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
  if (thisMonth >= startOfDay(now)) return thisMonth;
  return new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
}

/**
 * Convert snake_case string to camelCase
 */
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Convert camelCase string to snake_case
 */
function camelToSnake(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Recursively convert object keys to camelCase
 */
export function keysToCamel(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(keysToCamel);
  return Object.keys(obj).reduce((acc, key) => {
    acc[snakeToCamel(key)] = keysToCamel(obj[key]);
    return acc;
  }, {});
}

/**
 * Recursively convert object keys to snake_case
 */
export function keysToSnake(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(keysToSnake);
  return Object.keys(obj).reduce((acc, key) => {
    acc[camelToSnake(key)] = keysToSnake(obj[key]);
    return acc;
  }, {});
}
