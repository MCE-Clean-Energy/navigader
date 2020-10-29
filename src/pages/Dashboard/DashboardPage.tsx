import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import * as api from 'navigader/api';
import {
  Button,
  Divider,
  Link,
  List,
  Menu,
  PageHeader,
  Tooltip,
  ScenariosTable,
  Typography,
} from 'navigader/components';
import { routes, useRouter } from 'navigader/routes';
import { slices } from 'navigader/store';
import { makeStylesHook } from 'navigader/styles';
import { Scenario } from 'navigader/types';
import { hooks } from 'navigader/util';
import CreateScenario from './CreateScenario';
import { DeleteDialog } from './DeleteDialog';
import RenameDialog from './RenameDialog';

/** ============================ Types ===================================== */
type PageHeaderActionsProps = {
  selections: Scenario[];
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(
  (theme) => ({
    compareButton: {
      display: 'inline',
      marginRight: theme.spacing(2),
    },
  }),
  'PageHeaderActions'
);

/** ============================ Components ================================ */
/**
 * Links to the "Upload" page if no meter groups have been created yet. Otherwise links to the
 * "Create Scenario" workflow
 */
const EmptyTableRow: React.FC = () => {
  let rowContent: React.ReactFragment;
  const hasMeterGroups = useSelector(slices.models.selectHasMeterGroups);
  if (hasMeterGroups === false) {
    rowContent = (
      <>
        <span>No customer data has been uploaded.</span>
        &nbsp;
        <Link to={routes.upload}>Visit the upload page?</Link>
      </>
    );
  } else {
    rowContent = (
      <>
        <span>No scenarios have been created.</span>
        &nbsp;
        <Link to={routes.dashboard.createScenario.base}>Create one.</Link>
      </>
    );
  }

  return <Typography>{rowContent}</Typography>;
};

const PageHeaderActions: React.FC<PageHeaderActionsProps> = ({ selections }) => {
  const routeTo = useRouter();
  const classes = useStyles();
  const hasMeterGroups = useSelector(slices.models.selectHasMeterGroups);

  if (hasMeterGroups === null) return null;
  if (!hasMeterGroups) {
    return (
      <Button color="secondary" onClick={routeTo.upload}>
        Upload Data
      </Button>
    );
  }

  return (
    <>
      <Tooltip delay title="Select scenarios from the table to compare">
        <div className={classes.compareButton}>
          <Button
            color="secondary"
            disabled={selections.length < 2}
            onClick={routeTo.scenario.compare(selections)}
          >
            Compare Scenarios
          </Button>
        </div>
      </Tooltip>
      <Tooltip
        delay
        title="A scenario is a simulation of a DER customer program with parameters set by the user"
      >
        <Button color="secondary" onClick={routeTo.dashboard.createScenario.base}>
          New Scenario
        </Button>
      </Tooltip>
    </>
  );
};

const DashboardTable: React.FC = () => {
  const [deleteScenario, setDeleteScenario] = React.useState<Scenario>();
  const [renameScenario, setRenameScenario] = React.useState<Scenario>();
  const [selections, setSelections] = React.useState<Scenario[]>([]);
  const routeTo = useRouter();
  const dispatch = useDispatch();
  const hasMeterGroups = useSelector(slices.models.selectHasMeterGroups);

  // Check if there are any meter groups-- if not, we link to the upload page
  hooks.useAsync(
    async () => {
      // Don't fetch the meter groups if we already know how many we have
      if (hasMeterGroups !== null) return;
      return api.getMeterGroups({ page: 0, pageSize: 1 });
    },
    (res) => dispatch(slices.models.updateHasMeterGroups(res.count >= 1))
  );

  return (
    <>
      <PageHeader actions={<PageHeaderActions selections={selections} />} title="Dashboard" />

      <ScenariosTable
        actionsMenu={(scenario) => (
          <Menu
            anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
            icon="verticalDots"
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <List.Item
              disabled={!scenario.progress.is_complete}
              onClick={routeTo.scenario.details(scenario)}
            >
              <List.Item.Icon icon="launch" />
              <List.Item.Text>View</List.Item.Text>
            </List.Item>
            <List.Item onClick={() => openRenameScenarioDialog(scenario)}>
              <List.Item.Icon icon="pencil" />
              <List.Item.Text>Rename</List.Item.Text>
            </List.Item>

            <Divider />

            <List.Item onClick={() => openDeleteScenarioDialog(scenario)}>
              <List.Item.Icon icon="trash" />
              <List.Item.Text>Delete</List.Item.Text>
            </List.Item>
          </Menu>
        )}
        NoScenariosRow={<EmptyTableRow />}
        onSelect={setSelections}
      />

      {renameScenario && (
        <RenameDialog onClose={() => setRenameScenario(undefined)} scenario={renameScenario} />
      )}

      {deleteScenario && (
        <DeleteDialog onClose={() => setDeleteScenario(undefined)} scenario={deleteScenario} />
      )}
    </>
  );

  /** ========================== Callbacks ================================= */
  function openRenameScenarioDialog(scenario: Scenario) {
    setRenameScenario(scenario);
  }

  function openDeleteScenarioDialog(scenario: Scenario) {
    setDeleteScenario(scenario);
  }
};

export const DashboardPage = () => (
  <Switch>
    <Route path={routes.dashboard.createScenario.base} component={CreateScenario} />
    <Route exact path={routes.dashboard.base} component={DashboardTable} />
  </Switch>
);
