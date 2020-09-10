import * as React from 'react';

import {
  Card, Flex, CustomerImpacts, Grid, List, ScenarioComparison, Typography, Switch
} from 'navigader/components';
import { ColorMap, makeStylesHook } from 'navigader/styles';
import { Scenario } from 'navigader/types';


/** ============================ Types ===================================== */
type ScenarioComparisonChartProps = {
  aggregated: boolean;
  averaged: boolean;
  colorMap: ColorMap;
  highlightedId?: string;
  scenarios: Scenario[];
  updateAggregated: (aggregation: boolean) => void;
};

type ControlsProps = Pick<ScenarioComparisonChartProps, 'aggregated' | 'updateAggregated'>;
type LegendCardProps = Pick<ScenarioComparisonChartProps, 'colorMap' | 'scenarios'>;

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  legend: {
    flexGrow: 1,
    marginTop: theme.spacing(2),
    maxHeight: '100%',
    overflow: 'auto',
    position: 'relative'
  },
  legendHeader: {
    marginLeft: theme.spacing(1)
  },
  list: {
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%'
  },
  rightSideContainer: {
    height: '100%'
  }
}), 'ScenarioComparisonChart');

/** ============================ Components ================================ */
const Controls: React.FC<ControlsProps> = (props) => {
  const { aggregated, updateAggregated } = props;

  return (
    <Card raised>
      <Switch
        checked={aggregated}
        label="Aggregate Customers"
        onChange={handleSwitchChange}
      />
    </Card>
  );

  /** ========================== Callbacks ================================= */
  function handleSwitchChange (checked: boolean) {
    updateAggregated(checked);
  }
};

const LegendCard: React.FC<LegendCardProps> = ({ colorMap, scenarios }) => {
  const classes = useStyles();
  return (
    <Card className={classes.legend} padding={0} raised>
      <List className={classes.list}>
        <Typography className={classes.legendHeader} color="textSecondary" variant="body2">
          Legend
        </Typography>

        {scenarios.map(scenario =>
          <List.Item button={false} key={scenario.id}>
            <List.Item.Avatar color={colorMap.getColor(scenario.id)}>
              &nbsp;
            </List.Item.Avatar>
            <List.Item.Text>
              <Typography noWrap useDiv>
                {scenario.name}
              </Typography>
            </List.Item.Text>
          </List.Item>
        )}
      </List>
    </Card>
  );
};

export const ScenarioComparisonChart: React.FC<ScenarioComparisonChartProps> = (props) => {
  const { aggregated, averaged, colorMap, highlightedId, scenarios, updateAggregated } = props;
  const classes = useStyles();

  const chartProps = { colorMap, scenarios, highlight: highlightedId };
  return (
    <Grid>
      <Grid.Item span={8}>
        <Card padding={0} raised>
          {
            aggregated
              ? <ScenarioComparison {...chartProps} averaged={averaged} />
              : <CustomerImpacts {...chartProps} />
          }
        </Card>
      </Grid.Item>

      <Grid.Item span={4}>
        <Flex.Container className={classes.rightSideContainer} direction="column">
          <Controls aggregated={aggregated} updateAggregated={updateAggregated} />
          <LegendCard colorMap={colorMap} scenarios={scenarios} />
        </Flex.Container>
      </Grid.Item>
    </Grid>
  );
};
