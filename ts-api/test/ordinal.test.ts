import { describe, expect, test } from 'vitest';
import { getLongName, getShortName } from '../src/nlg/ordinal.js';

describe('Ordinal parity', () => {
  test('short names', () => {
    expect(getShortName(0)).toBe('0th');
    expect(getShortName(1)).toBe('1st');
    expect(getShortName(2)).toBe('2nd');
    expect(getShortName(3)).toBe('3rd');
    expect(getShortName(11)).toBe('11th');
    expect(getShortName(23)).toBe('23rd');
    expect(getShortName(101)).toBe('101st');
    expect(getShortName(113)).toBe('113th');
  });

  test('long names', () => {
    expect(getLongName(0)).toBe('zeroth');
    expect(getLongName(1)).toBe('first');
    expect(getLongName(20)).toBe('twentieth');
    expect(getLongName(21)).toBe('21st');
  });
});
