import { EnhancedStore } from '@reduxjs/toolkit';
import { HookResult } from '@testing-library/react-hooks'

import { makeStore } from 'navigader/store';
import { serializers } from 'navigader/util';
import { fixtures, mockFetch } from 'navigader/util/testing';
import { useMeterGroup } from './load';
import { assertAPICalled, hourInterval, testHook } from './test_utils';


describe('load hooks', () => {
  // Make a fresh store before each test
  let store: EnhancedStore;
  beforeEach(() => store = makeStore());

  describe('`useMeterGroup` hook', () => {
    const meterGroupName = 'My meter group';
    const testMeterGroup = fixtures.makeOriginFile({
      data: { default: hourInterval.rename(meterGroupName) },
      name: meterGroupName
    });

    function assertMeterGroupAPICalled (result: HookResult<ReturnType<typeof useMeterGroup>>) {
      assertAPICalled('/load/meter_group/', result, resp => {
        expect(resp.loading).toBeFalsy();
        expect(resp.meterGroup?.id).toEqual(testMeterGroup.id);
      });
    }

    beforeEach(() => {
      mockFetch([
        ['/load/meter_group/', { meter_group: serializers.serializeMeterGroup(testMeterGroup) }]
      ]);
    });

    it('uses the API if there are no meter groups in the store', async () => {
      assertMeterGroupAPICalled(await testHook(store, useMeterGroup, [], testMeterGroup.id));
    });

    it('uses the API if the data_types filter does not match', async () => {
      const result = await testHook(
        store,
        useMeterGroup,
        [{ ...testMeterGroup, data: {} }],
        testMeterGroup.id,
        { data_types: 'default' }
      );

      assertMeterGroupAPICalled(result);
    });

    it('uses the API if the period filter does not match', async () => {
      const meterGroup15Mins = {
        ...testMeterGroup,
        data: {
          default: fixtures.makeIntervalData([
            ['2020-06-02T18:00:00', 1],
            ['2020-06-02T18:15:00', 2],
            ['2020-06-02T18:30:00', 3],
            ['2020-06-02T18:45:00', 4]
          ])
        }
      };

      const result = await testHook(
        store,
        useMeterGroup,
        [meterGroup15Mins],
        testMeterGroup.id,
        { period: 60 }
      );

      assertMeterGroupAPICalled(result);
    });

    it('skips the API if a meter group matching the filters is in the store', async () => {
      const result = await testHook(
        store,
        useMeterGroup,
        [testMeterGroup],
        testMeterGroup.id,
        { data_types: 'default', period: 60 }
      );

      // Assert API hasn't been called
      expect(fetchMock).toHaveBeenCalledTimes(0);

      // Hook should return the rate
      expect(result.current.loading).toBeFalsy();
      expect(result.current.meterGroup).toMatchObject(testMeterGroup);
    });
  });
});
