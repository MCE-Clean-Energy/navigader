import * as React from 'react';
import flatten from 'lodash/flatten';

import * as api from 'navigader/api';
import { in_ } from 'navigader/api/util';
import { PageHeader, Progress, Typography } from 'navigader/components';
import { Components, Scenario } from 'navigader/models/scenario';
import * as routes from 'navigader/routes';
import { makeStylesHook, materialColors } from 'navigader/styles';
import { IdType } from 'navigader/types';
import { hooks, makeCancelableAsync } from 'navigader/util';
import { ScenarioComparisonChart } from './Chart';
import { CustomersTable } from './CustomersTable';


/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(() => ({
  tableContainer: {
    maxHeight: 500
  }
}), 'CompareScenariosPage');

/** ============================ Components ================================ */
export const CompareScenariosPage: React.FC = () => {
  const classes = useStyles();
  const params = hooks.useQuery();
  const idsParam = params.get('ids');
  
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
        filter: { id: in_(ids) },
        page: 1,
        page_size: 100
      });
    }, res => setScenarios(res?.data)),
    [idsParam]
  );

  const colorMap = getScenarioColors();
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
            
            {
              aggregated
                ? (
                  <Components.ScenariosTable
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
                    simulations={flatten(scenarios.map(s => Object.values(s.report!.rows)))}
                    updateHover={setHoveredId}
                  />
                )
            }
          </>
        )
      }
    </>
  );
  
  /** ============================ Callbacks =============================== */
  /**
   * Updates the aggregation state and resets the hovered ID
   *
   * @param {boolean} aggregated: whether the graph should now show aggregated results
   */
  function updateAggregation (aggregated: boolean) {
    setHoveredId(undefined);
    setAggregated(aggregated);
  }
  
  /** ============================ Helpers =================================== */
  function getScenarioColors () {
    return new Map(
      (scenarios || []).map(
        scenario => [scenario.id, getColor(scenario.id)]
      )
    );
  }
  
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

/**
 * Returns the color for a given scenario being rendered in the chart and the table
 *
 * @param {IdType} scenarioId: the ID of the scenario
 */
function getColor (scenarioId: IdType): string {
  if (colorMap.has(scenarioId)) return colorMap.get(scenarioId)!;
  
  // Haven't dealt with this ID yet, give it a new color
  const colorKey = graphColors[colorMap.size % graphColors.length];
  const color = materialColors[colorKey][700];
  
  colorMap.set(scenarioId, color);
  return color;
}

const colorMap = new Map<IdType, string>();
const graphColors = Object.keys(materialColors).sort() as Array<keyof typeof materialColors>;
