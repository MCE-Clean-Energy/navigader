import * as React from 'react';
import ContainerDimensions, { Dimensions } from 'react-container-dimensions';
import {
  VictoryAxis, VictoryChart, VictoryLabel, VictoryScatter, VictoryTheme, VictoryTooltip
} from 'victory';
import * as d3 from 'd3-scale';
import find from 'lodash/find';
import pick from 'lodash/pick';

import * as api from '@nav/shared/api';
import { in_ } from '@nav/shared/api/util';
import { Card, Flex, Grid, PageHeader, Progress, Select } from '@nav/shared/components';
import { MeterGroup } from '@nav/shared/models/meter';
import { Scenario } from '@nav/shared/models/scenario';
import * as routes from '@nav/shared/routes';
import { makeStylesHook, primaryColor } from '@nav/shared/styles';
import { formatters, hooks, makeCancelableAsync, omitFalsey } from '@nav/shared/util';


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
const ScenarioComparisonChart: React.FC<ScenarioComparisonChartProps> = (props) => {
  const { scenarios } = props;
  
  const classes = useStyles();
  const [sizing, setSizing] = React.useState(SizingOption.CohortSize);
  const chartConfig = buildChartConfiguration(scenarios, sizing);
  
  return (
    <Grid>
      <Grid.Item span={7}>
        <Card className={classes.chartCard} padding={0} raised>
          <ContainerDimensions>
            {({ width }: Dimensions) =>
              <VictoryChart
                theme={VictoryTheme.material}
                domain={chartConfig.domain}
                domainPadding={LARGEST_RADIUS}
                width={width}
              >
                <VictoryAxis axisLabelComponent={<VictoryLabel dy={-20} />} label="Bill Delta ($/year)" />
                <VictoryAxis
                  axisLabelComponent={<VictoryLabel dy={-30} />}
                  crossAxis={false}
                  dependentAxis
                  label="GHG Delta (tCO2/year)"
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
      <Grid.Item span={5}>
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

export const CompareScenariosPage: React.FC = () => {
  const [scenarios, setScenarios] = React.useState<Scenario[]>();
  const params = hooks.useQuery();
  const idsParam = params.get('ids');
  
  // Loads the scenario
  React.useEffect(
    makeCancelableAsync(async () => {
      if (!idsParam) return null;
      const ids = idsParam.split(',');
      return api.getScenarios({
        include: ['report_summary', 'meter_groups'],
        filter: {
          id: in_(ids)
        }
      });
    }, res => setScenarios(res?.data)),
    [idsParam]
  );

  return (
    <>
      <PageHeader
        breadcrumbs={[
          ['Dashboard', routes.dashboard.base],
          'Compare Scenarios'
        ]}
        title="Compare Scenarios"
      />
      {scenarios
        ? <ScenarioComparisonChart scenarios={scenarios} />
        : <Progress circular />
      }
    </>
  );
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
  const sizeValues = scenarios.map(s => computeSize(s, sizingMethod));
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
  
  return {
    data,
    domain: {
      x: [xMin, xMax],
      y: [yMin, yMax]
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

// Constants used in size normalization
const SMALLEST_RADIUS = 3;
const LARGEST_RADIUS = 30;
