import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { routes } from 'navigader/routes';
import { PageHeader, PrefetchedTable, Table } from 'navigader/components';

export const ProcurementLoadList = () => {
  return (
    <>
      <PageHeader title="Procurement Rates"></PageHeader>
      <PrefetchedTable data={[]}>
        {() => (
          <Table.Head>
            <Table.Row>Procurement Rates</Table.Row>
          </Table.Head>
        )}
      </PrefetchedTable>
    </>
  );
};

export const Procurement = () => (
  <Switch>
    <Route exact path={routes.cost.procurement.base} component={ProcurementLoadList} />
  </Switch>
);
