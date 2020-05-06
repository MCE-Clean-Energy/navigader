import range from 'lodash/range';

import { fixtures } from 'navigader/util/testing';
import * as utils from './util';


/** ============================ Tests ===================================== */
describe('Meter utility methods', () => {
  describe('`parseMeterGroup` method', () => {
    const customerCluster = fixtures.makeCustomerCluster();
    const originFile = fixtures.makeOriginFile({
      metadata: {
        expected_meter_count: 0,
        filename: 'origin_files/myFile.csv'
      }
    });
    
    function parseOriginFile (meterCount: number, expectedCount: number | null) {
      return utils.parseMeterGroup({
        ...originFile,
        meter_count: meterCount,
        metadata: {
          expected_meter_count: expectedCount,
          filename: 'origin_files/myFile.csv'
        }
      });
    }
    
    it('should strip the `origin_files/` prefix from origin filenames', () => {
      expect(utils.parseMeterGroup(originFile)).toMatchObject({
        metadata: {
          filename: 'myFile.csv',
        }
      });
    });
    
    it('parses the `progress` key properly', () => {
      const parsedCustomerCluster = utils.parseMeterGroup(customerCluster);
      expect(parsedCustomerCluster.progress.is_complete).toEqual(true);
      expect(parsedCustomerCluster.progress.percent_complete).toEqual(100);
      
      // Expected meter count is 0
      let parsedOriginFile = utils.parseMeterGroup(originFile);
      expect(parsedOriginFile.progress.is_complete).toEqual(false);
      expect(parsedOriginFile.progress.percent_complete).toEqual(Infinity);
      
      // Set meter count to 0, expected count to `null`
      parsedOriginFile = parseOriginFile(0, null);
      expect(parsedOriginFile.progress.is_complete).toEqual(false);
      expect(parsedOriginFile.progress.percent_complete).toEqual(0);
      
      // Set meter count to 1, expected count to 7. Percent complete rounds to 1 digit
      parsedOriginFile = parseOriginFile(1, 7);
      expect(parsedOriginFile.progress.is_complete).toEqual(false);
      expect(parsedOriginFile.progress.percent_complete).toEqual(14.3);
      
      // Set meter count to 100, expected count to 100. `is_complete` should be true
      parsedOriginFile = parseOriginFile(100, 100);
      expect(parsedOriginFile.progress.is_complete).toEqual(true);
      expect(parsedOriginFile.progress.percent_complete).toEqual(100);
    });
  });
  
  describe('`isSufficientlyIngested` method' ,() => {
    it('returns `false` if no scenario is provided', () => {
      expect(utils.isSufficientlyIngested(undefined)).toBeFalsy();
    });
    
    it('returns `true` if a customer cluster is provided', () => {
      const customerCluster = fixtures.makeCustomerCluster();
      expect(utils.isSufficientlyIngested(customerCluster)).toBeTruthy();
    });
    
    it('returns `true` if a customer cluster is at least 95% finished', () => {
      range(101).forEach((meter_count) => {
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
