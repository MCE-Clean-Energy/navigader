import { scaleData } from './Frame288Graph';


describe('Frame288Graph', () => {
  describe('`scaleData` helper method`', () => {
    it('handles kW values', async () => {
      expect(scaleData(-10, 750)).toMatchObject({
        scale: 1,
        units: 'kW'
      });
    });
    
    it('handles MW values', async () => {
      expect(scaleData(-10000, 750000)).toMatchObject({
        scale: 1000,
        units: 'MW'
      });
    });
    
    it('handles GW values', async () => {
      expect(scaleData(-10000000, 750)).toMatchObject({
        scale: 1000000,
        units: 'GW'
      });
      
      expect(scaleData(10000000, 10000001)).toMatchObject({
        scale: 1000000,
        units: 'GW'
      });
    });
  });
});
