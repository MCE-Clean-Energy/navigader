import _ from 'lodash';

import { Loader, OriginFile, Scenario } from 'navigader/types';
import { CreateScenarioScreenProps, CreateScenarioState } from '../common';

/** ============================ Types ===================================== */
type DataProps = Omit<CreateScenarioScreenProps, 'state' | 'updateState'>;
type MakeDataPropsArg = {
  originFiles: OriginFile[];
  scenarios: Scenario[];
};

/** ============================ Helpers =================================== */
/**
 * Test helper function for producing the various data props
 *
 * @param {Partial<DataProps>} customData: customized data to use while testing a screen component
 */
export function makeDataProps(customData?: MakeDataPropsArg): DataProps {
  function makeLoader<T>(arr?: Array<T>): Loader<T[]> {
    return Object.assign(_.clone(arr || []), { loading: typeof arr === 'undefined' });
  }

  return {
    costFunctions: {
      caisoRate: makeLoader(),
      ghgRate: makeLoader(),
      ratePlan: makeLoader(),
      systemProfile: makeLoader(),
    },
    derConfigurations: makeLoader(),
    derStrategies: makeLoader(),
    originFiles: makeLoader(customData?.originFiles),
    scenarios: makeLoader(customData?.scenarios),
  };
}

/**
 * Test helper function for producing the `state` prop that the screen components require.
 *
 * @param {Partial<CreateScenarioState>} state: a subset of state to override the defaults
 */
export function makeState(state?: Partial<CreateScenarioState>): CreateScenarioState {
  return {
    costFunctionSelections: {
      caisoRate: undefined,
      ghgRate: undefined,
      ratePlan: undefined,
    },
    derSelections: [],
    originFileSelections: [],
    name: null,
    scenarioSelections: [],
    startDate: null,
    ...state,
  };
}
