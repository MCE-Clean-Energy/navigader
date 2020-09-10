import * as React from 'react';
import { Provider } from 'react-redux';
import { renderHook, HookResult } from '@testing-library/react-hooks'

import { makeStore, slices } from 'navigader/store';
import { CAISORate, Frame288DataType } from 'navigader/types';
import { serializers } from 'navigader/util';
import { fixtures, makePaginationResponse, mockFetch } from '../testing';
import { applyDataFilters, useCAISORates, useMeterGroup } from './api';


describe('API hooks', () => {
  /**
   * Bootstraps the hook test function
   *
   * @param {Function} hook: the hook to test
   * @param {ModelClassExterior[]} [models]: models to seed the store with
   * @param {Parameters} [args]: filters that can be used with the hook
   */
  async function testHook <F extends (...args: any[]) => any>(
    hook: F,
    models?: slices.models.ModelClassExterior[],
    ...args: Parameters<F>
  ): Promise<HookResult<ReturnType<F>>> {
    // Make the store and add any models to it
    const store = makeStore();
    store.dispatch(slices.models.updateModels(models || []));

    // Run the hook
    const { result, waitForNextUpdate } = renderHook(() => hook(...args), {
      wrapper: ({ children }) => <Provider store={store} >{children}</Provider>
    });

    // Wait for the async API calls to complete
    await waitForNextUpdate();
    return result;
  }

  /**
   * Helper for asserting that the mocked API route was called by a hook
   *
   * @param {string} route: the route that we expect a call was made to
   * @param {HookResult} result: the response from the `renderHook` function
   * @param {Function} [assertFn]: an optional function to make assertions on the hook return value
   */
  function assertAPICalled <T>(route: string, result: HookResult<T>, assertFn: (resp: T) => void) {
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const callArgs = fetchMock.mock.calls[0];
    expect(callArgs[0]).toContain(route);

    // Hook should return the rate
    assertFn(result.current);
  }

  // Common test fixture
  const hourInterval = fixtures.makeIntervalData([
    ['2020-06-02T18:00:00', 1],
    ['2020-06-02T19:00:00', 2],
    ['2020-06-02T20:00:00', 3],
    ['2020-06-02T21:00:00', 4]
  ]);

  describe('`applyDataFilters` helper', () => {
    it('returns `false` if no model is provided', () => {
      expect(applyDataFilters(undefined, undefined)).toBeFalsy();
    });

    it('returns `true` if a model is provided but no filters are', () => {
      expect(applyDataFilters({ data: {} }, {})).toBeTruthy();
    });

    it('applies single `data_types` filters appropriately', () => {
      // "default" filter
      expect(applyDataFilters(
        { data: { default: fixtures.makeIntervalData([]) }},
        { data_types: 'default' }
      )).toBeTruthy();

      expect(applyDataFilters(
        { data: {}},
        { data_types: 'default' }
      )).toBeFalsy();

      // Frame 288 filters
      const frame288Types: Frame288DataType[] = ['average', 'maximum', 'minimum'];
      frame288Types.forEach((frame288Type) => {
        expect(applyDataFilters(
          { data: { [frame288Type]: fixtures.makeFrame288(() => 1) }},
          { data_types: frame288Type }
        )).toBeTruthy();

        expect(applyDataFilters(
          { data: {}},
          { data_types: frame288Type }
        )).toBeFalsy();
      });
    });

    it('applies multiple `data_types` filters appropriately', () => {
      const compoundDataObject = {
        data: {
          default: fixtures.makeIntervalData([]),
          average: fixtures.makeFrame288(() => 1)
        }
      };

      // should handle multiple data types that are present
      expect(
        applyDataFilters(compoundDataObject, { data_types: ['average', 'default'] })
      ).toBeTruthy();

      // should handle subsets of present data types
      expect(applyDataFilters(compoundDataObject, { data_types: 'average' })).toBeTruthy();
      expect(applyDataFilters(compoundDataObject, { data_types: ['average'] })).toBeTruthy();
      expect(applyDataFilters(compoundDataObject, { data_types: 'default' })).toBeTruthy();
      expect(applyDataFilters(compoundDataObject, { data_types: ['default'] })).toBeTruthy();

      // should handle data types not present
      expect(
        applyDataFilters(compoundDataObject, { data_types: ['average', 'default', 'minimum'] })
      ).toBeFalsy();

      expect(
        applyDataFilters(compoundDataObject, { data_types: ['average', 'minimum'] })
      ).toBeFalsy();

      expect(applyDataFilters(compoundDataObject, { data_types: 'minimum' })).toBeFalsy();
    });

    it('applies `period` filters appropriately', () => {
      expect(applyDataFilters(
        { data: {} },
        { period: 60 }
      )).toBeFalsy();

      expect(applyDataFilters(
        { data: { default: hourInterval }},
        { period: 60 }
      )).toBeTruthy();

      expect(applyDataFilters(
        { data: { default: hourInterval }},
        { period: 15 }
      )).toBeFalsy();
    });

    it('applies combined filters', () => {
      expect(applyDataFilters(
        { data: { default: hourInterval }},
        { data_types: 'default', period: 60 }
      )).toBeTruthy();

      // wrong period
      expect(applyDataFilters(
        { data: { default: hourInterval }},
        { data_types: 'default', period: 15 }
      )).toBeFalsy();

      // wrong data type
      expect(applyDataFilters(
        { data: { default: hourInterval }},
        { data_types: ['default', 'average'], period: 60 }
      )).toBeFalsy();
    });
  });

  describe('`useCAISORates` hook', () => {
    function assertCAISORateAPICalled (result: HookResult<CAISORate[] | undefined>) {
      assertAPICalled(
        '/cost/caiso_rate/',
        result,
        (rates) => {
          expect(rates).toHaveLength(1);
          expect(rates![0].id).toEqual(fixtures.caisoRate.id)
        }
      );
    }

    beforeEach(() => {
      mockFetch([
        ['/cost/caiso_rate/', makePaginationResponse({ caiso_rates: [fixtures.caisoRate] })]
      ]);
    });

    it('uses the API if there are no rates in the store', async () => {
      assertCAISORateAPICalled(await testHook(useCAISORates));
    });

    it('uses the API if there are no rates in the store which match the filters', async () => {
      const rateDifferentYear = { ...fixtures.caisoRate, id: 2, name: 'PRC_LMP 2019', year: 2019 };
      const rateNoData = { ...fixtures.caisoRate, id: 3, data: {} };
      const rateDifferentPeriod = {
        ...fixtures.caisoRate,
        id: 4,
        data: {
          default: {
            start: ['2018-01-01T00:00:00', '2018-01-01T00:15:00'],
            '$/kwh': [0.03645428, 0.03476417]
          }
        }
      };

      // Request rate from 2018 with 1-hour period data
      const rates = [rateDifferentYear, rateNoData, rateDifferentPeriod];
      const rateFilters = { year: 2018, data: 'default', period: 60 };
      const result = await testHook(
        useCAISORates,
        rates.map(serializers.parseCAISORate),
        rateFilters
      );

      expect(result.current).toHaveLength(1);
      assertCAISORateAPICalled(result);
    });

    it('skips the API if rate matching the filters is in the store', async () => {
      // Request rate from 2018 with 1-hour period data
      const rateFilters = { year: 2018, data: 'default', period: 60 };
      const result = await testHook(
        useCAISORates,
        [serializers.parseCAISORate(fixtures.caisoRate)],
        rateFilters
      );

      expect(result.current).toHaveLength(1);

      // Assert API hasn't been called
      expect(fetchMock).toHaveBeenCalledTimes(0);

      // Hook should return the rate
      expect(result.current).toHaveLength(1);
      expect(result.current![0].id).toEqual(fixtures.caisoRate.id);
    });
  });

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

    it('uses the API if there are no rates in the store', async () => {
      assertMeterGroupAPICalled(await testHook(useMeterGroup, [], testMeterGroup.id));
    });

    it('uses the API if the data_types filter does not match', async () => {
      const result = await testHook(
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
        useMeterGroup,
        [meterGroup15Mins],
        testMeterGroup.id,
        { period: 60 }
      );

      assertMeterGroupAPICalled(result);
    });

    it('skips the API if a meter group matching the filters is in the store', async () => {
      const result = await testHook(
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
