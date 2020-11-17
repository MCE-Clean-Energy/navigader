import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import * as api from 'navigader/api';
import { routes, usePushRouter } from 'navigader/routes';
import { Grid, Link, List, Menu, PrefetchedTable, Table } from 'navigader/components';
import { useSystemProfiles } from 'navigader/util/hooks';
import { SystemProfile } from 'navigader/types';
import { SystemProfileDetails } from './SystemProfileDetails';
import { CreateSystemProfile } from './CreateSystemProfile';
import { formatters } from 'navigader/util';
import { useDispatch } from 'react-redux';
import { slices } from 'navigader/store';
import { DeleteDialog } from '../common/DeleteDialog';

export const SystemProfileList = () => {
  const systemProfiles = useSystemProfiles({ data_types: ['default'] });
  const routeTo = usePushRouter();
  const dispatch = useDispatch();
  const [deleteSystemProfile, setDeleteSystemProfile] = React.useState<SystemProfile | undefined>();
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  const clickDelete = React.useCallback(
    async function () {
      if (deleteSystemProfile) {
        const response = await api.deleteSystemProfile(deleteSystemProfile.id);
        if (response.ok) {
          dispatch(slices.models.removeModel(deleteSystemProfile));
          setDeleteSystemProfile(undefined);
        }
      }
    },
    [deleteSystemProfile, dispatch]
  );

  return (
    <>
      <Grid>
        <Grid.Item span={12}>
          {systemProfiles && !systemProfiles.loading && (
            <PrefetchedTable
              aria-label="system profile table"
              data={systemProfiles}
              onFabClick={() => setCreateDialogOpen(true)}
              raised
              stickyHeader
              title="System Profiles"
            >
              {(systemProfiles: SystemProfile[]) => (
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
                          <Link
                            to={routes.cost.system_profiles.profile(systemProfile.id.toString())}
                          >
                            {systemProfile.name}
                          </Link>
                        </Table.Cell>
                        <Table.Cell>${systemProfile.resource_adequacy_rate}/kW</Table.Cell>
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
                          {systemProfile.data.default &&
                            formatters.commas(
                              formatters.maxDecimals(systemProfile.data.default.average, 2)
                            )}
                        </Table.Cell>
                        <Table.Cell>{systemProfile.data.default?.years[0]}</Table.Cell>
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
                            <List.Item
                              onClick={() => routeTo.cost.system_profiles.profile(systemProfile)}
                            >
                              <List.Item.Icon icon="launch" />
                              <List.Item.Text>View</List.Item.Text>
                            </List.Item>
                            <List.Item
                              onClick={() => {
                                setDeleteSystemProfile(systemProfile);
                              }}
                            >
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
            </PrefetchedTable>
          )}
        </Grid.Item>
      </Grid>
      <CreateSystemProfile open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
      <DeleteDialog
        onClose={() => {
          setDeleteSystemProfile(undefined);
        }}
        onClickDelete={clickDelete}
        title="Delete System Profile"
        message={'This will permanently delete the System Profile and cannot be undone.'}
        open={deleteSystemProfile !== undefined}
      />
    </>
  );
};

export const SystemProfiles = () => (
  <Switch>
    <Route exact path={routes.cost.system_profiles.base} component={SystemProfileList} />
    <Route path={routes.cost.system_profiles.profile(':id')} component={SystemProfileDetails} />
  </Switch>
);
