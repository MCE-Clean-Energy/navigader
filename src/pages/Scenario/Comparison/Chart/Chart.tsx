import * as React from 'react';
import ContainerDimensions, { Dimensions } from 'react-container-dimensions';
import {
  VictoryAxis, VictoryChart, VictoryLabel, VictoryScatter, VictoryTheme, VictoryTooltip
} from 'victory';

import { Card, Flex, Grid, List, Typography } from 'navigader/components';
import { ColorMap, makeStylesHook, primaryColor } from 'navigader/styles';
import { Scenario } from 'navigader/types';
import { CHART_MARGIN, LARGEST_RADIUS } from './constants';
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
        <Typography
          className={classes.legendHeader}
          color="textSecondary"
          variant="body2"
        >
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
          <ContainerDimensions>
            {({ width }: Dimensions) =>
              <VictoryChart
                domain={chartConfig.domain}
                domainPadding={LARGEST_RADIUS}
                padding={CHART_MARGIN}
                theme={VictoryTheme.material}
                width={width}
              >
                <VictoryAxis
                  axisLabelComponent={<VictoryLabel dy={height/2 - CHART_MARGIN} />}
                  label={`${averaged ? 'Avg. ' : ''}Revenue Impacts ($/year)`}
                />
                
                <VictoryAxis
                  axisLabelComponent={<VictoryLabel dy={-width/2 + CHART_MARGIN} />}
                  dependentAxis
                  label={`${averaged ? 'Avg. ' : ''}GHG Impacts (tCO2/year)`}
                />
                
                <VictoryScatter
                  data={chartConfig.data}
                  labels={d => d.datum.name}
                  labelComponent={
                    <VictoryTooltip
                      constrainToVisibleArea
                      labelComponent={<VictoryLabel />}
                      pointerLength={0}
                      text={d => d.datum.label}
                    />
                  }
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
              </VictoryChart>
            }
          </ContainerDimensions>
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
