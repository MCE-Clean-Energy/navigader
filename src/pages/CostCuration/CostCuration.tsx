import _ from 'lodash';
import * as React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

import { usePushRouter } from 'navigader/routes';
import { PageHeader, Tabs } from 'navigader/components';
import { RatePlans } from './RatePlans';
import { Procurement } from './Procurement';
import { SystemProfiles } from './SystemProfiles';

/** ============================ Types ===================================== */
type CostRouteType = 'rates' | 'procurement' | 'system_profiles';
type CostTabTitle = 'Rate Plans' | 'Procurement' | 'System Profiles';
const tabTitles: Record<CostRouteType, CostTabTitle> = {
  rates: 'Rate Plans',
  procurement: 'Procurement',
  system_profiles: 'System Profiles',
};

const titlesMap = _.invert(tabTitles);

/** ============================ Components ================================ */
const CostCurationTabs = () => {
  let routeTo = usePushRouter();
  let history = useHistory();
  let match = useRouteMatch<{ type: CostRouteType }>({
    path: '/cost/:type',
    strict: true,
    sensitive: false,
  });

  React.useEffect(() => {
    if (!match) {
      routeTo.cost.rates.base();
    }
  }, [match, routeTo]);

  // If the route didn't match any of the expected values, don't render anything
  if (!match) return null;

  // convert the route string to the proper `DERType`, and from there
  const { type } = match.params;
  const mappedType = tabTitles[type];

  return (
    <Tabs initialTab={mappedType} onChange={handleChange}>
      <Tabs.Tab title={tabTitles.rates}>
        <RatePlans />
      </Tabs.Tab>
      {/*<Tabs.Tab title={tabTitles.procurement}>*/}
      {/*  <Procurement />*/}
      {/*</Tabs.Tab>*/}
      <Tabs.Tab title={tabTitles.system_profiles}>
        <SystemProfiles />
      </Tabs.Tab>
    </Tabs>
  );

  /** ========================== Callbacks ================================= */
  function handleChange(newTab: string) {
    const route = titlesMap[newTab as CostTabTitle];
    history.push(`/cost/${route}`);
  }
};

export const CostCuration: React.FC = () => {
  return (
    <>
      <PageHeader title="Cost Curation" />
      <CostCurationTabs />
    </>
  );
};
