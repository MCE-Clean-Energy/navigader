import * as React from 'react';
import { Link, Route, Switch, useHistory } from 'react-router-dom';

import * as api from '@nav/shared/api';
import { Button, PageHeader, Table, TableState, Typography } from '@nav/shared/components';
import { MultiScenarioStudy } from '@nav/shared/models/study';
import * as routes from '@nav/shared/routes';
import { PaginationSet } from '@nav/shared/types';
import RunStudy from './RunStudy'


/** ============================ Components ================================ */
const DashboardPage: React.FC = () => {
  const history = useHistory();
  
  const getStudies = React.useCallback(
    async (state: TableState): Promise<PaginationSet<MultiScenarioStudy>> => {
      return await api.getStudies({
        page: state.currentPage + 1,
        pageSize: state.rowsPerPage
      });
    },
    []
  );
  
  return (
    <>
      <PageHeader
        actions={<Button color="secondary" onClick={runStudy}>Run Study</Button>}
        title="Dashboard"
      />
      
      <Table
        aria-label="studies table"
        dataFn={getStudies}
        ifEmpty={(
          <Typography>
            No studies have been created. <Link to={routes.dashboard.runStudy.selectDers}>Run a study.</Link>
          </Typography>
        )}
        raised
        stickyHeader
        title="Studies"
      >
        {(studies, emptyRow) =>
          <>
            <Table.Head>
              <Table.Row>
                <Table.Cell>Name</Table.Cell>
                <Table.Cell>Rate Plan</Table.Cell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {emptyRow}
              {studies.map(study =>
                <Table.Row key={study.id}>
                  <Table.Cell useTh>{study.name}</Table.Cell>
                  <Table.Cell>{study.meterCount}</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </>
        }
      </Table>
    </>
  );
  
  /** ============================ Callbacks =============================== */
  function runStudy () {
    history.push(routes.dashboard.runStudy.selectDers);
  }
};

const DashboardRouter = () =>
  <Switch>
    <Route path={routes.dashboard.runStudy.base} component={RunStudy} />
    <Route exact path={routes.dashboard.base} component={DashboardPage} />
  </Switch>;

/** ============================ Exports =================================== */
export default DashboardRouter;
