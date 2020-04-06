import * as React from 'react';

import * as api from '@nav/shared/api';
import { in_ } from '@nav/shared/api/util';
import { PageHeader } from '@nav/shared/components';
import { Scenario } from '@nav/shared/models/scenario';
import * as routes from '@nav/shared/routes';
import { hooks, makeCancelableAsync } from '@nav/shared/util';


/** ============================ Types ===================================== */

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
    </>
  );
};
