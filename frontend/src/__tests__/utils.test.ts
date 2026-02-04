import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../utils/currency';

describe('formatCurrency', () => {
  it('formats BYN correctly', () => {
    const result = formatCurrency(1000, 'BYN');
    expect(result).toContain('1');
    expect(result).toContain('000');
    expect(result).toMatch(/Br|BYN/);
  });

  it('formats USD correctly', () => {
    const result = formatCurrency(50.5, 'USD');
    expect(result).toContain('$');
    expect(result).toContain('50,5');
  });

  it('handles strings', () => {
    const result = formatCurrency("100", 'EUR');
    expect(result).toContain('€');
  });
});
