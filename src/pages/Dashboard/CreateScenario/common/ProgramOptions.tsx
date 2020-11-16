import _ from 'lodash';
import * as React from 'react';

import { Flex, Select } from 'navigader/components';
import { makeStylesHook } from 'navigader/styles';
import { DERConfiguration, DERStrategy, DERStrategyType } from 'navigader/types';
import { models } from 'navigader/util';
import { DERSelection } from './types';

/** ============================ Types ===================================== */
type ProgramOptionsProps = {
  configurations: DERConfiguration[];
  der: Partial<DERSelection>;
  strategies: DERStrategy[];
  update: (der: Partial<DERSelection>) => void;
};

// Makes the "configurations" and "strategies" types non-required. When those resources are still
// loading, we will not render any program options
type LoadedProps = 'configurations' | 'strategies';
type ProgramOptionsWhileLoadingProps = Omit<ProgramOptionsProps, LoadedProps> &
  Partial<Pick<ProgramOptionsProps, LoadedProps>>;

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(
  () => ({
    configurationSelect: {
      width: 200,
    },
    strategySelect: {
      maxWidth: 300,
    },
  }),
  'ProgramOptions'
);

/** ============================ Components ================================ */
export const ProgramOptions: React.FC<ProgramOptionsWhileLoadingProps> = (props) => {
  const { configurations, der, strategies, update } = props;
  const classes = useStyles();

  // If we don't yet have a DER type, don't render
  if (!der.type) return null;

  // If we don't yet have the configurations/strategies, don't render
  if (!configurations || !strategies) return null;

  // Get only the configurations/strategies for the current DER-type
  const derTypeConfigurations = _.filter(configurations, { der_type: der.type });
  const derTypeStrategies = _.filter(strategies, { der_type: der.type });

  const configuration = _.find(derTypeConfigurations, { id: der.configurationId });
  const strategy = _.find(derTypeStrategies, { id: der.strategyId });

  // Split the strategies by objective
  const strategyGroups = _.sortBy(
    _.toPairs(_.groupBy(derTypeStrategies, 'objective')).map(([strategyType, strategies]) => ({
      title: formatStrategyType(strategyType as DERStrategyType),
      options: strategies,
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
          options={derTypeConfigurations}
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
          optionTooltip={models.der.getStrategyDescription}
          renderOption="name"
          sorted
          value={strategy}
        />
      </Flex.Item>
    </>
  );

  /** ========================== Callbacks ================================= */
  function updateConfiguration(configuration: DERConfiguration) {
    update({ configurationId: configuration.id });
  }

  function updateStrategy(strategy: DERStrategy) {
    update({ strategyId: strategy.id });
  }

  /** ========================== Helpers =================================== */
  function formatStrategyType(type: DERStrategyType) {
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
