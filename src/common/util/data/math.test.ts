import { clamp, lerp, percentOf, xor } from './math';

describe('`lerp` method', () => {
  it('interpolates correctly', () => {
    expect(lerp(0.5, 0, 10)).toEqual(5);
    expect(lerp(0.8, 6.5, 8.5)).toEqual(8.1);
    expect(lerp(1, Math.SQRT2, Math.PI)).toEqual(Math.PI);
    expect(lerp(0, Math.SQRT2, Math.PI)).toEqual(Math.SQRT2);
  });
});

describe('`clamp` method', () => {
  it('clamps to the minimum if the value is less than that', () => {
    expect(clamp(2, 3, 8)).toEqual(3);
    expect(clamp(3, 3, 8)).toEqual(3);
  });

  it('clamps to the maximum if the value is greater than that', () => {
    expect(clamp(9, 3, 8)).toEqual(8);
    expect(clamp(8, 3, 8)).toEqual(8);
  });

  it('returns the value unmodified if it falls within the range', () => {
    expect(clamp(4.8, 3, 8)).toEqual(4.8);
  });
});

describe('`percentOf` method', () => {
  it('handles when the denominator is 0', () => {
    expect(percentOf(0, 0)).toEqual(Infinity);
    expect(percentOf(1, 0)).toEqual(Infinity);
  });

  it('returns percents properly', () => {
    expect(percentOf(0, 1)).toEqual(0);
    expect(percentOf(1, 2)).toEqual(50);
    expect(percentOf(50.1, 100)).toEqual(50.1);
    expect(percentOf(3.5, 2)).toEqual(175);
  });
});

describe('`xor` method', () => {
  it('returns true when only 1 input is truthy', () => {
    expect(xor(1, 0)).toBeTruthy();
    expect(xor(1, 0, '', false, null)).toBeTruthy();
    expect(xor('true', false)).toBeTruthy();
    expect(xor('one arg')).toBeTruthy();
  });

  it('returns false when there are more than 1 truthy inputs', () => {
    expect(xor(1, 1)).toBeFalsy();
    expect(xor(true, false, false, false, 1)).toBeFalsy();
    expect(xor('true', 'false')).toBeFalsy();
  });

  it('returns false when there are no truthy inputs', () => {
    expect(xor(0, 0)).toBeFalsy();
    expect(xor(false, false, false)).toBeFalsy();
    expect(xor(false, 0, '', null, undefined)).toBeFalsy();
  });
});
