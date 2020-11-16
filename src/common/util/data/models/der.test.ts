import _ from 'lodash';

import { fixtures } from 'navigader/util/testing';
import * as der from './der';

/** ============================ Tests ===================================== */
describe('DER utility methods', () => {
  describe('`getStrategyDescription` method', () => {
    it('returns the description unchanged if "January" is not found', () => {
      const nonDefaultDescription = fixtures.makeDerStrategy({ description: 'Custom description' });
      expect(der.getStrategyDescription(nonDefaultDescription)).toEqual('Custom description');
    });

    it('returns `undefined` if the description is missing', () => {
      const emptyDescription = fixtures.makeDerStrategy({ description: '' });
      const undefinedDescription = fixtures.makeDerStrategy({ description: undefined });
      const missingDescription = _.omit(fixtures.makeDerStrategy(), 'description');

      expect(der.getStrategyDescription(emptyDescription)).toBeUndefined();
      expect(der.getStrategyDescription(undefinedDescription)).toBeUndefined();
      expect(der.getStrategyDescription(missingDescription)).toBeUndefined();
    });

    it('returns the description truncated if it has the automated description', () => {
      const strategy = fixtures.makeDerStrategy({ description: automatedDescription });
      expect(der.getStrategyDescription(strategy)).toEqual(
        'Battery is only allowed to charge from NEM exports.\nBattery can discharge to the grid.'
      );
    });
  });
});

const automatedDescription = `
Battery is only allowed to charge from NEM exports.
Battery can discharge to the grid.

January
Charge (NEM Only): 2:00, 3:00, 4:00, 5:00, 7:00, 8:00, 9:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00
Discharge (Export OK): 6:00, 16:00, 17:00, 18:00, 19:00, 20:00, 21:00, 22:00

February
Charge (NEM Only): 0:00, 1:00, 2:00, 3:00, 4:00, 5:00, 6:00, 9:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 17:00, 21:00, 22:00, 23:00
Discharge (Export OK): 7:00, 8:00, 16:00, 17:00, 18:00, 19:00, 20:00, 21:00

March
Charge (NEM Only): 0:00, 1:00, 2:00, 3:00, 7:00, 8:00, 9:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 21:00, 22:00
Discharge (Export OK): 4:00, 5:00, 6:00, 17:00, 18:00, 19:00, 20:00, 23:00

April
Charge (NEM Only): 0:00, 1:00, 2:00, 3:00, 4:00, 6:00, 7:00, 8:00, 9:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 21:00, 22:00, 23:00
Discharge (Export OK): 3:00, 4:00, 5:00, 17:00, 18:00, 19:00, 20:00, 23:00

May
Charge (NEM Only): 1:00, 2:00, 6:00, 7:00, 8:00, 9:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00, 18:00, 21:00, 22:00
Discharge (Export OK): 0:00, 3:00, 4:00, 5:00, 18:00, 19:00, 20:00, 23:00

June
Charge (NEM Only): 4:00, 6:00, 8:00, 9:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00, 18:00, 21:00, 22:00, 23:00
Discharge (Export OK): 0:00, 1:00, 2:00, 3:00, 5:00, 7:00, 19:00, 20:00

July
Charge (NEM Only): 0:00, 1:00, 2:00, 3:00, 4:00, 5:00, 6:00, 7:00, 8:00, 9:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00, 23:00
Discharge (Export OK): 7:00, 8:00, 9:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 17:00, 18:00, 19:00, 20:00, 21:00, 22:00

August
Charge (NEM Only): 3:00, 5:00, 6:00, 7:00, 8:00, 9:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00
Discharge (Export OK): 16:00, 17:00, 18:00, 19:00, 20:00, 21:00, 22:00, 23:00

September
Charge (NEM Only): 0:00, 1:00, 2:00, 3:00, 4:00, 5:00, 7:00, 13:00, 14:00, 15:00, 16:00, 23:00
Discharge (Export OK): 8:00, 9:00, 10:00, 11:00, 17:00, 18:00, 19:00, 20:00, 21:00, 22:00

October
Charge (NEM Only): 0:00, 1:00, 2:00, 3:00, 4:00, 6:00, 8:00, 9:00, 10:00, 11:00, 12:00, 13:00, 14:00, 22:00, 23:00
Discharge (Export OK): 7:00, 15:00, 16:00, 17:00, 18:00, 19:00, 20:00, 21:00

November
Charge (NEM Only): 0:00, 1:00, 2:00, 3:00, 4:00, 5:00, 6:00, 8:00, 9:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 23:00
Discharge (Export OK): 7:00, 16:00, 17:00, 18:00, 19:00, 20:00, 21:00, 22:00

December
Charge (NEM Only): 0:00, 2:00, 3:00, 4:00, 5:00, 6:00, 7:00, 8:00, 9:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 23:00
Discharge (Export OK): 0:00, 1:00, 17:00, 18:00, 19:00, 20:00, 21:00, 22:00
`;
