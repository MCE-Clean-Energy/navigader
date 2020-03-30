import * as React from 'react';
import { Link, Route, Switch, useHistory } from 'react-router-dom';

import * as api from '@nav/shared/api';
import {
  Button, Icon, List, Menu, PageHeader, PaginationState, Statistic, Table, Typography
} from '@nav/shared/components';
import { Scenario } from '@nav/shared/models/scenario';
import * as routes from '@nav/shared/routes';
import { dateFormatter } from '@nav/shared/util';
import CreateScenario from './CreateScenario'
import { makeStylesHook } from '@nav/shared/styles';


/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  compareButton: {
    marginRight: theme.spacing(2)
  }
}));

/** ============================ Components ================================ */
const DashboardPage: React.FC = () => {
  const [selections, setSelections] = React.useState<Scenario[]>([]);
  const history = useHistory();
  const classes = useStyles();
  
  const getScenarios = React.useCallback(
    async (state: PaginationState) => {
      return await api.getScenarios<'der' | 'meter_group'>({
        include: ['ders', 'meter_groups'],
        page: state.currentPage + 1,
        pageSize: state.rowsPerPage
      });
    },
    []
  );
  
  return (
    <>
      <PageHeader
        actions={
          <>
            <Button
              className={classes.compareButton}
              color="secondary"
              disabled={selections.length < 2}
              onClick={compareScenarios}
            >
              Compare Scenarios
            </Button>
            <Button color="secondary" onClick={createScenario}>Create Scenario</Button>
          </>
        }
        title="Dashboard"
      />
      
      <Table
        aria-label="scenarios table"
        dataFn={getScenarios}
        ifEmpty={(
          <Typography>
            No scenarios have been created. <Link to={routes.dashboard.createScenario.selectDers}>Create one.</Link>
          </Typography>
        )}
        onSelect={(scenarios: Scenario[]) => setSelections(scenarios)}
        raised
        stickyHeader
        title="Scenarios"
      >
        {(scenarios, emptyRow) =>
          <>
            <Table.Head>
              <Table.Row>
                <Table.Cell>Name</Table.Cell>
                <Table.Cell>Created</Table.Cell>
                <Table.Cell>Customer Segment (#)</Table.Cell>
                <Table.Cell>DER</Table.Cell>
                <Table.Cell>Program Strategy</Table.Cell>
                <Table.Cell>CCA Bill ($/year)</Table.Cell>
                <Table.Cell>GHG (tCO<sub>2</sub>/year)</Table.Cell>
                <Table.Cell>RA (MW/year)</Table.Cell>
                <Table.Cell>Status</Table.Cell>
                <Table.Cell />
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {emptyRow}
              {scenarios.map(scenario =>
                <Table.Row key={scenario.id}>
                  <Table.Cell useTh>{scenario.name}</Table.Cell>
                  <Table.Cell>{dateFormatter(scenario.created)}</Table.Cell>
                  <Table.Cell>
                    {scenario.meter_group.name} ({scenario.meter_group.numMeters})
                  </Table.Cell>
                  <Table.Cell>
                    {getDerIcon(scenario)}
                    <Statistic
                      title="Configuration"
                      value={scenario.der.der_configuration.name}
                      variant="subtitle2"
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Statistic
                      title="Strategy"
                      value={scenario.der.der_strategy.name}
                      variant="subtitle2"
                    />
                  </Table.Cell>
                  <Table.Cell />
                  <Table.Cell />
                  <Table.Cell />
                  <Table.Cell>{getScenarioStatus(scenario)}</Table.Cell>
                  <Table.Cell>
                    <Menu icon="verticalDots">
                      <List dense>
                        <List.Item onClick={() => {}}>
                          <List.Item.Icon icon="plus" />
                          <List.Item.Text>View</List.Item.Text>
                        </List.Item>
                        
                        <List.Item onClick={() => {}}>
                          <List.Item.Icon icon="trash" />
                          <List.Item.Text>Archive</List.Item.Text>
                        </List.Item>
                      </List>
                    </Menu>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </>
        }
      </Table>
    </>
  );
  
  /** ============================ Callbacks =============================== */
  function createScenario () {
    history.push(routes.dashboard.createScenario.selectDers);
  }
  
  function compareScenarios () {
    alert('Comparison feature has not been implemented yet');
  }
};

const DashboardRouter = () =>
  <Switch>
    <Route path={routes.dashboard.createScenario.base} component={CreateScenario} />
    <Route exact path={routes.dashboard.base} component={DashboardPage} />
  </Switch>;


/** ============================ Helpers =================================== */
/**
 * Returns a string representing the scenario's status
 *
 * @param {Scenario} scenario: the scenario whose status we are interested in
 */
function getScenarioStatus (scenario: Scenario) {
  const { is_complete, percent_complete } = scenario.progress;
  return is_complete
    ? 'Done'
    : `${Math.floor(percent_complete)}%`;
}

/**
 * Returns an icon representing a scenario's DER
 *
 * @param {Scenario} scenario: the scenario to get the DER from
 */
function getDerIcon (scenario: Scenario) {
  const derType = scenario.der?.der_configuration.der_type;
  
  if (derType === 'Battery') {
    return <Icon name="battery" />;
  } else {
    return null;
  }
}

/** ============================ Exports =================================== */
export default DashboardRouter;
