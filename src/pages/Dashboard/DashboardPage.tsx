import * as React from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import map from 'lodash/map';

import * as api from '@nav/shared/api';
import { Button, Link, List, Menu, PageHeader, Typography } from '@nav/shared/components';
import { Components, Scenario } from '@nav/shared/models/scenario';
import * as routes from '@nav/shared/routes';
import { makeCancelableAsync } from '@nav/shared/util';
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
      <Button color="secondary" onClick={createScenario}>New Scenario</Button>
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
  
  // Check if there are any meter groups-- if not, we link to the upload page
  React.useEffect(
    makeCancelableAsync(
      async () => api.getMeterGroups({ page: 1, page_size: 1 }),
      res => setNumMeterGroups(res.count)
    )
  );
  
  return (
    <>
      <PageHeader
        actions={<PageHeaderActions numMeterGroups={numMeterGroups} selections={selections} />}
        title="Dashboard"
      />
      
      <Components.ScenariosTable
        actionsMenu={
          (scenario) =>
            <Menu
              anchorOrigin={{ vertical: 'center', horizontal: 'center'}}
              icon="verticalDots"
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <List.Item
                disabled={!scenario.progress.is_complete}
                onClick={() => viewScenario(scenario.id)}
              >
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
        }
        NoScenariosRow={<EmptyTableRow numMeterGroups={numMeterGroups} />}
        onSelect={setSelections}
      />
      
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
