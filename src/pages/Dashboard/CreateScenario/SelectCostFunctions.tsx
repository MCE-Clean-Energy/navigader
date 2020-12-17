import * as React from 'react';

import { Card, Grid, List, Radio, Typography } from 'navigader/components';
import { makeStylesHook } from 'navigader/styles';
import { CAISORate, GHGRate, Loader, Maybe, RatePlan, SystemProfile } from 'navigader/types';

import { CreateScenarioScreenProps, CreateScenarioState } from './common';

/** ============================ Types ===================================== */
type CostFunction = GHGRate | RatePlan | CAISORate | SystemProfile;
type CostFunctionCardProps<T extends CostFunction> = {
  costFunctions: Loader<T[]>;
  onChange: (id: string) => void;
  title: string;
  value: Maybe<number>;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(
  (theme) => ({
    cardTitle: {
      padding: theme.spacing(2, 2, 0),
    },
    radioList: {
      maxHeight: 500,
      overflowY: 'auto',
    },
  }),
  'CostFunctionCard'
);

/** ============================ Components ================================ */
function CostFunctionCard<T extends CostFunction>(props: CostFunctionCardProps<T>) {
  const { costFunctions, onChange, title, value } = props;
  const classes = useStyles();
  return (
    <Card padding={0} raised>
      <Typography className={classes.cardTitle} useDiv variant="h6">
        {title}
      </Typography>
      <Radio.Group
        className={classes.radioList}
        onChange={onChange}
        value={value?.toString() || ''}
      >
        <List dense>
          {costFunctions.map((costFunction) => (
            <List.Item button={false} key={costFunction.id}>
              <Radio
                label={<Typography variant="body2">{costFunction.name}</Typography>}
                value={costFunction.id.toString()}
              />
            </List.Item>
          ))}
        </List>
      </Radio.Group>
    </Card>
  );
}

export const SelectCostFunctions: React.FC<CreateScenarioScreenProps> = (props) => {
  const { costFunctions, state, updateState } = props;
  return (
    <Grid>
      <Grid.Item span={3}>
        <CostFunctionCard
          title="GHG Rates"
          costFunctions={costFunctions.ghgRate}
          onChange={makeOnChangeCallback('ghgRate')}
          value={state.costFunctionSelections.ghgRate}
        />
      </Grid.Item>

      <Grid.Item span={3}>
        <CostFunctionCard
          title="Procurement Rates"
          costFunctions={costFunctions.caisoRate}
          onChange={makeOnChangeCallback('caisoRate')}
          value={state.costFunctionSelections.caisoRate}
        />
      </Grid.Item>

      <Grid.Item span={3}>
        <CostFunctionCard
          title="Rate Plans"
          costFunctions={costFunctions.ratePlan}
          onChange={makeOnChangeCallback('ratePlan')}
          value={state.costFunctionSelections.ratePlan}
        />
      </Grid.Item>

      <Grid.Item span={3}>
        <CostFunctionCard
          title="Resource Adequacy Costs"
          costFunctions={costFunctions.systemProfile}
          onChange={makeOnChangeCallback('systemProfile')}
          value={state.costFunctionSelections.systemProfile}
        />
      </Grid.Item>
    </Grid>
  );

  function makeOnChangeCallback(key: keyof CreateScenarioState['costFunctionSelections']) {
    return (value: string) => {
      updateState({
        costFunctionSelections: {
          ...state.costFunctionSelections,
          [key]: +value,
        },
      });
    };
  }
};
