import * as React from 'react';
import ContainerDimensions, { Dimensions } from 'react-container-dimensions';
import {
  VictoryAxis, VictoryChart, VictoryLabel, VictoryScatter, VictoryTheme, VictoryTooltip
} from 'victory';
import * as d3 from 'd3-scale';
import find from 'lodash/find';
import pick from 'lodash/pick';

import { Card, Flex, Grid, Select } from '@nav/common/components';
import { makeStylesHook, primaryColor } from '@nav/common/styles';
import { formatters, omitFalsey } from '@nav/common/util';
import { Scenario } from '@nav/common/models/scenario';
import { MeterGroup } from '@nav/common/models/meter';


/** ============================ Types ===================================== */
type ScenarioComparisonChartProps = {
  scenarios: Scenario[];
};

type ScenarioDatum = Pick<Scenario, 'name' | 'id'> & {
  meterGroupName?: MeterGroup['name'];
  xValue: number;
  yValue: number;
  
  // `size` is a pixel value used by Victory to size the points; `sizeValue` is the value
  // computed from the scenario that was used to derive `size`
  size: number;
  sizeValue: number;
};

type VictoryDatum = {
  datum: ScenarioDatum;
};

type ChartData = {
  data: ScenarioDatum[];
  domain: {
    x: [number, number];
    y: [number, number];
  };
}

enum SizingOption {
  CohortSize = '# Customers',
  GHGImpactPerCustomer = 'GHG impact per customer',
  BillImpactPerCustomer = 'Bill impact per customer'
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

const scatterPointStyle = {
  fill: primaryColor,
  opacity: 0.5
};

/** ============================ Components ================================ */
export const ScenarioComparisonChart: React.FC<ScenarioComparisonChartProps> = (props) => {
  const { scenarios } = props;
  
  const classes = useStyles();
  const [sizing, setSizing] = React.useState(SizingOption.CohortSize);
  const chartConfig = buildChartConfiguration(scenarios, sizing);
  
  // The height is defined in the material theme, but the theme's type definition says the `chart`
  // member is optional. Hence the `|| 350`.
  const height = VictoryTheme.material.chart?.height || 350;
  
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
                  label="Electricity Bill Impacts over Baseline ($/year)"
                />
                
                <VictoryAxis
                  axisLabelComponent={<VictoryLabel dy={-width/2 + CHART_MARGIN} />}
                  dependentAxis
                  label="GHG Impacts over Baseline (tCO2/year)"
                />
                
                <VictoryScatter
                  animate
                  data={chartConfig.data}
                  labels={d => d.datum.name}
                  labelComponent={
                    <VictoryTooltip
                      constrainToVisibleArea
                      labelComponent={<VictoryLabel />}
                      pointerLength={0}
                      text={getTooltipText}
                    />
                  }
                  style={{ data: scatterPointStyle }}
                  x="xValue"
                  y="yValue"
                />
              </VictoryChart>
            }
          </ContainerDimensions>
        </Card>
      </Grid.Item>
      <Grid.Item span={4}>
        <Flex.Container alignItems="center">
          <Flex.Item>
            Size scenarios by:
          </Flex.Item>
          <Flex.Item className={classes.sizingSelect}>
            <Select
              onChange={(newSizing: SizingOption) => setSizing(newSizing)}
              options={[
                SizingOption.CohortSize,
                SizingOption.GHGImpactPerCustomer,
                SizingOption.BillImpactPerCustomer
              ]}
              value={sizing}
            />
          </Flex.Item>
        </Flex.Container>
      </Grid.Item>
    </Grid>
  );
  
  /** ============================ Callbacks =============================== */
  function getTooltipText ({ datum }: VictoryDatum) {
    // Look up the scenario's size. Note that we can't use the `datum` object's `sizeValue`
    // because Victory insists on interpolating it. This makes for odd behavior during the
    // animation, in which the size appears to grow or shrink
    const scenarioDatum = find(chartConfig.data, { id: datum.id });
    const sizeValue = scenarioDatum ? scenarioDatum.sizeValue : datum.sizeValue;
    
    // Determine the size value suffix
    let sizeSuffix;
    switch (sizing) {
      case SizingOption.CohortSize:
        sizeSuffix = formatters.pluralize('customer', sizeValue);
        break;
      case SizingOption.GHGImpactPerCustomer:
        sizeSuffix = formatters.pluralize('ton', sizeValue) + ' CO2/year per customer';
        break;
      case SizingOption.BillImpactPerCustomer:
        sizeSuffix = '$/year per customer';
    }
    
    return [
      datum.name,
      datum.meterGroupName,
      formatters.maxDecimals(sizeValue, 2) + ' ' + sizeSuffix
    ].join('\n');
  }
};

/** ============================ Helpers =================================== */
/**
 * Produces configuration for rendering the comparison chart. This includes the domain of the
 * chart, the domain's padding and the sizing function.
 *
 * @param {Scenario[]} scenarios: the scenarios being compared
 * @param {SizingOption} sizingMethod: enum indicating how the scenario points should be sized
 */
function buildChartConfiguration (scenarios: Scenario[], sizingMethod: SizingOption): ChartData {
  // These are set in the data loop
  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;
  
  // Get the size values up front-- the pixel sizes will be computed relative to one another
  const sizeValues = scenarios.map(s => Math.abs(computeSize(s, sizingMethod)));
  const sizeScale = d3.scaleSqrt()
    .domain([0, Math.max(...sizeValues)])
    .range([SMALLEST_RADIUS, LARGEST_RADIUS]);
  
  const data = omitFalsey(scenarios.map((scenario, i) => {
    // All of the scenarios should have a report summary, but in case they don't...
    const reportSummary = scenario.report_summary;
    if (!reportSummary) return null;
    
    // Check if the xValue and yValue are the new min or max of their respective axes
    const xValue = reportSummary.BillDelta;
    const yValue = reportSummary.CleanNetShort2022Delta;
    if (xValue < xMin) xMin = xValue;
    if (xValue > xMax) xMax = xValue;
    if (yValue < yMin) yMin = yValue;
    if (yValue > yMax) yMax = yValue;
    
    // Compute the scenario's size metric
    const sizeValue = sizeValues[i];
    const size = sizeScale(sizeValue);
    
    return {
      ...pick(scenario, ['id', 'name']),
      meterGroupName: scenario.meter_group?.name,
      size,
      sizeValue,
      xValue,
      yValue
    };
  }));
  
  // To center the origin in the graph, the axes extend equally on both sides
  const xMaxAbsolute = Math.max(Math.abs(xMin), Math.abs(xMax));
  const yMaxAbsolute = Math.max(Math.abs(yMin), Math.abs(yMax));
  
  return {
    data,
    domain: {
      x: [-xMaxAbsolute, xMaxAbsolute],
      y: [-yMaxAbsolute, yMaxAbsolute]
    }
  };
}

/**
 * Computes the size metric for a given scenario. This depends upon the the sizing method
 *
 * @param {Scenario} scenario: the scenario to compute the size of
 * @param {SizingOption} sizingMethod: the method by which the scenario point will be sized
 */
function computeSize (scenario: Scenario, sizingMethod: SizingOption) {
  switch (sizingMethod) {
    case SizingOption.CohortSize:
      return scenario.expected_der_simulation_count;
    case SizingOption.GHGImpactPerCustomer:
      // @ts-ignore: TODO: need to find a way to specify the scenario type has given fields
      return scenario.report_summary.CleanNetShort2022Delta / scenario.expected_der_simulation_count;
    case SizingOption.BillImpactPerCustomer:
      // @ts-ignore: TODO: need to find a way to specify the scenario type has given fields
      return scenario.report_summary.BillDelta / scenario.expected_der_simulation_count;
  }
}

/** ============================ Constants ================================= */
const SMALLEST_RADIUS = 3;
const LARGEST_RADIUS = 30;
const CHART_MARGIN = 30;
