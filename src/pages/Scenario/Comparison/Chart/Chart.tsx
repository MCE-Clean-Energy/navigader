import * as React from 'react';
import {
  VictoryAxis, VictoryLabel, VictoryScatter, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer
} from 'victory';

import { Card, Flex, GraphComponents, Grid, List, Typography } from 'navigader/components';
import { VictoryCallbackArg } from 'navigader/components/graphs/util';
import { ColorMap, makeStylesHook, primaryColor } from 'navigader/styles';
import { Scenario } from 'navigader/types';
import { buildChartConfiguration } from './configuration';
import { Controls } from './Controls';
import { ScenarioDatum } from './types';


/** ============================ Types ===================================== */
type ScenarioComparisonChartProps = {
  aggregated: boolean;
  averaged: boolean;
  colorMap: ColorMap;
  highlightedId?: string;
  scenarios: Scenario[];
  updateAggregated: (aggregation: boolean) => void;
};

type LegendCardProps = Pick<ScenarioComparisonChartProps, 'colorMap' | 'scenarios'>
type VictoryCallbackArgs = {
  datum: ScenarioDatum
}

const CHART_MARGIN = 30;

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
  
  // The height is defined in the material theme, but the theme's type definition says the `chart`
  // member is optional. Hence the `|| 350`.
  const height = VictoryTheme.material.chart?.height || 350;
  const chartConfig = buildChartConfiguration(scenarios, aggregated, averaged);
  
  return (
    <Grid>
      <Grid.Item span={8}>
        <Card padding={0} raised>
          <GraphComponents.NavigaderChart
            containerComponent={
              <VictoryVoronoiContainer
                labelComponent={<VictoryTooltip constrainToVisibleArea pointerLength={0} />}
                labels={pointLabel}
                responsive
              />
            }
            domain={chartConfig.domain}
            domainPadding={30}
            padding={CHART_MARGIN}
          >
            <VictoryAxis
              axisLabelComponent={<VictoryLabel y={height - CHART_MARGIN + 10} />}
              label={`${averaged ? 'Avg. ' : ''}Revenue Impacts ($/year)`}
            />

            <VictoryAxis
              axisLabelComponent={<VictoryLabel x={CHART_MARGIN - 10} />}
              dependentAxis
              label={`${averaged ? 'Avg. ' : ''}GHG Impacts (tCO2/year)`}
            />

            <VictoryScatter
              data={chartConfig.data}
              style={{
                data: {
                  fill: ({ datum }: VictoryCallbackArgs) => {
                    return datum.id === highlightedId
                      ? 'red'
                      : colorMap.getColor(datum.scenario) || primaryColor;
                  },
                  opacity: ({ datum }: VictoryCallbackArgs) => {
                    return datum.id === highlightedId
                      ? 1
                      : 0.5;
                  }
                }
              }}
              x="xValue"
              y="yValue"
            />
          </GraphComponents.NavigaderChart>
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

function pointLabel ({ datum }: VictoryCallbackArg<ScenarioDatum>) {
  return datum.tooltip;
}
