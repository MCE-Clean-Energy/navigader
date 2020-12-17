import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import * as api from 'navigader/api';
import { routes, usePushRouter } from 'navigader/routes';
import { Dialog, Grid, Link, Menu, List, TableFactory, StandardDate } from 'navigader/components';
import { CAISORate } from 'navigader/types';
import { slices } from 'navigader/store';
import { formatters } from 'navigader/util';
import { CAISORateDetails } from './CAISORateDetails';
import { CreateCAISORate } from './CreateCAISORate';

/** ============================ Components ================================ */
const Table = TableFactory<CAISORate>();
export const CAISORateList = () => {
  const dispatch = useDispatch();
  const routeTo = usePushRouter();
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [caisoRateToDelete, setCaisoRateToDelete] = React.useState<CAISORate>();

  return (
    <>
      <Grid>
        <Grid.Item span={12}>
          <Table
            aria-label="Procurement rates table"
            dataFn={(params) => api.getCAISORates({ ...params, data_types: 'default' })}
            dataSelector={slices.models.selectCAISORates}
            onFabClick={() => setCreateDialogOpen(true)}
            raised
            stickyHeader
            title="Procurement Rates"
          >
            {(caisoRates) => (
              <>
                <Table.Head>
                  <Table.Row>
                    <Table.Cell sortBy="name">Name</Table.Cell>
                    <Table.Cell sortBy="created_at">Created</Table.Cell>
                    <Table.Cell>Min $/kWh</Table.Cell>
                    <Table.Cell>Max $/kWh</Table.Cell>
                    <Table.Cell>Average $/kWh</Table.Cell>
                    <Table.Cell>Year</Table.Cell>
                    <Table.Cell align="right">Menu</Table.Cell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {caisoRates.map((caisoRate) => (
                    <Table.Row key={caisoRate.id}>
                      <Table.Cell>
                        <Link to={routes.cost.procurement.caisoRate(caisoRate.id)}>
                          {caisoRate.name}
                        </Link>
                      </Table.Cell>
                      <Table.Cell>
                        <StandardDate date={caisoRate.created_at} />
                      </Table.Cell>
                      <Table.Cell>
                        {formatters.commas(
                          formatters.maxDecimals(caisoRate.data.default?.valueDomain[0], 2)
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {formatters.commas(
                          formatters.maxDecimals(caisoRate.data.default?.valueDomain[1], 2)
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {caisoRate.data.default &&
                          formatters.commas(
                            formatters.maxDecimals(caisoRate.data.default.average, 2)
                          )}
                      </Table.Cell>
                      <Table.Cell>{caisoRate.data.default?.years.join(', ')}</Table.Cell>
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
                          <List.Item onClick={routeTo.cost.procurement.caisoRate(caisoRate)}>
                            <List.Item.Icon icon="launch" />
                            <List.Item.Text>View</List.Item.Text>
                          </List.Item>
                          <List.Item
                            onClick={() => {
                              setCaisoRateToDelete(caisoRate);
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
          </Table>
        </Grid.Item>
      </Grid>
      <CreateCAISORate open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
      <Dialog.Delete
        onClose={() => setCaisoRateToDelete(undefined)}
        onClickDelete={deleteCAISORate}
        title="Delete Procurement Rate"
        message="This will permanently delete the Procurement Rate and cannot be undone."
        open={caisoRateToDelete !== undefined}
      />
    </>
  );

  /** ========================== Callbacks ================================= */
  async function deleteCAISORate() {
    if (caisoRateToDelete) {
      const response = await api.deleteCAISORate(caisoRateToDelete.id);
      if (response.ok) {
        dispatch(slices.models.removeModel(caisoRateToDelete));
        dispatch(slices.ui.setMessage({ msg: 'Procurement rate deleted.', type: 'success' }));
      } else if (response.status === 403) {
        dispatch(
          slices.ui.setMessage({
            msg: 'You do not have permission to delete this procurement rate!',
            type: 'error',
          })
        );
      }
    }
  }
};

export const Procurement = () => (
  <Switch>
    <Route exact path={routes.cost.procurement.base} component={CAISORateList} />
    <Route path={routes.cost.procurement.caisoRate(':id')} component={CAISORateDetails} />
  </Switch>
);
