import * as React from 'react';
import { useDispatch } from 'react-redux';

import * as api from 'navigader/api';
import { Dialog, Link, List, Menu, StandardDate, TableFactory } from 'navigader/components';
import { routes, usePushRouter } from 'navigader/routes';
import { slices } from 'navigader/store';
import { RatePlan } from 'navigader/types';

import { CreateRatePlan } from './CreateRatePlan';

/** ============================ Components ================================ */
const Table = TableFactory<RatePlan>();
export const RatePlanList: React.FC = () => {
  const dispatch = useDispatch();
  const routeTo = usePushRouter();
  const [ratePlanToDelete, setRatePlanToDelete] = React.useState<RatePlan>();
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  return (
    <>
      <Table
        aria-label="rate plan table"
        dataFn={api.getRatePlans}
        dataSelector={slices.models.selectRatePlans}
        onFabClick={() => setCreateDialogOpen(true)}
        raised
        stickyHeader
        title="Rate Plans"
      >
        {(ratePlans) => (
          <>
            <Table.Head>
              <Table.Row>
                <Table.Cell sortBy="name">Name</Table.Cell>
                <Table.Cell sortBy="created_at">Created</Table.Cell>
                <Table.Cell sortBy="sector">Sector</Table.Cell>
                <Table.Cell>Start Date</Table.Cell>
                <Table.Cell align="right">Menu</Table.Cell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {ratePlans.map((ratePlan) => (
                <Table.Row key={ratePlan.id}>
                  <Table.Cell>
                    <Link to={routes.cost.rates.ratePlan(ratePlan.id)}>{ratePlan.name}</Link>
                  </Table.Cell>
                  <Table.Cell>
                    <StandardDate date={ratePlan.created_at} />
                  </Table.Cell>
                  <Table.Cell>{ratePlan.sector}</Table.Cell>
                  <Table.Cell>
                    <StandardDate date={ratePlan.start_date} />
                  </Table.Cell>
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
                      <List.Item onClick={routeTo.cost.rates.ratePlan(ratePlan)}>
                        <List.Item.Icon icon="launch" />
                        <List.Item.Text>View</List.Item.Text>
                      </List.Item>
                      <List.Item onClick={() => setRatePlanToDelete(ratePlan)}>
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

      <CreateRatePlan open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
      <Dialog.Delete
        onClose={() => setRatePlanToDelete(undefined)}
        onClickDelete={deleteRatePlan}
        title="Delete Rate Plan"
        message={
          'This will permanently delete the Rate Plan and all of its rate data. ' +
          'This action cannot be undone.'
        }
        open={ratePlanToDelete !== undefined}
      />
    </>
  );

  /** ================================ Callbacks =========================== */
  async function deleteRatePlan() {
    if (ratePlanToDelete) {
      const response = await api.deleteRatePlan(ratePlanToDelete.id.toString());
      if (response.ok) {
        dispatch(slices.models.removeModel(ratePlanToDelete));
        dispatch(slices.ui.setMessage({ msg: 'Rate plan deleted.', type: 'success' }));
      } else if (response.status === 403) {
        dispatch(
          slices.ui.setMessage({
            msg: 'You do not have permission to delete this rate plan!',
            type: 'error',
          })
        );
      }
    }
  }
};
