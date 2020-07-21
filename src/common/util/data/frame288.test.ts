import _ from 'lodash';

import { Frame288NumericType, Frame288Options, MonthIndex } from 'navigader/types';
import { fixtures } from 'navigader/util/testing';
import { Frame288Numeric, PowerFrame288 } from './frame288';


/** ============================ Constants ================================= */
const months = _.range(1, 13) as MonthIndex[];

/** ============================ Tests ===================================== */
describe('Frame288Numeric', () => {
  describe('`divide` method', () => {
    const frame = makeFrame288((month, hour) => hour * 100, { name: 'frame288', units: 'kW' });
    
    it('divides all values in the frame', () => {
      const divided = frame.divide(100);
      months.forEach(
        monthIndex => divided.getMonth(monthIndex).forEach(
          (val, hour) => expect(val === hour)
        )
      );
    });
    
    it('retains the units and name', () => {
      const divided = frame.divide(100);
      expect(divided.name).toEqual('frame288');
      expect(divided.units).toEqual('kW');
    });
  });

  describe('`rename` method', () => {
    const originalFrame = new Frame288Numeric(
      fixtures.frame288,
      { name: 'original', units: 'kW' }
    );

    it('retains the units', () => {
      const newFrame = originalFrame.rename('new name');
      expect(newFrame.units).toEqual('kW');
    });

    it('returns a new frame with the given name, leaving the original alone', () => {
      const newFrame = originalFrame.rename('new name');
      expect(newFrame.name).toEqual('new name');
      expect(originalFrame.name).toEqual('original');
    });
  });
});

describe('PowerFrame288', () => {
  describe('`scale` method`', () => {
    function scale288WithMinAndMax (min: number, max: number) {
      return new PowerFrame288(
        makeFrame288(() => _.sample([min, max]) as number).frame
      ).scale();
    }
    
    it('handles kW values', async () => {
      const frame = scale288WithMinAndMax(-10, 750);
      expect(frame.units).toEqual('kW');
      expect(frame.getRange()).toEqual([-10, 750]);
    });
    
    it('handles MW values', async () => {
      const frame = scale288WithMinAndMax(-10000, 750000);
      expect(frame.units).toEqual('MW');
      expect(frame.getRange()).toEqual([-10, 750]);
    });
    
    it('handles GW values', async () => {
      const frame1 = scale288WithMinAndMax(-10000000, 750);
      expect(frame1.units).toEqual('GW');
      expect(frame1.getRange()).toEqual([-10, 0.00075]);
      
      const frame2 = scale288WithMinAndMax(10000000, 10000001);
      expect(frame2.units).toEqual('GW');
      expect(frame2.getRange()).toEqual([10, 10.000001]);
    });
  });
});

/** ============================ Helpers =================================== */
function makeFrame288 (fn: (month: MonthIndex, hour: number) => number, options?: Frame288Options) {
  return new Frame288Numeric(
    months.reduce(
      (memo, monthIndex) => {
        memo[monthIndex] = _.range(24).map(hour => fn(monthIndex, hour));
        return memo;
      },
      {} as Frame288NumericType
    ),
    options
  );
}
