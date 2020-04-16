import range from 'lodash/range';

import { fixtures } from '@nav/shared/util/testing';
import * as util from './util';


describe('CreateScenario utilities', () => {
  describe('validateCustomerSelections method', () => {
    const emptyMeterGroups = range(10).map(() => fixtures.makeOriginFile({ numMeters: 0 }));
    
    it('returns false when no meter groups are provided', () => {
      expect(util.validateCustomerSelections([])).toBeFalsy();
    });
    
    it('returns false when empty meter groups are provided', () => {
      
      expect(util.validateCustomerSelections(emptyMeterGroups)).toBeFalsy();
    });
    
    it ('returns true when at least one non-empty meter group is provided', () => {
      const meterGroup = fixtures.makeOriginFile({ numMeters: 1 });
      expect(util.validateCustomerSelections([meterGroup])).toBeTruthy();
      expect(util.validateCustomerSelections([ ...emptyMeterGroups, meterGroup ])).toBeTruthy();
    });
  });
});
