import * as React from 'react';

import * as api from 'navigader/api';
import { in_ } from 'navigader/api/util';
import { PageHeader, Progress } from 'navigader/components';
import { Components, Scenario } from 'navigader/models/scenario';
import * as routes from 'navigader/routes';
import { colors } from 'navigader/styles';
import { IdType } from 'navigader/types';
import { hooks, makeCancelableAsync } from 'navigader/util';
import { ScenarioComparisonChart } from './Chart';


/** ============================ Components ================================ */
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
        include: ['ders', 'meter_groups', 'report', 'report_summary'],
        filter: { id: in_(ids) },
        page: 1,
        page_size: 100
      });
    }, res => setScenarios(res?.data)),
    [idsParam]
  );

  const colorMap = getScenarioColors(scenarios);
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
            <ScenarioComparisonChart colorMap={colorMap} scenarios={scenarios} />
            <Components.ScenariosTable scenarios={scenarios} />
            {/**
              * TODO: need to find way to type scenarios as possessing report
              * TODO: uncomment this when disaggregation feature is available
              * <SimulationsTable
              *   simulations={flatten(scenarios.map(s => Object.values(s.report!.rows)))}
              * />
             */}
          </>
        )
      }
    </>
  );
};

/** ============================ Helpers =================================== */
function getScenarioColors (scenarios?: Scenario[]) {
  return new Map(
    (scenarios || []).map(
      scenario => [scenario.id, getColor(scenario.id)]
    )
  );
}

/**
 * Returns the color for a given scenario being rendered in the chart and the table
 *
 * @param {IdType} scenarioId: the ID of the scenario
 */
function getColor (scenarioId: IdType): string {
  if (colorMap.has(scenarioId)) return colorMap.get(scenarioId)!;
  
  // Haven't dealt with this ID yet, give it a new color
  const colorKey = graphColors[colorMap.size % graphColors.length];
  const color = colors[colorKey][700];
  
  colorMap.set(scenarioId, color);
  return color;
}

type IrregularColorKeys = 'common' | 'primary' | 'secondary';
type GraphColors = Omit<typeof colors, IrregularColorKeys>;
const colorMap = new Map<IdType, string>();
const graphColors: Array<keyof GraphColors> = [
  'amber',
  'blue',
  'blueGrey',
  'brown',
  'cyan',
  'deepOrange',
  'deepPurple',
  'green',
  'grey',
  'indigo',
  'lightBlue',
  'lightGreen',
  'lime',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'yellow'
];
