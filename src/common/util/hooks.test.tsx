import * as React from 'react';
import { Provider } from 'react-redux';
import { renderHook, HookResult } from '@testing-library/react-hooks'

import { makeStore, slices } from 'navigader/store';
import { CAISORate, RawCAISORate } from 'navigader/types';
import { serializers } from 'navigader/util';
import { useCAISORates } from './hooks';
import { fixtures, makePaginationResponse, mockFetch } from './testing';


describe('Custom React hooks', () => {
  describe('`useCAISORates` hook', () => {
    /**
     * Bootstraps the hook test function
     *
     * @param {RawCAISORate[]} [rates]: CAISO rate objects to seed the store with
     * @param {CAISORateFilters} [args]: filters that can be used with the hook
     */
    async function testHook (rates?: RawCAISORate[], ...args: Parameters<typeof useCAISORates>) {
      // Make the store and add any CAISO rates to it
      const store = makeStore();
      store.dispatch(slices.models.updateModels((rates || []).map(serializers.parseCAISORate)));

      // Run the hook
      const { result, waitForNextUpdate } = renderHook(() => useCAISORates(...args), {
        wrapper: ({ children }) => <Provider store={store} >{children}</Provider>
      });
      
      // Wait for the async API calls to complete
      await waitForNextUpdate();
      return result;
    }
    
    function assertAPICalled (result: HookResult<CAISORate[] | undefined>) {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const callArgs = fetchMock.mock.calls[0];
      expect(callArgs[0]).toContain('/cost/caiso_rate/');
      
      // Hook should return the rate
      expect(result.current).toHaveLength(1);
      expect(result.current![0].id).toEqual(fixtures.caisoRate.id);
    }

    beforeEach(() => {
      mockFetch([
        ['/cost/caiso_rate/', makePaginationResponse({ caiso_rates: [fixtures.caisoRate] })]
      ]);
    });
    
    it('uses the API if there are no rates in the store', async () => {
      assertAPICalled(await testHook());
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
      const result = await testHook(rates, rateFilters);
      
      expect(result.current).toHaveLength(1);
      assertAPICalled(result);
    });
    
    it('skips the API if rate matching the filters is in the store', async () => {
      // Request rate from 2018 with 1-hour period data
      const rateFilters = { year: 2018, data: 'default', period: 60 };
      const result = await testHook([fixtures.caisoRate], rateFilters);
      expect(result.current).toHaveLength(1);

      // Assert API hasn't been called
      expect(fetchMock).toHaveBeenCalledTimes(0);

      // Hook should return the rate
      expect(result.current).toHaveLength(1);
      expect(result.current![0].id).toEqual(fixtures.caisoRate.id);
    });
  });
});
