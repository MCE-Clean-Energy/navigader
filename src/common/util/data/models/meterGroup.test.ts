import _ from 'lodash';
import { DateTime, Duration, Interval } from 'luxon';

import { fixtures } from 'navigader/util/testing';
import * as meterGroup from './meterGroup';

/** ============================ Tests ===================================== */
describe('Meter utility methods', () => {
  describe('`isSufficientlyIngested` method', () => {
    it('returns `false` if no scenario is provided', () => {
      expect(meterGroup.isSufficientlyIngested(undefined)).toBeFalsy();
    });

    it('returns `true` if a customer cluster is at least 95% finished', () => {
      _.range(101).forEach((meter_count) => {
        const isSufficientlyIngested = meterGroup.isSufficientlyIngested(
          fixtures.makeOriginFile({
            meter_count,
            metadata: {
              expected_meter_count: 100,
              filename: `meter group at ${meter_count}%`,
            },
            progress: {
              is_complete: meter_count === 100,
              percent_complete: meter_count,
            },
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

  describe('`spansMultipleYears` method', () => {
    it('returns `false` if no meter group is provided', () => {
      expect(meterGroup.spansMultipleYears(undefined)).toBeFalsy();
    });

    it('returns `false` if the meter group does not have a date range', () => {
      expect(
        meterGroup.spansMultipleYears(fixtures.makeOriginFile({ date_range: null }))
      ).toBeFalsy();
    });

    it('returns `false` if the meter group data occurs in the same calendar year', () => {
      const startDate = DateTime.fromISO('2020-01-01T00:00:00');

      for (let i = 1; i <= 366; i++) {
        expect(
          meterGroup.spansMultipleYears(
            fixtures.makeOriginFile({
              date_range: [
                startDate.toJSDate(),
                startDate.plus(Duration.fromObject({ days: i })).toJSDate(),
              ],
            })
          )
        ).toBeFalsy();
      }
    });

    it('returns `true` if the meter group has a date range greater than 366 days', () => {
      const startDate = DateTime.fromISO('2020-01-01T00:00:00');
      expect(
        meterGroup.spansMultipleYears(
          fixtures.makeOriginFile({
            date_range: [
              startDate.toJSDate(),
              startDate.plus(Duration.fromObject({ days: 367 })).toJSDate(),
            ],
          })
        )
      ).toBeTruthy();
    });

    it('returns `true` if the meter group is less than 366 days long but crosses years', () => {
      const startDate = DateTime.fromISO('2020-12-25T00:00:00');
      expect(
        meterGroup.spansMultipleYears(
          fixtures.makeOriginFile({
            date_range: [
              startDate.toJSDate(),
              startDate.plus(Duration.fromObject({ days: 20 })).toJSDate(),
            ],
          })
        )
      ).toBeTruthy();
    });
  });

  describe('`getDateRangeInterval` method', () => {
    it('returns `null` when no meter group is provided', () => {
      expect(meterGroup.getDateRangeInterval(undefined)).toBeNull();
    });

    it('returns `null` when the meter group has no date range', () => {
      expect(
        meterGroup.getDateRangeInterval(fixtures.makeOriginFile({ date_range: null }))
      ).toBeNull();
    });

    it('returns an interval when no unit is passed', () => {
      const originFile = fixtures.makeOriginFile({
        date_range: [
          DateTime.fromISO('2020-01-01T00:00:00').toJSDate(),
          DateTime.fromISO('2020-01-02T00:00:00').toJSDate(),
        ],
      });

      const interval = meterGroup.getDateRangeInterval(originFile);
      expect(interval).toBeInstanceOf(Interval);
      expect(interval?.length('days')).toEqual(1);
    });

    it('returns a number when a unit is passed', () => {
      const originFile = fixtures.makeOriginFile({
        date_range: [
          DateTime.fromISO('2020-01-01T00:00:00').toJSDate(),
          DateTime.fromISO('2021-01-01T00:00:00').toJSDate(),
        ],
      });

      expect(meterGroup.getDateRangeInterval(originFile, 'days')).toEqual(366);
      expect(meterGroup.getDateRangeInterval(originFile, 'months')).toEqual(12);
      expect(meterGroup.getDateRangeInterval(originFile, 'years')).toEqual(1);
    });
  });
});
