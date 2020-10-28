import { useDispatch, useSelector } from 'react-redux';

import * as api from 'navigader/api';
import { slices, useMemoizedSelector } from 'navigader/store';
import { Loader, Scenario } from 'navigader/types';
import { models } from 'navigader/util/data';
import _ from 'navigader/util/lodash';
import { omitFalsey } from 'navigader/util/omitFalsey';
import { applyDataFilters, applyDynamicRestFilters, useAsync } from './util';

/**
 * Loads a scenario given its ID and params for querying
 *
 * @param {string} scenarioId: the ID of the scenario to get
 * @param {GetScenarioQueryParams} [params]: additional params for querying
 */
export function useScenario(scenarioId: string, params?: api.GetScenarioQueryParams) {
  const dispatch = useDispatch();

  // Check the store for scenarios that match the provided filters
  const storedScenario = useSelector(slices.models.selectScenario(scenarioId));
  const scenario = (() => {
    if (!storedScenario) return;
    const matchesDataTypes = applyDataFilters(storedScenario, params);
    const matchesFilters = applyScenarioDynamicRestFilters(storedScenario, params);
    return matchesDataTypes && matchesFilters ? storedScenario : undefined;
  })();

  const loading = useAsync(
    async () => {
      // If we've already loaded the scenario (with all required data), we don't need to do so again
      if (scenario) return;
      return api.getScenario(scenarioId, params);
    },
    (scenario) => {
      const meterGroup = scenario.meter_group;

      // Continue polling for scenarios and meter groups that haven't finished ingesting
      models.polling.addScenarios([scenario]);
      models.polling.addMeterGroups(omitFalsey([meterGroup]));

      // Add all of them to the store
      dispatch(slices.models.updateModels(omitFalsey([scenario, meterGroup])));
    },
    [scenarioId]
  );

  // Look up the scenario in the store
  return { scenario, loading };
}

/**
 * Loads scenarios, using the provided query params
 *
 * @param {GetScenariosQueryParams} [params]: additional params for querying
 */
export function useScenarios(params: api.GetScenariosQueryParams): Loader<Scenario[]> {
  const dispatch = useDispatch();

  // Fetch the scenarios
  const loading = useAsync(
    () => api.getScenarios(params),
    ({ data: scenarios }) => {
      const meterGroups = omitFalsey(_.map(scenarios, 'meter_group'));

      // Continue polling for scenarios and meter groups that haven't finished ingesting
      models.polling.addScenarios(scenarios);
      models.polling.addMeterGroups(meterGroups);

      // Add all of them to the store
      dispatch(slices.models.updateModels([...scenarios, ...meterGroups]));
    }
  );

  // Retrieve scenarios that match the provided filters from the store
  const selector = useMemoizedSelector(
    slices.models.selectScenarios,
    (state, params: api.GetScenariosQueryParams) => params,
    (scenarios, params) =>
      scenarios.filter((scenario) => {
        const matchesDataTypes = applyDataFilters(scenario, params);
        const matchesFilters = applyDynamicRestFilters(scenario, params);
        return matchesDataTypes && matchesFilters;
      })
  );

  const scenarios = useSelector((state) => selector(state, params));
  return Object.assign(scenarios, { loading });
}

/**
 * Applies scenario-specific dynamic rest filters to a scenario, returning `true` if the scenario
 * meets all of the filters and `false` if any do not pass
 *
 * @param {Scenario} scenario: the scenario to apply the filters to
 * @param {ScenarioDynamicRestParams} [params]: the scenario-specific dynamic rest params to apply
 */
function applyScenarioDynamicRestFilters(
  scenario: Scenario,
  params?: api.ScenarioDynamicRestParams
) {
  if (!applyDynamicRestFilters(scenario, params)) return false;

  // Check for each of the `include` params
  if (!params?.include) return true;
  const includeParams = typeof params.include === 'string' ? [params.include] : params.include;
  return _.every(includeParams, (param) => {
    switch (param) {
      case 'ders':
        return !_.isUndefined(scenario.der);
      case 'meter_group':
        return !_.isUndefined(scenario.meter_group_id);
      case 'meter_group.*':
        return !_.isUndefined(scenario.meter_group);
      case 'report':
        return !_.isUndefined(scenario.report);
      case 'report_summary':
        return !_.isUndefined(scenario.report_summary);
    }
  });
}
