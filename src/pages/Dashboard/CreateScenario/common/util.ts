import { routes } from 'navigader/routes';
import { OriginFile, Scenario } from 'navigader/types';
import _ from 'navigader/util/lodash';
import { DERSelection } from './types';

// Order of steps
export const stepPaths = [
  routes.dashboard.createScenario.selectCustomers,
  routes.dashboard.createScenario.selectDers,
  routes.dashboard.createScenario.selectCostFunctions,
  routes.dashboard.createScenario.review,
];

// Indices of steps
export const stepNumbers = {
  review: stepPaths.indexOf(routes.dashboard.createScenario.review),
  selectCostFunctions: stepPaths.indexOf(routes.dashboard.createScenario.selectCostFunctions),
  selectCustomers: stepPaths.indexOf(routes.dashboard.createScenario.selectCustomers),
  selectDers: stepPaths.indexOf(routes.dashboard.createScenario.selectDers),
};

/**
 * Validates that the DER selections are valid. In order for the selection to be valid, there must
 * be at least one DER selected, and every selection needs to have a DER type, configuration and
 * strategy. Returns `true` if the DER selections are valid.
 *
 * @param {DERSelection} ders: the DER selections to validate
 */
export function validateDerSelections(ders: Partial<DERSelection>[]): ders is DERSelection[] {
  if (ders.length === 0) return false;

  return ders.every((der) => {
    const hasType = !!der.type;
    const hasConfiguration = !!der.configurationId;
    const hasStrategy = !!der.strategyId;
    return hasType && hasConfiguration && hasStrategy;
  });
}

/**
 * Validates that the customer selections are valid. In order for the selection to be valid, at
 * least one meter must be included-- which means at least one non-empty meter group, or at
 * least 1 scenario must be selected. Returns `true` if the customer selections are valid.
 *
 * @param {OriginFile[]} originFiles: the meter group selections to validate
 * @param {Scenario[]} scenarios: the scenario selections to validate
 */
export function validateCustomerSelections(originFiles: OriginFile[], scenarios: Scenario[]) {
  if (scenarios.length) return true;
  if (originFiles.length === 0) return false;
  return _.sumBy(originFiles, 'meter_count') > 0;
}
