import * as React from "react";
import { useDispatch } from "react-redux";

import * as api from "navigader/api";
import { routes, useRouter } from "navigader/routes";
import {
  Grid,
  List,
  Menu,
  PageHeader,
  Table,
  Link,
  PrefetchedTable,
} from "navigader/components";
import { slices } from "navigader/store";
import { formatters } from "navigader/util";
import { CreateRatePlan } from "./CreateRatePlan";
import { makeStylesHook } from "navigader/styles";
import { RatePlan } from "navigader/types";
import { DeleteDialog } from "./DeleteDialog";
import { useRatePlans } from "navigader/util/hooks";

/** ============================ Styles ==================================== */
const useStyle = makeStylesHook(
  () => ({
    fabGutter: {
      height: "60px",
      width: "60px",
    },
  }),
  "FABGutter"
);

/** ============================ Components ================================ */
export const RatePlanList: React.FC = () => {
  const dispatch = useDispatch();
  const routeTo = useRouter();
  const classes = useStyle();
  const [deleteRatePlan, setDeleteRatePlan] = React.useState<RatePlan>();

  const ratePlans = useRatePlans({
    page: 1,
    page_size: 100,
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
              raised
              stickyHeader
            >
              {(ratePlans: RatePlan[]) => (
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
                          <Link
                            to={routes.rates.ratePlan(ratePlan.id.toString())}
                          >
                            {ratePlan.name}
                          </Link>
                        </Table.Cell>
                        <Table.Cell>{ratePlan.sector}</Table.Cell>
                        <Table.Cell>
                          {ratePlan.start_date &&
                            formatters.date.standard(ratePlan.start_date)}
                        </Table.Cell>
                        <Table.Cell align="right">
                          <Menu
                            anchorOrigin={{
                              vertical: "center",
                              horizontal: "center",
                            }}
                            icon="verticalDots"
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "right",
                            }}
                          >
                            <List.Item
                              onClick={routeTo.rates.ratePlan(ratePlan)}
                            >
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
        <Grid.Item className={classes.fabGutter} span={12}></Grid.Item>
      </Grid>
      <CreateRatePlan />
      <DeleteDialog
        onClose={() => {
          setDeleteRatePlan(undefined);
        }}
        onClickDelete={clickDelete}
        title="Delete Rate Plan"
        message={
          "This will permanently delete the Rate Plan and all of its rate data. " +
          "This action cannot be undone."
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
