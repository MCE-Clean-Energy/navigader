import * as React from 'react';

import * as api from 'navigader/api';
import {
  CustomersTable, PageHeader, Progress, ScenariosTable, Typography
} from 'navigader/components';
import * as routes from 'navigader/routes';
import { makeStylesHook } from 'navigader/styles';
import { Scenario } from 'navigader/types';
import { filterClause, makeCancelableAsync } from 'navigader/util';
import { useColorMap, useQueryParams } from 'navigader/util/hooks';
import _ from 'navigader/util/lodash';
import { ScenarioComparisonChart } from './Chart';


/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  tableContainer: {
    maxHeight: 500
  },
  tableWrapper: {
    marginTop: theme.spacing(2)
  }
}), 'CompareScenariosPage');

/** ============================ Components ================================ */
export const CompareScenariosPage: React.FC = () => {
  const classes = useStyles();
  const [idsParam] = useQueryParams(['ids']);

  // State
  const [aggregated, setAggregated] = React.useState(true);
  const [averaged, setAveraged] = React.useState(false);
  const [hoveredId, setHoveredId] = React.useState<string>();
  const [scenarios, setScenarios] = React.useState<Scenario[]>();

  // Loads the scenario
  React.useEffect(
    makeCancelableAsync(async () => {
      if (!idsParam) return null;
      const ids = idsParam.split(',');
      return api.getScenarios({
        include: ['ders', 'meter_groups', 'report', 'report_summary'],
        filter: { id: filterClause.in(ids) },
        page: 1,
        page_size: 100
      });
    }, res => setScenarios(res?.data)),
    [idsParam]
  );

  const colorMap = useColorMap([scenarios]);
  return (
    <>
      <PageHeader
        breadcrumbs={[
          ['Dashboard', routes.dashboard.base],
          'Scenario Comparison'
        ]}
        title="Scenario Comparison"
      />
      {scenarios === undefined
        ? <Progress circular />
        : (
          <>
            <Typography variant="h6">{getChartTitle()}</Typography>
            <ScenarioComparisonChart
              aggregated={aggregated}
              averaged={averaged}
              colorMap={colorMap}
              highlightedId={hoveredId}
              scenarios={scenarios}
              updateAggregated={updateAggregation}
            />

            <div className={classes.tableWrapper}>
              {
                aggregated
                  ? (
                    <ScenariosTable
                      averaged={averaged}
                      className={classes.tableContainer}
                      colorMap={colorMap}
                      scenarios={scenarios}
                      updateAveraged={setAveraged}
                    />
                  ) : (
                    // TODO: need to find way to type scenarios as possessing report
                    <CustomersTable
                      className={classes.tableContainer}
                      colorMap={colorMap}
                      scenarios={scenarios}
                      simulations={_.flatten(scenarios.map(s => Object.values(s.report!)))}
                      updateHover={setHoveredId}
                    />
                  )
              }
            </div>
          </>
        )
      }
    </>
  );

  /** ========================== Callbacks ================================= */
  /**
   * Updates the aggregation state and resets the hovered ID
   *
   * @param {boolean} aggregated: whether the graph should now show aggregated results
   */
  function updateAggregation (aggregated: boolean) {
    setHoveredId(undefined);
    setAggregated(aggregated);
  }

  /** ========================== Helpers ===================================== */
  function getChartTitle () {
    if (aggregated) {
      return averaged
        ? 'Scenario Bill Impact vs. GHG Impact per Customer'
        : 'Scenario Bill Impact vs. GHG Impact';
    } else {
      return 'Customer Bill Impact vs. GHG Impact';
    }
  }
};
