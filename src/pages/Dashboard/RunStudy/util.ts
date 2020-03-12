import { DerType } from '@nav/shared/models/der';
import * as routes from '@nav/shared/routes';


export const stepPaths = [
  routes.dashboard.runStudy.selectDers,
  routes.dashboard.runStudy.selectCustomers,
  routes.dashboard.runStudy.review
];

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
export function validateDerSelections (ders: Partial<DERSelection>[]) {
  if (ders.length === 0) return false;
  
  return ders.every((der) => {
    const hasType = !!der.type;
    const hasConfiguration = !!der.configurationId;
    const hasStrategy = !!der.strategyId;
    return hasType && hasConfiguration && hasStrategy;
  });
}
