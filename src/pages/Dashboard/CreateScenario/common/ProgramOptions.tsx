import * as React from 'react';

import { Flex, Select } from 'navigader/components';
import { makeStylesHook } from 'navigader/styles';
import { BatteryConfiguration, BatteryStrategy, DerStrategyType } from 'navigader/types';
import _ from 'navigader/util/lodash';
import { DERSelection } from './util';


/** ============================ Types ===================================== */
type ProgramOptionsProps = {
  configurations: BatteryConfiguration[];
  der: Partial<DERSelection>;
  strategies: BatteryStrategy[];
  update: (der: Partial<DERSelection>) => void;
};

// Makes the "configurations" and "strategies" types non-required. When those resources are still
// loading, we will not render any program options
type LoadedProps = 'configurations' | 'strategies';
type ProgramOptionsWhileLoadingProps =
  | Omit<ProgramOptionsProps, LoadedProps>
  & Partial<Pick<ProgramOptionsProps, LoadedProps>>

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(() => ({
  configurationSelect: {
    width: 200
  },
  strategySelect: {
    maxWidth: 300
  }
}), 'ProgramOptions');

/** ============================ Components ================================ */
const BatteryOptions: React.FC<ProgramOptionsProps> = (props) => {
  const { configurations, der, strategies, update } = props;
  const classes = useStyles();
  const configuration = _.find(configurations, { id: der.configurationId });
  const strategy = _.find(strategies, { id: der.strategyId });
  
  // Split the strategies by objective
  const strategyGroups = _.sortBy(
    _.toPairs(
      _.groupBy(strategies, 'objective')
    ).map(([strategyType, strategies]) => ({
      title: formatStrategyType(strategyType as DerStrategyType),
      options: strategies
    })),
    'title'
  );

  return (
    <>
      <Flex.Item>
        <Select
          className={classes.configurationSelect}
          label="Configuration"
          onChange={updateConfiguration}
          options={configurations}
          renderOption="name"
          sorted
          value={configuration}
        />
      </Flex.Item>
      
      <Flex.Item>
        <Select
          className={classes.strategySelect}
          label="Strategy"
          onChange={updateStrategy}
          optionSections={strategyGroups}
          renderOption="name"
          sorted
          value={strategy}
        />
      </Flex.Item>
    </>
  );
  
  /** ============================ Callbacks =============================== */
  function updateConfiguration (configuration: BatteryConfiguration) {
    update({ configurationId: configuration.id });
  }
  
  function updateStrategy (strategy: BatteryStrategy) {
    update({ strategyId: strategy.id });
  }
  
  /** ============================ Helpers ================================= */
  function formatStrategyType (type: DerStrategyType) {
    switch (type) {
      case 'load_flattening':
        return 'Load Flattening';
      case 'reduce_bill':
        return 'Bill Reduction';
      case 'reduce_ghg':
        return 'GHG Reduction';
      case 'reduce_cca_finance':
        return 'Minimize CCA Financial Impacts';
      default:
        return 'Uncategorized';
    }
  }
};

export const ProgramOptions: React.FC<ProgramOptionsWhileLoadingProps> = (props) => {
  const { configurations, der, strategies } = props;
  
  // If we don't yet have the configurations/strategies, don't render
  if (!configurations || !strategies) return null;
  
  // This is functionally the same as just `{ ...props }`, but specifying the `configurations` and
  // `strategies` props explicitly is necessary for the type-guard above to work
  const optionProps = {
    ...props,
    configurations,
    strategies,
  };
  
  if (der.type === 'Battery') {
    return <BatteryOptions {...optionProps} />;
  } else {
    return null;
  }
};
