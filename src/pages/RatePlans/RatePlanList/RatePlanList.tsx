import * as React from "react";
import { useHistory } from "react-router-dom";

import * as api from "navigader/api";
import { Grid, PageHeader, List, Menu } from "navigader/components";
import * as routes from "navigader/routes";
import { makeStylesHook } from "navigader/styles";
import { formatters } from "navigader/util";
import { Table, PaginationState } from "navigader/components";
import { useDispatch } from "react-redux";
import { slices } from "navigader/store";

/** ============================ Types ===================================== */
type RatePlanListProps = {};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(
  () => ({
    tableContainer: {
      maxHeight: 500,
    },
  }),
  "RatePlanTable"
);

/** ============================ Components ================================ */
export const RatePlanList: React.FC<RatePlanListProps> = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();

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
      <PageHeader
        breadcrumbs={[["Rate Plans", routes.rates.base]]}
        title="Rate Plans"
      />
      <Grid>
        <Grid.Item span={12}>
          <Table
            aria-label="meter table"
            dataFn={getRatePlans}
            dataSelector={slices.models.selectRatePlans}
            containerClassName={classes.tableContainer}
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
                  {ratePlans.map((ratePlan) => (
                    <Table.Row key={ratePlan.id}>
                      <Table.Cell>{ratePlan.name}</Table.Cell>
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
                          <List.Item
                            onClick={() => {
                              history.push(
                                routes.rates.ratePlan(ratePlan.id.toString())
                              );
                            }}
                          >
                            <List.Item.Icon icon="pencil" />
                            <List.Item.Text>View/Edit</List.Item.Text>
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
    </>
  );

  /** ========================== Callbacks ================================= */
};
