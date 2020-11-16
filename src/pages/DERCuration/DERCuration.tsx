import _ from 'lodash';
import * as React from 'react';
import { useRouteMatch } from 'react-router-dom';

import { PageHeader, Tabs } from 'navigader/components';
import { usePushRouter, useRedirectRouter } from 'navigader/routes';

import { Batteries } from './Batteries';
import { EVSE } from './EVSE';
import { Solar } from './Solar';

/** ============================ Types ===================================== */
type DERRouteType = 'batteries' | 'evse' | 'solar';
type DERTabTitle = 'Batteries' | 'EVSE' | 'Solar PV';
const tabTitles: Record<DERRouteType, DERTabTitle> = {
  batteries: 'Batteries',
  evse: 'EVSE',
  solar: 'Solar PV',
};

const titlesMap = _.invert(tabTitles);

/** ============================ Components ================================ */
const DERCurationTabs = () => {
  const redirectTo = useRedirectRouter();
  const routeTo = usePushRouter();
  let match = useRouteMatch<{ type: DERRouteType }>({
    path: '/ders/:type',
    strict: true,
    sensitive: false,
  });

  // Redirect to the batteries tab if the route doesn't match
  React.useEffect(() => {
    if (!match) {
      redirectTo.ders.batteries();
    }
  }, [match, redirectTo]);

  // If the route didn't match any of the expected values, don't render anything
  if (!match) return null;

  // convert the route string to the proper `DERType`, and from there
  const { type } = match.params;
  const mappedType = tabTitles[type];

  return (
    <Tabs initialTab={mappedType} onChange={handleChange}>
      <Tabs.Tab title={tabTitles.batteries}>
        <Batteries />
      </Tabs.Tab>

      <Tabs.Tab title={tabTitles.evse}>
        <EVSE />
      </Tabs.Tab>

      <Tabs.Tab title={tabTitles.solar}>
        <Solar />
      </Tabs.Tab>
    </Tabs>
  );

  /** ========================== Callbacks ================================= */
  function handleChange(newTab: string) {
    const route = titlesMap[newTab as DERTabTitle];
    routeTo.ders[route]();
  }
};

export const DERCuration: React.FC = () => {
  return (
    <>
      <PageHeader title="DER Curation" />
      <DERCurationTabs />
    </>
  );
};
