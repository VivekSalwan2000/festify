import { formatTime, formatDate, formatCurrency } from '../utils.js';

describe('utils.js', () => {
  test('formatTime converts 24-hour time to 12-hour AM/PM', () => {
    expect(formatTime('09:30')).toBe('9:30 AM');
    expect(formatTime('14:00')).toBe('2:00 PM');
    expect(formatTime('00:15')).toBe('12:15 AM');
  });

  test('formatTime returns empty string for falsy input', () => {
    expect(formatTime('')).toBe('');
    expect(formatTime(null)).toBe('');
  });

  test('formatDate formats ISO date strings', () => {
    const formatted = formatDate('2024-06-15');
    expect(formatted).toMatch(/2024/);
    expect(formatted).toMatch(/June|6/);
  });

  test('formatCurrency formats numbers as USD', () => {
    expect(formatCurrency(12500)).toContain('$');
    expect(formatCurrency(12500)).toContain('12,500');
  });
});
