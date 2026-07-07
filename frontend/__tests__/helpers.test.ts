import { describe, it, expect } from 'vitest';
import { getInitials, getAvatarColor, AVATAR_PALETTES, getBannerGradient, BANNER_GRADIENTS } from '../lib/helpers';

describe('getInitials()', () => {
  it('returns up to 2 initials', () => {
    expect(getInitials('Alice Bob')).toBe('AB');
    expect(getInitials('Alice Bob Charlie')).toBe('AB');
  });
  it('returns single initial for single name', () => {
    expect(getInitials('Alice')).toBe('A');
  });
  it('returns U for undefined', () => {
    expect(getInitials(undefined)).toBe('U');
  });
  it('uppercases initials', () => {
    expect(getInitials('john doe')).toBe('JD');
  });
});

describe('getAvatarColor()', () => {
  it('returns a palette entry', () => {
    const color = getAvatarColor('Alice');
    expect(color).toHaveProperty('bg');
    expect(color).toHaveProperty('text');
    expect(color).toHaveProperty('border');
    expect(AVATAR_PALETTES).toContain(color);
  });
  it('is deterministic for the same name', () => {
    expect(getAvatarColor('Test')).toEqual(getAvatarColor('Test'));
  });
});

describe('getBannerGradient()', () => {
  it('returns a gradient string', () => {
    const g = getBannerGradient('Alice');
    expect(g).toContain('linear-gradient');
    expect(BANNER_GRADIENTS).toContain(g);
  });
  it('uses index when provided', () => {
    expect(getBannerGradient(undefined, 0)).toBe(BANNER_GRADIENTS[0]);
    expect(getBannerGradient(undefined, 1)).toBe(BANNER_GRADIENTS[1]);
  });
});
