import * as React from 'react';
import ContainerDimensions, { Dimensions } from 'react-container-dimensions';
import {
  VictoryAxis, VictoryChart, VictoryLabel, VictoryScatter, VictoryTheme, VictoryTooltip
} from 'victory';

import { Card, Grid } from 'navigader/components';
import { Scenario } from 'navigader/models/scenario';
import { makeStylesHook, primaryColor } from 'navigader/styles';
import { CHART_MARGIN, LARGEST_RADIUS } from './constants';
import { buildChartConfiguration } from './configuration';
import { Controls } from './Controls';
import { AggregationState, ScenarioDatum, SizingOption } from './types';
import { IdType } from 'navigader/types';


/** ============================ Types ===================================== */
type ScenarioComparisonChartProps = {
  colorMap: Map<IdType, string>;
  scenarios: Scenario[];
};

type VictoryCallbackArgs = {
  datum: ScenarioDatum
}

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  chartCard: {
    marginBottom: theme.spacing(1)
  },
  sizingSelect: {
    marginLeft: theme.spacing(2)
  },
  tooltip: {
    ...theme.typography.body1
  }
}), 'ScenarioComparisonChart');

/** ============================ Components ================================ */
export const ScenarioComparisonChart: React.FC<ScenarioComparisonChartProps> = (props) => {
  const { colorMap, scenarios } = props;
  const classes = useStyles();
  
  // State
  const [sizing, setSizing] = React.useState(SizingOption.CohortSize);
  const [aggregation, setAggregation] = React.useState<AggregationState>('aggregated');
  
  // The height is defined in the material theme, but the theme's type definition says the `chart`
  // member is optional. Hence the `|| 350`.
  const height = VictoryTheme.material.chart?.height || 350;
  const chartConfig = buildChartConfiguration(scenarios, sizing, aggregation);
  
  return (
    <Grid>
      <Grid.Item span={8}>
        <Card className={classes.chartCard} padding={0} raised>
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
                  label="Revenue Impacts over Baseline ($/year)"
                />
                
                <VictoryAxis
                  axisLabelComponent={<VictoryLabel dy={-width/2 + CHART_MARGIN} />}
                  dependentAxis
                  label="GHG Impacts over Baseline (tCO2/year)"
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
                        return colorMap.get(datum.scenario) || primaryColor;
                      },
                      opacity: 0.5
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
        <Controls
          aggregation={aggregation}
          sizing={sizing}
          updateAggregation={setAggregation}
          updateSizing={setSizing}
        />
      </Grid.Item>
    </Grid>
  );
};
