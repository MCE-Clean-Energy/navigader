import { DateTime, Duration, DurationObject, Interval } from 'luxon';

import { DateRange } from 'navigader/types';
import { Frame288Numeric } from 'navigader/util';
import { fixtures } from 'navigader/util/testing';

import { IntervalData, interval } from './interval';

describe('`IntervalData` class', () => {
  /** ========================== Test fixtures ============================= */
  const kwInterval = IntervalData.fromObject(
    {
      times: ['2020-06-02T18:00:00', '2020-06-02T18:15:00', '2020-06-02T18:30:00'],
      kw: [1, 2, 3],
      name: 'KW interval',
    },
    'times',
    'kw'
  );

  const sparseInterval = fixtures.makeIntervalData(
    [
      ['2020-01-01T18:00:00', 1],
      ['2020-02-01T18:00:00', 1],
      ['2020-03-01T18:00:00', 1],
      ['2020-04-01T18:00:00', 1],
      ['2020-05-01T18:00:00', 1],
      ['2020-06-01T18:00:00', 1],
      ['2020-07-01T18:00:00', 1],
      ['2020-08-01T18:00:00', 1],
      ['2020-09-01T18:00:00', 1],
      ['2020-10-01T18:00:00', 1],
      ['2020-11-01T18:00:00', 1],
      ['2020-12-01T18:00:00', 1],
    ],
    'Sparse interval'
  );

  const juneInterval = fixtures.makeIntervalData(
    [
      ['2020-06-02T18:00:00', 1],
      ['2020-06-02T18:15:00', 2],
      ['2020-06-02T18:30:00', 3],
      ['2020-06-02T18:45:00', 4],
    ],
    'June interval'
  );

  // Frame288 where each month has the same hour values, which are equal to their hour index
  const hourFrame288 = new Frame288Numeric(fixtures.makeFrame288((m, h) => h));

  // Frame288 where each month's hour values are the same across the day, set to the month index
  const monthFrame288 = new Frame288Numeric(fixtures.makeFrame288((m) => m));

  /** ========================== Tests ===================================== */
  describe('`serialize` method', () => {
    it('returns the object with the expected keys and values', () => {
      expect(kwInterval.serialize('kw', 'times')).toEqual({
        times: ['2020-06-02T18:00:00', '2020-06-02T18:15:00', '2020-06-02T18:30:00'],
        kw: [1, 2, 3],
      });
    });
  });

  describe('`period` getter', () => {
    it('calculates the period correctly', () => {
      const hourInterval = fixtures.makeIntervalData(
        [
          ['2020-06-02T18:00:00', 1],
          ['2020-06-02T19:00:00', 2],
        ],
        'Hour interval'
      );

      const fifteenMinuteInterval = fixtures.makeIntervalData(
        [
          ['2020-06-02T18:00:00', 1],
          ['2020-06-02T18:15:00', 2],
        ],
        '15 minute interval'
      );

      expect(hourInterval.period).toEqual(60);
      expect(fifteenMinuteInterval.period).toEqual(15);
    });
  });

  describe('`filter` method', () => {
    it('handles filtering by `start` date', () => {
      const filtered1 = juneInterval.filter({ start: new Date('2020-06-02T18:15:00') });
      expect(filtered1.values).toEqual([2, 3, 4]);

      // 1 second later and we lose the first datum
      const filtered2 = juneInterval.filter({ start: new Date('2020-06-02T18:15:01') });
      expect(filtered2.values).toEqual([3, 4]);
    });

    it('handles filtering by `end` date', () => {
      const filtered1 = juneInterval.filter({ end: new Date('2020-06-02T18:30:00') });
      expect(filtered1.values).toEqual([1, 2, 3]);

      // 1 second earlier and we lose the last datum
      const filtered2 = juneInterval.filter({ end: new Date('2020-06-02T18:29:59') });
      expect(filtered2.values).toEqual([1, 2]);
    });

    it('handles filtering by `range`', () => {
      expect(
        juneInterval.filter({
          range: [new Date('2020-06-02T18:15:00'), new Date('2020-06-02T18:45:00')],
        }).values
      ).toEqual([2, 3, 4]);

      // start 1 second later and we lose the first datum
      expect(
        juneInterval.filter({
          range: [new Date('2020-06-02T18:15:01'), new Date('2020-06-02T18:45:00')],
        }).values
      ).toEqual([3, 4]);

      // end 1 second earlier and we lose the last datum
      expect(
        juneInterval.filter({
          range: [new Date('2020-06-02T18:15:01'), new Date('2020-06-02T18:44:59')],
        }).values
      ).toEqual([3]);
    });

    it('handles filtering by `month`', () => {
      expect(juneInterval.filter({ month: 5 }).values).toEqual([]);
      expect(juneInterval.filter({ month: 6 }).values).toEqual([1, 2, 3, 4]);
      expect(juneInterval.filter({ month: 7 }).values).toEqual([]);

      const monthInterval = fixtures.makeIntervalData(
        [
          ['2020-06-02T18:00:00', 1],
          ['2020-07-02T18:15:00', 2],
          ['2020-08-02T18:30:00', 3],
          ['2020-09-02T18:45:00', 4],
        ],
        'summer'
      );

      expect(monthInterval.filter({ month: 6 }).values).toEqual([1]);
      expect(monthInterval.filter({ month: 7 }).values).toEqual([2]);
      expect(monthInterval.filter({ month: 8 }).values).toEqual([3]);
      expect(monthInterval.filter({ month: 9 }).values).toEqual([4]);
    });
  });

  describe('`subtract` method', () => {
    it('subtracts corresponding values', () => {
      const juneSquaredInterval = juneInterval.map(({ value }) => value ** 2);
      expect(juneSquaredInterval.subtract(juneInterval).values).toEqual([0, 2, 6, 12]);
    });

    it('drops intervals that do not align', () => {
      const interval1 = fixtures.makeIntervalData(
        [
          ['2020-06-02T17:45:00', 1],
          ['2020-06-02T18:00:00', 2],
          ['2020-06-02T18:15:00', 3],
          ['2020-06-02T18:30:00', 4],
        ],
        'earlier'
      );

      const interval2 = fixtures.makeIntervalData(
        [
          ['2020-06-02T18:00:00', 4],
          ['2020-06-02T18:15:00', 3],
          ['2020-06-02T18:30:00', 2],
          ['2020-06-02T18:45:00', 1],
        ],
        'later'
      );

      expect(interval1.subtract(interval2).values).toEqual([-2, 0, 2]);

      // Dates don't align
      const june1Interval = fixtures.makeIntervalData(
        [
          ['2020-06-01T18:00:00', 1],
          ['2020-06-01T18:15:00', 2],
          ['2020-06-01T18:30:00', 3],
          ['2020-06-01T18:45:00', 4],
        ],
        'June 1'
      );

      const june2Interval = fixtures.makeIntervalData(
        [
          ['2020-06-02T18:00:00', 4],
          ['2020-06-02T18:15:00', 3],
          ['2020-06-02T18:30:00', 2],
          ['2020-06-02T18:45:00', 1],
        ],
        'June 2'
      );

      expect(june1Interval.subtract(june2Interval).values).toEqual([]);
    });
  });

  describe('`divide` method', () => {
    it('divides the intervals value respectively', () => {
      const largeInterval = fixtures.makeIntervalData(
        [
          ['2020-06-02T18:00:00', 100],
          ['2020-06-02T18:15:00', 200],
          ['2020-06-02T18:30:00', 450],
          ['2020-06-02T18:45:00', 827],
        ],
        'large'
      );

      expect(largeInterval.divide(100).values).toEqual([1, 2, 4.5, 8.27]);
    });
  });

  describe('`multiply` method', () => {
    it('multiplies the intervals values respectively', () => {
      const largeInterval = fixtures.makeIntervalData(
        [
          ['2020-06-02T18:00:00', 1],
          ['2020-06-02T18:15:00', 2],
          ['2020-06-02T18:30:00', 3],
          ['2020-06-02T18:45:00', 4],
        ],
        'multiplier'
      );

      expect(largeInterval.multiply(5).values).toEqual([5, 10, 15, 20]);
    });
  });

  describe('`create` method', () => {
    it('creates an `IntervalData` from the provided object', () => {
      const name = 'KW interval';
      expect(kwInterval.name).toEqual(name);
      expect(kwInterval.chartData).toEqual([
        { name, timestamp: new Date('2020-06-02T18:00:00'), value: 1 },
        { name, timestamp: new Date('2020-06-02T18:15:00'), value: 2 },
        { name, timestamp: new Date('2020-06-02T18:30:00'), value: 3 },
      ]);
    });
  });

  describe('`map` method', () => {
    it('applies the mapping function to each datum', () => {
      const squared = kwInterval.map((n) => n.value ** 2);
      expect(squared.values).toEqual([1, 4, 9]);
    });
  });

  describe('`multiply288` method', () => {
    it('properly multiplies the 288 by hour of the day', () => {
      const multiplied = kwInterval.multiply288(hourFrame288);
      expect(multiplied.values).toEqual([18, 36, 54]);
    });

    it('properly multiplies the 288 by month of the year', () => {
      const multiplied = sparseInterval.multiply288(monthFrame288);
      expect(multiplied.values).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });
  });

  describe('`align288` method', () => {
    it('properly creates interval data with 288 values and the same domain', () => {
      const aligned = sparseInterval.align288(monthFrame288);
      expect(aligned.domain).toEqual({
        timestamp: sparseInterval.domain.timestamp,
        value: [
          monthFrame288.getValueByMonthHour(1, 18),
          monthFrame288.getValueByMonthHour(12, 18),
        ],
      });
    });

    it('adopts the name of the 288 if it has one', () => {
      const namedFrame288 = new Frame288Numeric(fixtures.frame288, { name: 'Frame with name' });
      const unnamedFrame288 = new Frame288Numeric(fixtures.frame288);

      expect(kwInterval.align288(namedFrame288).name).toEqual('Frame with name');
      expect(kwInterval.align288(unnamedFrame288).name).toEqual(kwInterval.name);
    });
  });

  describe('`startOfMonth` method', () => {
    it('returns the first interval of the given month', () => {
      expect(sparseInterval.startOfMonth(1)).toEqual(new Date('2020-01-01T18:00:00'));
      expect(juneInterval.startOfMonth(6)).toEqual(new Date('2020-06-02T18:00:00'));
    });

    it('returns `undefined` if there is no interval in the given month', () => {
      expect(juneInterval.startOfMonth(5)).toBeUndefined();
      expect(juneInterval.startOfMonth(7)).toBeUndefined();
    });
  });

  describe('`rename` method', () => {
    it('renames the interval', () => {
      const hourInterval = fixtures.makeIntervalData(
        [
          ['June 2, 2020 18:00:00', 1],
          ['June 2, 2020 19:00:00', 2],
        ],
        'Hour interval'
      );
      expect(hourInterval.name).toEqual('Hour interval');

      const renamed = hourInterval.rename('60-minute interval');
      expect(renamed.name).toEqual('60-minute interval');
      expect(renamed).toStrictEqual(hourInterval);
    });
  });

  describe('helper methods', () => {
    const nullDateRange = { date_range: null };
    function makeDateRangeWithDuration(
      duration: DurationObject,
      startISO: string = '2020-01-01T00:00:00'
    ) {
      const startDate = DateTime.fromISO(startISO);
      return {
        date_range: [
          startDate.toJSDate(),
          startDate.plus(Duration.fromObject(duration)).toJSDate(),
        ],
      } as DateRange;
    }

    describe('`spansMultipleYears` method', () => {
      it('returns `false` if no object is provided', () => {
        expect(interval.spansMultipleYears(undefined)).toBeFalsy();
      });

      it('returns `false` if the object does not have a date range', () => {
        expect(interval.spansMultipleYears(nullDateRange)).toBeFalsy();
      });

      it('returns `false` if the date range starts and ends in the same calendar year', () => {
        for (let i = 1; i <= 366; i++) {
          const result = interval.spansMultipleYears(makeDateRangeWithDuration({ days: i }));
          expect(result).toBeFalsy();
        }
      });

      it('returns `true` if the object has a date range greater than 366 days', () => {
        const result = interval.spansMultipleYears(makeDateRangeWithDuration({ days: 367 }));
        expect(result).toBeTruthy();
      });

      it('returns `true` if the range is less than 366 days long but crosses years', () => {
        const result = interval.spansMultipleYears(
          makeDateRangeWithDuration({ days: 20 }, '2020-12-25T00:00:00')
        );
        expect(result).toBeTruthy();
      });
    });

    describe('`getStartingYear` method', () => {
      it('returns `null` if no object is provided', () => {
        expect(interval.getStartDate(undefined)).toBeNull();
      });

      it('returns `false` if the object does not have a date range', () => {
        expect(interval.getStartDate(nullDateRange)).toBeNull();
      });

      it("returns the year of the range's starting date", () => {
        const result = interval.getStartDate(makeDateRangeWithDuration({ days: 367 }));
        expect(result!.year).toEqual(2020);
        expect(result!.month).toEqual(1);
        expect(result!.day).toEqual(1);
      });
    });

    describe('`hasYear` method', () => {
      const dateTime2019 = DateTime.fromObject({ year: 2019 });
      const dateTime2020 = DateTime.fromObject({ year: 2020 });

      it('returns `true` if the year is null', () => {
        expect(interval.hasYear(undefined, null)).toBeTruthy();
        expect(interval.hasYear(nullDateRange, null)).toBeTruthy();
      });

      it('returns `false` if no object is provided', () => {
        expect(interval.hasYear(undefined, dateTime2020)).toBeFalsy();
      });

      it('returns `false` if the object does not have a date range', () => {
        expect(interval.hasYear(nullDateRange, dateTime2020)).toBeFalsy();
      });

      it('returns `false` if the object has a different year', () => {
        expect(
          interval.hasYear(
            makeDateRangeWithDuration({ days: 367 }, '2018-01-01T00:00:00'),
            dateTime2019
          )
        ).toBeFalsy();
      });

      it('returns `true` if the object has the given year', () => {
        expect(
          interval.hasYear(
            makeDateRangeWithDuration({ days: 367 }, '2020-01-01T00:00:00'),
            dateTime2020
          )
        ).toBeTruthy();
      });
    });

    describe('`getDateRangeInterval` method', () => {
      it('returns `null` when no object is provided', () => {
        expect(interval.getDateRangeInterval(undefined)).toBeNull();
      });

      it('returns `null` when the object has no date range', () => {
        expect(interval.getDateRangeInterval(nullDateRange)).toBeNull();
      });

      it('returns an interval when no unit is passed', () => {
        const rangeObject = makeDateRangeWithDuration({ days: 1 });
        const dateRange = interval.getDateRangeInterval(rangeObject);
        expect(dateRange).toBeInstanceOf(Interval);
        expect(dateRange?.length('days')).toEqual(1);
      });

      it('returns a number when a unit is passed', () => {
        const rangeObject = makeDateRangeWithDuration({ years: 1 });
        expect(interval.getDateRangeInterval(rangeObject, 'days')).toEqual(366);
        expect(interval.getDateRangeInterval(rangeObject, 'months')).toEqual(12);
        expect(interval.getDateRangeInterval(rangeObject, 'years')).toEqual(1);
      });
    });
  });
});
