import * as React from "react";
import { useDispatch } from "react-redux";

import * as api from "navigader/api";
import { Grid, Link, List, Menu, PageHeader, PaginationState, Table } from "navigader/components";
import { routes, useRouter } from "navigader/routes";
import { slices } from "navigader/store";
import { formatters } from "navigader/util";


/** ============================ Components ================================ */
export const RatePlanList: React.FC = () => {
  const dispatch = useDispatch();
  const routeTo = useRouter();

  const getRatePlans = React.useCallback(
    async (state: PaginationState) => {
      const response = await api.getRatePlans({
        include: "rate_collections.*",
        page: state.currentPage + 1,
        page_size: state.rowsPerPage,
      });

      // Add the models to the store and yield the pagination results
      dispatch(slices.models.updateModels(response.data));
      return response;
    },
    [dispatch]
  );

  return (
    <>
      <PageHeader title="Rate Plans" />
      <Grid>
        <Grid.Item span={12}>
          <Table
            aria-label="meter table"
            dataFn={getRatePlans}
            dataSelector={slices.models.selectRatePlans}
            raised
            stickyHeader
          >
            {(ratePlans) => (
              <>
                <Table.Head>
                  <Table.Row>
                    <Table.Cell>Name</Table.Cell>
                    <Table.Cell>Start Date</Table.Cell>
                    <Table.Cell align="right">Menu</Table.Cell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {ratePlans.map(ratePlan =>
                    <Table.Row key={ratePlan.id}>
                      <Table.Cell>
                        <Link to={routes.rates.ratePlan(ratePlan.id.toString())}>
                          {ratePlan.name}
                        </Link>
                      </Table.Cell>
                      <Table.Cell>
                        {formatters.date.standard(ratePlan.start_date || "")}
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
                          <List.Item onClick={routeTo.rates.ratePlan(ratePlan)}>
                            <List.Item.Icon icon="pencil" />
                            <List.Item.Text>View/Edit</List.Item.Text>
                          </List.Item>
                        </Menu>
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </>
            )}
          </Table>
        </Grid.Item>
      </Grid>
    </>
  );
};
