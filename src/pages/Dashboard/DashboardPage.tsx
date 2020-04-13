import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Route, Switch, useHistory } from 'react-router-dom';
import map from 'lodash/map';

import * as api from '@nav/shared/api';
import {
  Button, DERIcon, Flex, Link, List, Menu, PageHeader, PaginationState, Table, Typography
} from '@nav/shared/components';
import { Scenario } from '@nav/shared/models/scenario';
import * as routes from '@nav/shared/routes';
import { selectModels, updateModels } from '@nav/shared/store/slices/models';
import { formatters, makeCancelableAsync } from '@nav/shared/util';
import CreateScenario from './CreateScenario'
import { makeStylesHook } from '@nav/shared/styles';
import RenameDialog from './RenameDialog';


/** ============================ Types ===================================== */
type EmptyTableRowProps = {
  numMeterGroups?: number;
};

type PageHeaderActionsProps = {
  numMeterGroups?: number;
  selections: Scenario[];
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  compareButton: {
    marginRight: theme.spacing(2)
  }
}), 'PageHeaderActions');

/** ============================ Components ================================ */
/**
 * Links to the "Upload" page if no meter groups have been created yet. Otherwise links to the
 * "Create Scenario" workflow
 */
const EmptyTableRow: React.FC<EmptyTableRowProps> = ({ numMeterGroups }) => {
  let rowContent: React.ReactFragment;
  if (numMeterGroups === 0) {
    rowContent =
      <>
        <span>No "Item 17" customer data has been uploaded.</span>
        &nbsp;
        <Link to={routes.upload}>Visit the upload page?</Link>
      </>
  } else {
    rowContent =
      <>
        <span>No scenarios have been created.</span>
        &nbsp;
        <Link to={routes.dashboard.createScenario.selectDers}>Create one.</Link>
      </>
  }
  
  return <Typography>{rowContent}</Typography>;
};

const PageHeaderActions: React.FC<PageHeaderActionsProps> = (props) => {
  const { numMeterGroups, selections } = props;
  const history = useHistory();
  const classes = useStyles();
  
  if (typeof numMeterGroups === 'undefined') return null;
  if (numMeterGroups === 0) {
    return <Button color="secondary" onClick={goToUpload}>Upload Data</Button>;
  }
  
  return (
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
  );
  
  /** ============================ Callbacks =============================== */
  function compareScenarios () {
    history.push(routes.scenario.compare(map(selections, 'id')));
  }
  
  function createScenario () {
    history.push(routes.dashboard.createScenario.selectDers);
  }
  
  function goToUpload () {
    history.push(routes.upload);
  }
};

const ScenariosTable: React.FC = () => {
  const [selections, setSelections] = React.useState<Scenario[]>([]);
  const [renameScenario, setRenameScenario] = React.useState<Scenario>();
  const [numMeterGroups, setNumMeterGroups] = React.useState<number>();
  const history = useHistory();
  const dispatch = useDispatch();
  
  const getScenarios = React.useCallback(
    async (state: PaginationState) => {
      const response = await api.getScenarios({
        include: ['ders', 'meter_groups', 'report_summary'],
        page: state.currentPage + 1,
        page_size: state.rowsPerPage
      });
      
      // Add the models to the store and yield the pagination results
      dispatch(updateModels(response.data));
      return response
    },
    [dispatch]
  );
  
  // Check if there are any meter groups-- if not, we link to the upload page
  React.useEffect(
    makeCancelableAsync(
      async () => api.getMeterGroups(),
      res => setNumMeterGroups(res.count)
    )
  );
  
  return (
    <>
      <PageHeader
        actions={<PageHeaderActions numMeterGroups={numMeterGroups} selections={selections} />}
        title="Dashboard"
      />
      
      <Table
        aria-label="scenarios table"
        dataFn={getScenarios}
        dataSelector={selectModels('scenarios')}
        onSelect={(scenarios: Scenario[]) => setSelections(scenarios)}
        raised
        stickyHeader
        title="Scenarios"
      >
        {(scenarios, EmptyRow) =>
          <>
            <Table.Head>
              <Table.Row>
                <Table.Cell>Name</Table.Cell>
                <Table.Cell>Created</Table.Cell>
                <Table.Cell>Customer Segment (#)</Table.Cell>
                <Table.Cell>DER</Table.Cell>
                <Table.Cell>Program Strategy</Table.Cell>
                <Table.Cell>CCA Bill ($/year)</Table.Cell>
                <Table.Cell>CNS 2022 Delta (tCO<sub>2</sub>/year)</Table.Cell>
                <Table.Cell>RA (MW/year)</Table.Cell>
                <Table.Cell>Status</Table.Cell>
                <Table.Cell />
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {/** Only renders if there's no data */}
              <EmptyRow colSpan={10}>
                <EmptyTableRow numMeterGroups={numMeterGroups} />
              </EmptyRow>
              
              {scenarios.map(scenario =>
                <Table.Row key={scenario.id}>
                  <Table.Cell useTh>{scenario.name}</Table.Cell>
                  <Table.Cell>{formatters.standardDate(scenario.created_at)}</Table.Cell>
                  <Table.Cell>
                    {scenario.meter_group &&
                      <span>{scenario.meter_group.name} ({scenario.meter_group.numMeters})</span>
                    }
                  </Table.Cell>
                  <Table.Cell>
                    {scenario.der &&
                      <Flex.Container alignItems="center">
                        <Flex.Item>
                          <DERIcon type={scenario.der.der_configuration.der_type} />
                        </Flex.Item>
                        <Flex.Item>
                          {scenario.der.der_configuration.name}
                        </Flex.Item>
                      </Flex.Container>
                    }
                  </Table.Cell>
                  <Table.Cell>
                    {scenario.der && scenario.der.der_strategy.name}
                  </Table.Cell>
                  <Table.Cell>
                    {formatters.maxDecimals(scenario.report_summary?.BillDelta, 2)}
                  </Table.Cell>
                  <Table.Cell>
                    {formatters.maxDecimals(scenario.report_summary?.CleanNetShort2022Delta, 2)}
                  </Table.Cell>
                  <Table.Cell>
                    N/A
                  </Table.Cell>
                  <Table.Cell>{getScenarioStatus(scenario)}</Table.Cell>
                  <Table.Cell>
                    <Menu icon="verticalDots">
                      <List.Item onClick={() => viewScenario(scenario.id)}>
                        <List.Item.Icon icon="plus" />
                        <List.Item.Text>View</List.Item.Text>
                      </List.Item>
                      <List.Item onClick={() => openRenameScenarioDialog(scenario)}>
                        <List.Item.Icon icon="pencil" />
                        <List.Item.Text>Rename</List.Item.Text>
                      </List.Item>

                      {/* TODO: introduce scenario archiving */}
                      {/*<Divider />*/}
                      {/*<List.Item onClick={() => archiveScenario(scenario.id)}>*/}
                      {/*  <List.Item.Icon icon="trash" />*/}
                      {/*  <List.Item.Text>Archive</List.Item.Text>*/}
                      {/*</List.Item>*/}
                    </Menu>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </>
        }
      </Table>
      
      {renameScenario &&
        <RenameDialog
          onClose={() => setRenameScenario(undefined)}
          scenario={renameScenario}
        />
      }
    </>
  );
  
  /** ============================ Callbacks =============================== */
  function openRenameScenarioDialog (scenario: Scenario) {
    setRenameScenario(scenario);
  }

  function viewScenario (scenarioId: string) {
    history.push(routes.scenario(scenarioId));
  }
  
  // function archiveScenario (scenarioId: string) {
  //   alert('Scenario archiving has not been implemented yet');
  // }
};

export const DashboardPage = () =>
  <Switch>
    <Route path={routes.dashboard.createScenario.base} component={CreateScenario} />
    <Route exact path={routes.dashboard.base} component={ScenariosTable} />
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
