import _ from 'lodash';
import * as React from 'react';

import {
  CustomersTable,
  PageHeader,
  Progress,
  ScenarioComparisonChartAxes,
  ScenarioComparisonChartTitle,
  ScenariosTable,
} from 'navigader/components';
import { routes } from 'navigader/routes';
import { makeStylesHook } from 'navigader/styles';
import { filterClause } from 'navigader/util';
import { useColorMap, useQueryParams, useScenarios } from 'navigader/util/hooks';
import { ScenarioComparisonChart } from './Chart';

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(
  (theme) => ({
    tableContainer: {
      maxHeight: 500,
    },
    tableWrapper: {
      marginTop: theme.spacing(2),
    },
  }),
  'CompareScenariosPage'
);

/** ============================ Components ================================ */
export const CompareScenariosPage: React.FC = () => {
  const classes = useStyles();
  const [idsParam] = useQueryParams(['ids']);

  // State
  const [aggregated, setAggregated] = React.useState(true);
  const [averaged, setAveraged] = React.useState(false);
  const [hoveredId, setHoveredId] = React.useState<string>();
  const [chartAxes, setChartAxes] = React.useState<ScenarioComparisonChartAxes>(['Revenue', 'GHG']);

  // Loads the scenario
  const scenarios = useScenarios({
    include: ['ders', 'meter_group.*', 'report', 'report_summary'],
    filter: { id: filterClause.in(idsParam?.split(',')) },
    page: 0,
    pageSize: 100,
  });

  const colorMap = useColorMap([scenarios]);
  return (
    <>
      <PageHeader
        breadcrumbs={[['Dashboard', routes.dashboard.base], 'Scenario Comparison']}
        title="Scenario Comparison"
      />
      {scenarios.loading ? (
        <Progress circular />
      ) : (
        <>
          <ScenarioComparisonChartTitle
            aggregated={aggregated}
            averaged={averaged}
            axes={chartAxes}
            updateAxes={setChartAxes}
          />

          <ScenarioComparisonChart
            aggregated={aggregated}
            averaged={averaged}
            axes={chartAxes}
            colorMap={colorMap}
            highlightedId={hoveredId}
            scenarios={scenarios}
            updateAggregated={updateAggregation}
          />

          <div className={classes.tableWrapper}>
            {aggregated ? (
              <ScenariosTable
                averaged={averaged}
                className={classes.tableContainer}
                colorMap={colorMap}
                scenarios={scenarios}
                updateAveraged={setAveraged}
              />
            ) : (
              <CustomersTable
                className={classes.tableContainer}
                colorMap={colorMap}
                scenarios={scenarios}
                // TODO: need to find way to type scenarios as possessing report
                simulations={_.flatten(scenarios.map((s) => Object.values(s.report!)))}
                updateHover={setHoveredId}
              />
            )}
          </div>
        </>
      )}
    </>
  );

  /** ========================== Callbacks ================================= */
  /**
   * Updates the aggregation state and resets the hovered ID
   *
   * @param {boolean} aggregated: whether the graph should now show aggregated results
   */
  function updateAggregation(aggregated: boolean) {
    setHoveredId(undefined);
    setAggregated(aggregated);
  }
};
