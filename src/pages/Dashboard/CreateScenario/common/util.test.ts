import _ from 'lodash';

import { fixtures } from 'navigader/util/testing';
import * as util from './util';

describe('CreateScenario utilities', () => {
  describe('validateCustomerSelections method', () => {
    const emptyMeterGroups = _.range(10).map(() => fixtures.makeOriginFile({ meter_count: 0 }));

    it('returns false when no meter groups or scenarios are provided', () => {
      expect(util.validateCustomerSelections([], [])).toBeFalsy();
    });

    it('returns false when empty meter groups or scenarios are provided', () => {
      expect(util.validateCustomerSelections(emptyMeterGroups, [])).toBeFalsy();
      expect(util.validateCustomerSelections([], [])).toBeFalsy();
    });

    it('returns true when at least one non-empty meter group or scenario is provided', () => {
      const meterGroup = fixtures.makeOriginFile({ meter_count: 1 });
      const scenario = fixtures.makeScenario({ meter_count: 1 });
      expect(util.validateCustomerSelections([meterGroup], [])).toBeTruthy();
      expect(util.validateCustomerSelections([...emptyMeterGroups, meterGroup], [])).toBeTruthy();

      expect(util.validateCustomerSelections([], [scenario])).toBeTruthy();
      expect(util.validateCustomerSelections([], [scenario])).toBeTruthy();

      expect(util.validateCustomerSelections([meterGroup], [scenario])).toBeTruthy();
      expect(
        util.validateCustomerSelections([...emptyMeterGroups, meterGroup], [scenario])
      ).toBeTruthy();
    });
  });
});
