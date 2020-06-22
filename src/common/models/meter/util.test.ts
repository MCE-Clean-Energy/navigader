import _ from 'navigader/util/lodash';
import { fixtures } from 'navigader/util/testing';
import * as utils from './util';


/** ============================ Tests ===================================== */
describe('Meter utility methods', () => {
  describe('`isSufficientlyIngested` method' ,() => {
    it('returns `false` if no scenario is provided', () => {
      expect(utils.isSufficientlyIngested(undefined)).toBeFalsy();
    });
    
    it('returns `true` if a customer cluster is provided', () => {
      const customerCluster = fixtures.makeCustomerCluster();
      expect(utils.isSufficientlyIngested(customerCluster)).toBeTruthy();
    });
    
    it('returns `true` if a customer cluster is at least 95% finished', () => {
      _.range(101).forEach((meter_count) => {
        const isSufficientlyIngested = utils.isSufficientlyIngested(
          fixtures.makeOriginFile({
            meter_count,
            metadata: {
              expected_meter_count: 100,
              filename: `meter group at ${meter_count}%`
            },
            progress: {
              is_complete: meter_count === 100,
              percent_complete: meter_count
            }
          })
        );
        
        if (meter_count >= 95) {
          expect(isSufficientlyIngested).toBeTruthy();
        } else {
          expect(isSufficientlyIngested).toBeFalsy();
        }
      });
    });
  });
});
