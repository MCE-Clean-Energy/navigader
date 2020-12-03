import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import * as api from 'navigader/api';
import { Link, List, Menu, TableFactory } from 'navigader/components';
import { routes, usePushRouter } from 'navigader/routes';
import { slices } from 'navigader/store';
import { SystemProfile } from 'navigader/types';
import { formatters, hooks } from 'navigader/util';

import { DeleteDialog } from '../common/DeleteDialog';
import { CreateSystemProfile } from './CreateSystemProfile';
import { SystemProfileDetails } from './SystemProfileDetails';

/** ============================ Components ================================ */
const Table = TableFactory<SystemProfile>();
export const SystemProfileList = () => {
  const routeTo = usePushRouter();
  const dispatch = useDispatch();
  const tableRef = hooks.useTableRef<SystemProfile>();

  // State
  const [systemProfileToDelete, setSystemProfileToDelete] = React.useState<SystemProfile>();
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  return (
    <>
      <Table
        aria-label="system profile table"
        dataFn={(params) => api.getSystemProfiles({ ...params, data_types: 'default' })}
        dataSelector={slices.models.selectSystemProfiles}
        onFabClick={() => setCreateDialogOpen(true)}
        raised
        ref={tableRef}
        stickyHeader
        title="System Profiles"
      >
        {(systemProfiles) => (
          <>
            <Table.Head>
              <Table.Row>
                <Table.Cell>Name</Table.Cell>
                <Table.Cell>RA Rate</Table.Cell>
                <Table.Cell>Min kW</Table.Cell>
                <Table.Cell>Max kW</Table.Cell>
                <Table.Cell>Average kW</Table.Cell>
                <Table.Cell>Year</Table.Cell>
                <Table.Cell align="right">Menu</Table.Cell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {systemProfiles.map((systemProfile) => (
                <Table.Row key={systemProfile.id}>
                  <Table.Cell>
                    <Link to={routes.cost.system_profiles.profile(systemProfile.id)}>
                      {systemProfile.name}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    {formatters.dollars(systemProfile.resource_adequacy_rate)}/kW
                  </Table.Cell>
                  <Table.Cell>
                    {formatters.commas(
                      formatters.maxDecimals(systemProfile.data.default?.valueDomain[0], 2)
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {formatters.commas(
                      formatters.maxDecimals(systemProfile.data.default?.valueDomain[1], 2)
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {formatters.commas(
                      formatters.maxDecimals(systemProfile.data.default?.average, 2)
                    )}
                  </Table.Cell>
                  <Table.Cell>{systemProfile.data.default?.years.join(', ')}</Table.Cell>
                  <Table.Cell align="right">
                    <Menu
                      anchorOrigin={{
                        vertical: 'center',
                        horizontal: 'center',
                      }}
                      icon="verticalDots"
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                    >
                      <List.Item onClick={routeTo.cost.system_profiles.profile(systemProfile)}>
                        <List.Item.Icon icon="launch" />
                        <List.Item.Text>View</List.Item.Text>
                      </List.Item>
                      <List.Item onClick={() => setSystemProfileToDelete(systemProfile)}>
                        <List.Item.Icon icon="trash" />
                        <List.Item.Text>Delete</List.Item.Text>
                      </List.Item>
                    </Menu>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </>
        )}
      </Table>

      <CreateSystemProfile
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        tableRef={tableRef}
      />
      <DeleteDialog
        onClose={() => setSystemProfileToDelete(undefined)}
        onClickDelete={deleteSystemProfile}
        title="Delete System Profile"
        message="This will permanently delete the System Profile and cannot be undone."
        open={systemProfileToDelete !== undefined}
      />
    </>
  );

  /** ================================ Callbacks =========================== */
  async function deleteSystemProfile() {
    if (systemProfileToDelete) {
      const response = await api.deleteSystemProfile(systemProfileToDelete.id);
      if (response.ok) {
        dispatch(slices.models.removeModel(systemProfileToDelete));
        dispatch(slices.ui.setMessage({ msg: 'System profile deleted.', type: 'success' }));
      } else if (response.status === 403) {
        dispatch(
          slices.ui.setMessage({
            msg: 'You do not have permission to delete this system profile!',
            type: 'error',
          })
        );
      }
    }
  }
};

export const SystemProfiles = () => (
  <Switch>
    <Route exact path={routes.cost.system_profiles.base} component={SystemProfileList} />
    <Route path={routes.cost.system_profiles.profile(':id')} component={SystemProfileDetails} />
  </Switch>
);
