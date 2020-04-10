import { clamp, lerp } from './math';


describe('`lerp` method', () => {
  it('interpolates correctly', () => {
    expect(lerp( 0.5, 0,  10)).toEqual(5);
    expect(lerp( 0.8, 6.5,  8.5)).toEqual(8.1);
    expect(lerp( 1, Math.SQRT2,  Math.PI)).toEqual(Math.PI);
    expect(lerp( 0, Math.SQRT2,  Math.PI)).toEqual(Math.SQRT2);
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
