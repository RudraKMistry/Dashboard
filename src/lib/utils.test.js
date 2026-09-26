import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatTimer,
  getTodayISO,
  percentage,
  getNextBillingDate,
  daysUntil,
  getGreeting,
  generateId,
  getProgressColor
} from './utils';

describe('utils.js', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers as INR', () => {
      expect(formatCurrency(1000)).toBe('₹1,000');
    });
    it('formats zero as INR', () => {
      expect(formatCurrency(0)).toBe('₹0');
    });
  });

  describe('formatTimer', () => {
    it('formats seconds correctly', () => {
      expect(formatTimer(65)).toBe('01:05');
      expect(formatTimer(3600)).toBe('60:00');
      expect(formatTimer(0)).toBe('00:00');
    });
  });

  describe('percentage', () => {
    it('calculates percentage correctly', () => {
      expect(percentage(50, 100)).toBe(50);
      expect(percentage(3, 4)).toBe(75);
    });
    it('handles division by zero', () => {
      expect(percentage(50, 0)).toBe(0);
    });
    it('caps percentage at 100', () => {
      expect(percentage(150, 100)).toBe(100);
    });
  });

  describe('daysUntil', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-09-25T00:00:00Z'));
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('calculates days until a future date', () => {
      expect(daysUntil(new Date('2026-09-28T00:00:00Z'))).toBe(3);
    });
    it('returns 0 for today', () => {
      expect(daysUntil(new Date('2026-09-25T00:00:00Z'))).toBe(0);
    });
  });

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(10);
    });
  });

  describe('getProgressColor', () => {
    it('returns correct color classes', () => {
      expect(getProgressColor(95)).toBe('progress-red');
      expect(getProgressColor(80)).toBe('progress-yellow');
      expect(getProgressColor(70)).toBe('progress-yellow');
      expect(getProgressColor(50)).toBe('progress-green');
    });
  });
});
