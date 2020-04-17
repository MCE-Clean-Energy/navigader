import * as React from 'react';
import find from 'lodash/find';

import { Flex, Select } from '@nav/shared/components';
import { BatteryConfiguration, BatteryStrategy } from '@nav/shared/models/der';
import { makeStylesHook } from '@nav/shared/styles';
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
const useStyles = makeStylesHook(theme => ({
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
  const configuration = find(configurations, { id: der.configurationId });
  const strategy = find(strategies, { id: der.strategyId });
  
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
          options={strategies}
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
  
  switch (der.type) {
    case 'Battery':
      return <BatteryOptions {...optionProps} />;
    case 'Solar Panel':
      return null;
    default:
      return null;
  }
};
