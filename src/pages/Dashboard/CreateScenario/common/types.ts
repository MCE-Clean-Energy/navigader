import * as api from 'navigader/api';
import {
  CostFunctions,
  DERConfiguration,
  DERStrategy,
  DERType,
  Loader,
  Nullable,
  OriginFile,
  Scenario,
} from 'navigader/types';

export type DERSelection = {
  configurationId: string;
  strategyId: string;
  type: DERType;
};

export type CreateScenarioState = {
  costFunctionSelections: api.CostFunctionSelections;
  derSelections: Partial<DERSelection>[];
  originFileSelections: OriginFile['id'][];
  name: Nullable<string>;
  scenarioSelections: Scenario['id'][];
};

export type CreateScenarioScreenProps = {
  // Data props
  costFunctions: { [CF in keyof CostFunctions]: Loader<CostFunctions[CF][]> };
  derConfigurations: Loader<DERConfiguration[]>;
  derStrategies: Loader<DERStrategy[]>;
  originFiles: Loader<OriginFile[]>;
  scenarios: Loader<Scenario[]>;

  // State props
  state: CreateScenarioState;
  updateState: (state: Partial<CreateScenarioState>) => void;
};
