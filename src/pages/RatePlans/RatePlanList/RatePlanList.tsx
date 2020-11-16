import * as React from 'react';
import { useDispatch } from 'react-redux';

import * as api from 'navigader/api';
import {
  Grid,
  Link,
  List,
  Menu,
  PageHeader,
  PrefetchedTable,
  StandardDate,
  Table,
} from 'navigader/components';
import { routes, usePushRouter } from 'navigader/routes';
import { slices } from 'navigader/store';
import { CreateRatePlanDialog } from './CreateRatePlanDialog';
import { makeStylesHook } from 'navigader/styles';
import { RatePlan } from 'navigader/types';
import { DeleteDialog } from './DeleteDialog';
import { useRatePlans } from 'navigader/util/hooks';

/** ============================ Styles ==================================== */
const useStyle = makeStylesHook(
  () => ({
    fabGutter: {
      height: '60px',
      width: '60px',
    },
  }),
  'FABGutter'
);

/** ============================ Components ================================ */
export const RatePlanList: React.FC = () => {
  const dispatch = useDispatch();
  const routeTo = usePushRouter();
  const classes = useStyle();
  const [deleteRatePlan, setDeleteRatePlan] = React.useState<RatePlan>();
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  const ratePlans = useRatePlans({
    page: 0,
    pageSize: 100,
  });

  return (
    <>
      <PageHeader title="Rate Plans" />
      <Grid>
        <Grid.Item span={12}>
          {ratePlans && !ratePlans.loading && (
            <PrefetchedTable
              aria-label="rate plan table"
              data={ratePlans}
              onFabClick={() => setCreateDialogOpen(true)}
              raised
              stickyHeader
              title="Rate Plans"
            >
              {(ratePlans) => (
                <>
                  <Table.Head>
                    <Table.Row>
                      <Table.Cell>Name</Table.Cell>
                      <Table.Cell>Sector</Table.Cell>
                      <Table.Cell>Start Date</Table.Cell>
                      <Table.Cell align="right">Menu</Table.Cell>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {ratePlans.map((ratePlan) => (
                      <Table.Row key={ratePlan.id}>
                        <Table.Cell>
                          <Link to={routes.rates.ratePlan(ratePlan.id.toString())}>
                            {ratePlan.name}
                          </Link>
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
                            <List.Item onClick={routeTo.rates.ratePlan(ratePlan)}>
                              <List.Item.Icon icon="pencil" />
                              <List.Item.Text>View/Edit</List.Item.Text>
                            </List.Item>
                            <List.Item
                              onClick={() => {
                                setDeleteRatePlan(ratePlan);
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
        <Grid.Item className={classes.fabGutter} span={12} />
      </Grid>
      <CreateRatePlanDialog
        closeDialog={() => setCreateDialogOpen(false)}
        open={createDialogOpen}
      />
      <DeleteDialog
        onClose={() => {
          setDeleteRatePlan(undefined);
        }}
        onClickDelete={clickDelete}
        title="Delete Rate Plan"
        message={
          'This will permanently delete the Rate Plan and all of its rate data. ' +
          'This action cannot be undone.'
        }
        open={deleteRatePlan !== undefined}
      />
    </>
  );

  /** ================================ Callbacks =========================== */

  async function clickDelete() {
    if (deleteRatePlan) {
      const response = await api.deleteRatePlan(deleteRatePlan.id.toString());
      if (response.ok) {
        dispatch(slices.models.removeModel(deleteRatePlan));
      }
    }
  }
};
