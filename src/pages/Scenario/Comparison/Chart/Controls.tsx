import * as React from 'react';

import { Card, Fade, Flex, Select, Switch } from 'navigader/components';
import { makeStylesHook } from 'navigader/styles';
import { AggregationState, SizingOption } from './types';


/** ============================ Types ===================================== */
type ControlsProps = {
  aggregation: AggregationState;
  sizing: SizingOption;
  updateAggregation: (aggregate: AggregationState) => void;
  updateSizing: (size: SizingOption) => void;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  sizingSelect: {
    marginLeft: theme.spacing(2)
  }
}), 'ScenarioComparisonChartControls');

/** ============================ Components ================================ */
export const Controls: React.FC<ControlsProps> = (props) => {
  const { aggregation, sizing, updateSizing, updateAggregation } = props;
  const classes = useStyles();

  return (
    <Card raised>
      <Switch
        checked={aggregation === 'aggregated'}
        label="Aggregate Customers"
        onChange={handleSwitchChange}
      />
      
      <Fade in={aggregation === 'aggregated'}>
        <Flex.Container alignItems="center">
          <Flex.Item>
            Size scenarios by:
          </Flex.Item>
          <Flex.Item className={classes.sizingSelect}>
            <Select
              onChange={(newSizing: SizingOption) => updateSizing(newSizing)}
              options={[
                SizingOption.CohortSize,
                SizingOption.GHGImpactPerCustomer,
                SizingOption.BillImpactPerCustomer
              ]}
              value={sizing}
            />
          </Flex.Item>
        </Flex.Container>
      </Fade>
    </Card>
  );
  
  /** ============================ Callbacks =============================== */
  function handleSwitchChange (checked: boolean) {
    updateAggregation(checked ? 'aggregated' : 'disaggregated');
  }
};
