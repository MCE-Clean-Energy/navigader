import { Frame288Numeric } from 'navigader/util';
import { fixtures } from 'navigader/util/testing';
import { IntervalData, makeIntervalData } from './interval';


describe('`IntervalData` class', () => {
  /** ============================ Test fixtures =========================== */
  const kwInterval = makeIntervalData({
    times: ['June 2, 2020 18:00:00', 'June 2, 2020 18:15:00', 'June 2, 2020 18:30:00'],
    kw: [1, 2, 3],
    name: 'KW interval'
  }, 'times', 'kw');

  const sparseInterval = new IntervalData([
    { timestamp: new Date('1/1/2020 18:00:00'),  value: 1 },
    { timestamp: new Date('2/1/2020 18:00:00'),  value: 1 },
    { timestamp: new Date('3/1/2020 18:00:00'),  value: 1 },
    { timestamp: new Date('4/1/2020 18:00:00'),  value: 1 },
    { timestamp: new Date('5/1/2020 18:00:00'),  value: 1 },
    { timestamp: new Date('6/1/2020 18:00:00'),  value: 1 },
    { timestamp: new Date('7/1/2020 18:00:00'),  value: 1 },
    { timestamp: new Date('8/1/2020 18:00:00'),  value: 1 },
    { timestamp: new Date('9/1/2020 18:00:00'),  value: 1 },
    { timestamp: new Date('10/1/2020 18:00:00'), value: 1 },
    { timestamp: new Date('11/1/2020 18:00:00'), value: 1 },
    { timestamp: new Date('12/1/2020 18:00:00'), value: 1 },
  ], 'Sparse interval');

  const juneInterval = new IntervalData([
    { timestamp: new Date('June 2, 2020 18:00:00'), value: 1 },
    { timestamp: new Date('June 2, 2020 18:15:00'), value: 2 },
    { timestamp: new Date('June 2, 2020 18:30:00'), value: 3 },
    { timestamp: new Date('June 2, 2020 18:45:00'), value: 4 }
  ], 'June interval');

  // Frame288 where each month has the same hour values, which are equal to their hour index
  const hourFrame288 = new Frame288Numeric(fixtures.makeFrame288((m, h) => h));

  // Frame288 where each month's hour values are the same across the day, set to the month index
  const monthFrame288 = new Frame288Numeric(fixtures.makeFrame288(m => m));

  /** ============================ Tests =================================== */
  describe('`period` getter', () => {
    it('calculates the period correctly', () => {
      const hourInterval = new IntervalData([
        { timestamp: new Date('June 2, 2020 18:00:00'), value: 1 },
        { timestamp: new Date('June 2, 2020 19:00:00'), value: 2 }
      ], 'Hour interval');

      const fifteenMinuteInterval = new IntervalData([
        { timestamp: new Date('June 2, 2020 18:00:00'), value: 1 },
        { timestamp: new Date('June 2, 2020 18:15:00'), value: 2 }
      ], '15 minute interval');

      expect(hourInterval.period).toEqual(60);
      expect(fifteenMinuteInterval.period).toEqual(15);
    });
  });

  describe('`filter` method', () => {
    it('handles filtering by `start` date', () => {
      const filtered1 = juneInterval.filter({ start: new Date('June 2, 2020 18:15:00') });
      expect(filtered1.values()).toEqual([2, 3, 4]);

      // 1 second later and we lose the first datum
      const filtered2 = juneInterval.filter({ start: new Date('June 2, 2020 18:15:01') });
      expect(filtered2.values()).toEqual([3, 4]);
    });

    it('handles filtering by `end` date', () => {
      const filtered1 = juneInterval.filter({ end: new Date('June 2, 2020 18:30:00') });
      expect(filtered1.values()).toEqual([1, 2, 3]);

      // 1 second earlier and we lose the last datum
      const filtered2 = juneInterval.filter({ end: new Date('June 2, 2020 18:29:59') });
      expect(filtered2.values()).toEqual([1, 2]);
    });

    it('handles filtering by `range`', () => {
      expect(juneInterval.filter({
        range: [
          new Date('June 2, 2020 18:15:00'),
          new Date('June 2, 2020 18:45:00')
        ]
      }).values()).toEqual([2, 3, 4]);

      // start 1 second later and we lose the first datum
      expect(juneInterval.filter({
        range: [
          new Date('June 2, 2020 18:15:01'),
          new Date('June 2, 2020 18:45:00')
        ]
      }).values()).toEqual([3, 4]);

      // end 1 second earlier and we lose the last datum
      expect(juneInterval.filter({
        range: [
          new Date('June 2, 2020 18:15:01'),
          new Date('June 2, 2020 18:44:59')
        ]
      }).values()).toEqual([3]);
    });

    it('handles filtering by `month`', () => {
      expect(juneInterval.filter({ month: 5 }).values()).toEqual([]);
      expect(juneInterval.filter({ month: 6 }).values()).toEqual([1, 2, 3, 4]);
      expect(juneInterval.filter({ month: 7 }).values()).toEqual([]);

      const monthInterval = new IntervalData([
        { timestamp: new Date('June 2, 2020 18:00:00'), value: 1 },
        { timestamp: new Date('July 2, 2020 18:15:00'), value: 2 },
        { timestamp: new Date('August 2, 2020 18:30:00'), value: 3 },
        { timestamp: new Date('September 2, 2020 18:45:00'), value: 4 }
      ], 'summer');

      expect(monthInterval.filter({ month: 6 }).values()).toEqual([1]);
      expect(monthInterval.filter({ month: 7 }).values()).toEqual([2]);
      expect(monthInterval.filter({ month: 8 }).values()).toEqual([3]);
      expect(monthInterval.filter({ month: 9 }).values()).toEqual([4]);
    });
  });

  describe('`subtract` method', () => {
    it('subtracts corresponding values', () => {
      const juneSquaredInterval = juneInterval.map(({ value }) => value ** 2);
      expect(juneSquaredInterval.subtract(juneInterval).values()).toEqual([0, 2, 6, 12]);
    });

    it('drops intervals that do not align', () => {
      const interval1 = new IntervalData([
        { timestamp: new Date('June 2, 2020 17:45:00'), value: 1 },
        { timestamp: new Date('June 2, 2020 18:00:00'), value: 2 },
        { timestamp: new Date('June 2, 2020 18:15:00'), value: 3 },
        { timestamp: new Date('June 2, 2020 18:30:00'), value: 4 }
      ], 'earlier');

      const interval2 = new IntervalData([
        { timestamp: new Date('June 2, 2020 18:00:00'), value: 4 },
        { timestamp: new Date('June 2, 2020 18:15:00'), value: 3 },
        { timestamp: new Date('June 2, 2020 18:30:00'), value: 2 },
        { timestamp: new Date('June 2, 2020 18:45:00'), value: 1 }
      ], 'later');

      expect(interval1.subtract(interval2).values()).toEqual([-2, 0, 2]);

      // Dates don't align
      const june1Interval = new IntervalData([
        { timestamp: new Date('June 1, 2020 18:00:00'), value: 1 },
        { timestamp: new Date('June 1, 2020 18:15:00'), value: 2 },
        { timestamp: new Date('June 1, 2020 18:30:00'), value: 3 },
        { timestamp: new Date('June 1, 2020 18:45:00'), value: 4 }
      ], 'June 1');

      const june2Interval = new IntervalData([
        { timestamp: new Date('June 2, 2020 18:00:00'), value: 4 },
        { timestamp: new Date('June 2, 2020 18:15:00'), value: 3 },
        { timestamp: new Date('June 2, 2020 18:30:00'), value: 2 },
        { timestamp: new Date('June 2, 2020 18:45:00'), value: 1 }
      ], 'June 2');

      expect(june1Interval.subtract(june2Interval).values()).toEqual([]);
    });
  });

  describe('`divide` method', () => {
    it('divides the intervals value respectively', () => {
      const largeInterval = new IntervalData([
        { timestamp: new Date('June 2, 2020 18:00:00'), value: 100 },
        { timestamp: new Date('June 2, 2020 18:15:00'), value: 200 },
        { timestamp: new Date('June 2, 2020 18:30:00'), value: 450 },
        { timestamp: new Date('June 2, 2020 18:45:00'), value: 827 }
      ], 'large');

      expect(largeInterval.divide(100).values()).toEqual([1, 2, 4.5, 8.27]);
    });
  });

  describe('`multiply` method', () => {
    it('multiplies the intervals values respectively', () => {
      const largeInterval = new IntervalData([
        { timestamp: new Date('June 2, 2020 18:00:00'), value: 1 },
        { timestamp: new Date('June 2, 2020 18:15:00'), value: 2 },
        { timestamp: new Date('June 2, 2020 18:30:00'), value: 3 },
        { timestamp: new Date('June 2, 2020 18:45:00'), value: 4 }
      ], 'multiplier');

      expect(largeInterval.multiply(5).values()).toEqual([5, 10, 15, 20]);
    });
  });

  describe('`create` method', () => {
    it('creates an `IntervalData` from the provided object', () => {
      const kwInterval = makeIntervalData({
        times: ['June 2, 2020 18:00:00', 'June 2, 2020 18:15:00', 'June 2, 2020 18:30:00'],
        kw: [1, 2, 3],
        name: 'KW interval'
      }, 'times', 'kw');

      expect(kwInterval.name).toEqual('KW interval');
      expect(kwInterval.data).toEqual([
        { timestamp: new Date('June 2, 2020 18:00:00'), value: 1 },
        { timestamp: new Date('June 2, 2020 18:15:00'), value: 2 },
        { timestamp: new Date('June 2, 2020 18:30:00'), value: 3 },
      ])
    });
  });

  describe('`map` method', () => {
    it('applies the mapping function to each datum', () => {
      const squared = kwInterval.map(n => n.value ** 2);
      expect(squared.values()).toEqual([1, 4, 9]);
    });

    it('renames the interval if a name is provided', () => {
      // Name is replaced when provided
      const newName = 'New interval';
      expect(kwInterval.map(n => n.value + 1, newName).name).toEqual(newName);

      // Name is retained when new one is not provided
      expect(kwInterval.map(n => n.value + 1).name).toEqual(kwInterval.name);
    });
  });

  describe('`multiply288` method', () => {
    it('properly multiplies the 288 by hour of the day', () => {
      const multiplied = kwInterval.multiply288(hourFrame288);
      expect(multiplied.values()).toEqual([18, 36, 54]);
    });

    it('properly multiplies the 288 by month of the year', () => {
      const multiplied = sparseInterval.multiply288(monthFrame288);
      expect(multiplied.values()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });

    it('renames the interval if a name is provided', () => {
      // Name is replaced when provided
      const newName = 'New interval';
      expect(kwInterval.multiply288(hourFrame288, newName).name).toEqual(newName);
      expect(kwInterval.multiply288(monthFrame288, newName).name).toEqual(newName);

      // Name is retained when new one is not provided
      expect(kwInterval.multiply288(hourFrame288).name).toEqual(kwInterval.name);
      expect(kwInterval.multiply288(monthFrame288).name).toEqual(kwInterval.name);
    });
  });

  describe('`align288` method', () => {
    it('properly creates interval data with 288 values and the same domain', () => {
      const aligned = sparseInterval.align288(monthFrame288);
      expect(aligned.domain()).toEqual({
        timestamp: sparseInterval.domain().timestamp,
        value: [
          monthFrame288.getValueByMonthHour(1, 18),
          monthFrame288.getValueByMonthHour(12, 18)
        ]
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
      expect(sparseInterval.startOfMonth(1)).toEqual(new Date('1/1/2020 18:00:00'));
      expect(juneInterval.startOfMonth(6)).toEqual(new Date('6/2/2020 18:00:00'));
    });

    it('returns `undefined` if there is no interval in the given month', () => {
      expect(juneInterval.startOfMonth(5)).toBeUndefined();
      expect(juneInterval.startOfMonth(7)).toBeUndefined();
    });
  });
});
