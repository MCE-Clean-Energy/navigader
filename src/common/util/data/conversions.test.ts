import * as conversions from './conversions';

describe('`conversion` utility methods', () => {
  describe('`kwtoMw` method', () => {
    it('divides by 1000', () => {
      expect(conversions.kwToMw(1000)).toEqual(1);
      expect(conversions.kwToMw(0)).toEqual(0);
      expect(conversions.kwToMw(123456789)).toEqual(123456.789);
    });

    it('handles `undefined` and `null`', () => {
      expect(conversions.kwToMw(undefined)).toBeUndefined();
      expect(conversions.kwToMw(null)).toBeUndefined();
    });
  });
});
