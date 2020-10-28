import { EnhancedStore } from '@reduxjs/toolkit';
import { HookResult } from '@testing-library/react-hooks';

import { makeStore } from 'navigader/store';
import { CAISORate } from 'navigader/types';
import { serializers } from 'navigader/util';
import { fixtures, makePaginationResponse, mockFetch } from 'navigader/util/testing';
import { useCAISORates } from './cost';
import { assertAPICalled, testHook } from './test_utils';

describe('Cost hooks', () => {
  // Make a fresh store before each test
  let store: EnhancedStore;
  beforeEach(() => (store = makeStore()));

  describe('`useCAISORates` hook', () => {
    function assertCAISORateAPICalled(result: HookResult<CAISORate[] | undefined>) {
      assertAPICalled('/cost/caiso_rate/', result, (rates) => {
        expect(rates).toHaveLength(1);
        expect(rates![0].id).toEqual(fixtures.caisoRate.id);
      });
    }

    beforeEach(() => {
      mockFetch([
        ['/cost/caiso_rate/', makePaginationResponse({ caiso_rates: [fixtures.caisoRate] })],
      ]);
    });

    it('uses the API if there are no rates in the store', async () => {
      assertCAISORateAPICalled(await testHook(store, useCAISORates));
    });

    it('uses the API if there are no rates in the store which match the filters', async () => {
      const rateDifferentYear = { ...fixtures.caisoRate, id: 2, name: 'PRC_LMP 2019', year: 2019 };
      const rateNoData = { ...fixtures.caisoRate, id: 3, data: {} };
      const rateDifferentPeriod = {
        ...fixtures.caisoRate,
        id: 4,
        data: {
          default: {
            'start': ['2018-01-01T00:00:00', '2018-01-01T00:15:00'],
            '$/kwh': [0.03645428, 0.03476417],
          },
        },
      };

      // Request rate from 2018 with 1-hour period data
      const rates = [rateDifferentYear, rateNoData, rateDifferentPeriod];
      const rateFilters = { year: 2018, data: 'default', period: 60 };
      const result = await testHook(
        store,
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
      const caisoRate = serializers.parseCAISORate(fixtures.caisoRate);
      const result = await testHook(store, useCAISORates, [caisoRate], rateFilters);

      expect(result.current).toHaveLength(1);

      // Assert API hasn't been called
      expect(fetchMock).toHaveBeenCalledTimes(0);

      // Hook should return the rate
      expect(result.current).toHaveLength(1);
      expect(result.current![0]).toMatchObject(caisoRate);
    });
  });
});
