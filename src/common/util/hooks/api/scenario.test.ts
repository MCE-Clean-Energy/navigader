import { EnhancedStore } from '@reduxjs/toolkit';

import * as api from 'navigader/api';
import { makeStore } from 'navigader/store';
import { Scenario } from 'navigader/types';
import { filterClause, models } from 'navigader/util';
import { fixtures, makePaginationResponse, mockFetch } from 'navigader/util/testing';
import { useScenarios } from './index';
import { testHook } from './test_utils';

describe('scenario hooks', () => {
  // Make a fresh store before each test
  let store: EnhancedStore;
  beforeEach(() => (store = makeStore()));

  describe('`useScenarios` hook', () => {
    const unfinishedScenario = fixtures.makeRawScenario({
      expected_der_simulation_count: 5,
      der_simulation_count: 10,
    });

    function testUseScenarios(
      initialScenarios: Scenario[],
      params: Partial<api.GetScenariosQueryParams> = {}
    ) {
      return testHook(store, useScenarios, initialScenarios, { ...params, page: 0, pageSize: 10 });
    }

    beforeEach(() => {
      mockFetch([['/cost/scenario/', makePaginationResponse({ scenarios: [unfinishedScenario] })]]);
    });

    it('adds retrieved scenarios to the store and to the polling', async () => {
      expect(store.getState().models.meterGroups).toHaveLength(0);
      const result = await testUseScenarios([]);
      expect(result.current).toHaveLength(1);
      expect(store.getState().models.meterGroups).toHaveLength(1);
      expect(models.polling['pollingIds'].scenarios.size).toEqual(1);
    });

    it('does not return stored scenarios that do not match the filters', async () => {
      const scenarioDifferentMeterId = fixtures.makeScenario({
        meter_group: undefined,
        meter_group_id: 'meter_group_1',
      });

      const scenarioNoMeterGroup = fixtures.makeScenario({
        meter_group: undefined,
        meter_group_id: undefined,
      });

      // Hook should return 0 even though there are scenarios in the store, because none match
      // the provided filters
      const result = await testUseScenarios([scenarioDifferentMeterId, scenarioNoMeterGroup], {
        filter: { 'meter_group.id': filterClause.equals('meter_group_2') },
      });
      expect(result.current).toHaveLength(0);
    });
  });
});
