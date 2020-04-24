import * as React from 'react';

import * as api from '@nav/shared/api';
import { in_ } from '@nav/shared/api/util';
import { PageHeader, Progress } from '@nav/shared/components';
import { Components, Scenario } from '@nav/shared/models/scenario';
import * as routes from '@nav/shared/routes';
import { hooks, makeCancelableAsync } from '@nav/shared/util';
import { ScenarioComparisonChart } from './ScenarioComparisonChart';


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
            <ScenarioComparisonChart scenarios={scenarios} />
            
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
