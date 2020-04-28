import sumBy from 'lodash/sumBy';

import { DerType } from '@nav/common/models/der';
import * as routes from '@nav/common/routes';
import { MeterGroup } from '@nav/common/models/meter';


// Order of steps
export const stepPaths = [
  routes.dashboard.createScenario.selectDers,
  routes.dashboard.createScenario.selectCustomers,
  routes.dashboard.createScenario.review
];

// Indices of steps
export const stepNumbers = {
  selectDers: stepPaths.indexOf(routes.dashboard.createScenario.selectDers),
  selectCustomers: stepPaths.indexOf(routes.dashboard.createScenario.selectCustomers),
  review: stepPaths.indexOf(routes.dashboard.createScenario.review),
};

export type DERSelection = {
  configurationId: string;
  strategyId: string;
  type: DerType;
};

/**
 * Validates that the DER selections are valid. In order for the selection to be valid, there must
 * be at least one DER selected, and every selection needs to have a DER type, configuration and
 * strategy. Returns `true` if the DER selections are valid.
 *
 * @param {DERSelection} ders: the DER selections to validate
 */
export function validateDerSelections (ders: Partial<DERSelection>[]): ders is DERSelection[] {
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
 * least one meter must be included-- which means at least one non-empty meter group must be
 * selected. Returns `true` if the customer selections are valid.
 *
 * @param {MeterGroup[]} meterGroups: the customer selections to validate
 */
export function validateCustomerSelections (meterGroups: MeterGroup[]) {
  if (meterGroups.length === 0) return false;
  return sumBy(meterGroups, 'meter_count') > 0;
}
