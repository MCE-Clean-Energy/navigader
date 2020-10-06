import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import {
  Button, Card, Flex, Grid, Link, PageHeader, PrefetchedTable, Progress, ScenarioChip, Table,
  Typography
} from 'navigader/components';
import * as routes from 'navigader/routes';
import { makeStylesHook } from 'navigader/styles';
import { Frame288DataType, MeterGroup } from 'navigader/types';
import { filterClause, formatters, models } from 'navigader/util';
import { useMeterGroup, useScenarios } from 'navigader/util/hooks';
import { LoadGraph } from './LoadGraph';
import MetersTable from './MetersTable';


/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  graphTitle: {
    marginBottom: theme.spacing(1)
  }
}), 'SummaryCard');

const useLinkedScenarioStyles = makeStylesHook(theme => ({
  chip: {
    marginBottom: theme.spacing(1)
  },
  chipContainer: {
    '& > *': {
      margin: theme.spacing(0.5)
    }
  },
  scenariosWrapper: {
    marginTop: theme.spacing(0.5)
  }
}), 'LinkedScenariosCard');

/** ============================ Components ================================ */
const LinkedScenariosCard: React.FC<{ meterGroup: MeterGroup }> = ({ meterGroup }) => {
  const history = useHistory();
  const classes = useLinkedScenarioStyles();
  const { scenarios, loading } = useScenarios({
    filter: {
      "meter_group.id": filterClause.equals(meterGroup.id)
    },
    // Including `meter_group` returns the scenario with the meter group ID, so it gets parsed with
    // the meter group attached
    include: ['ders', 'meter_group', 'report_summary'],
    page: 1,
    page_size: 100
  });

  return (
    <Card raised>
      <Typography useDiv variant="h6">
        Scenarios
      </Typography>

      <div className={classes.scenariosWrapper}>
        {loading && <Progress circular />}
        {!loading && scenarios.length === 0
          ? (
            <>
              <span>No scenarios have been run using this customer segment.</span>
              &nbsp;
              <Link to={routes.dashboard.createScenario.selectDers}>Create one.</Link>
            </>
          )
          : (
            <Flex.Container className={classes.chipContainer} wrap>
              {scenarios.map(s =>
                <ScenarioChip
                  className={classes.chip}
                  disabled={!s.progress.is_complete}
                  key={s.id}
                  onClick={goToScenario(s.id)}
                  scenario={s}
                />
              )}
            </Flex.Container>
          )
        }
      </div>
    </Card>
  );

  /** ========================== Callbacks ================================= */
  function goToScenario (id: string) {
    return () => history.push(routes.scenario(id));
  }
};

const SummaryCard: React.FC<{ meterGroup: MeterGroup }> = ({ meterGroup }) => {
  const classes = useStyles();
  const { max_monthly_demand, date_range, total_kwh } = meterGroup;
  const dateRange = date_range === null
    ? null
    : formatters.date.range(date_range, formatters.date.standard);

  return (
    <Card raised>
      <Typography className={classes.graphTitle} useDiv variant="h6">
        Summary
      </Typography>

      <div>
        <PrefetchedTable data={[]} hover={false} size="small">
          {() =>
            <>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>Uploaded</Table.Cell>
                  <Table.Cell>{formatters.date.standard(meterGroup.created_at)}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell># Meters</Table.Cell>
                  <Table.Cell>{meterGroup.meter_count}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Date range</Table.Cell>
                  <Table.Cell>{dateRange ?? '-'}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Total kWh</Table.Cell>
                  <Table.Cell>{formatters.commas(formatters.maxDecimals(total_kwh, 2))}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Max monthly demand</Table.Cell>
                  <Table.Cell>{formatters.commas(formatters.maxDecimals(max_monthly_demand, 2))} kW</Table.Cell>
                </Table.Row>
              </Table.Body>
            </>
          }
        </PrefetchedTable>
      </div>
    </Card>
  );
};

export const MeterGroupPage: React.FC = () => {
  const [graphDataType, setGraphDataType] = React.useState<Frame288DataType>('average');
  const history = useHistory();
  const { id } = useParams<{ id: string }>();

  const { meterGroup } = useMeterGroup(id, {
    data_types: ['average', 'maximum', 'minimum']
  });

  return (
    <>
      <PageHeader
        actions={
          models.meterGroup.isSufficientlyIngested(meterGroup)
            ? <Button color="secondary" onClick={goToScenarioCreation}>New Scenario</Button>
            : null
        }
        breadcrumbs={[
          ['Customer Groups', routes.load.base],
          [
            models.meterGroup.getDisplayName(meterGroup) || 'Customer Group',
            routes.dashboard.createScenario.review
          ]
        ]}
        title={models.meterGroup.getDisplayName(meterGroup)}
      />

      {meterGroup
        ? (
          <Grid>
            <Grid.Item span={8}>
              <LoadGraph
                changeType={changeGraphType}
                dataType={graphDataType}
                meterGroup={meterGroup}
              />
            </Grid.Item>

            <Grid.Item span={4}>
              <Grid>
                <Grid.Item span={12}>
                  <SummaryCard meterGroup={meterGroup} />
                </Grid.Item>
                <Grid.Item span={12}>
                  <LinkedScenariosCard meterGroup={meterGroup} />
                </Grid.Item>
              </Grid>
            </Grid.Item>

            <Grid.Item span={12}>
              <MetersTable meterGroupId={meterGroup.id} />
            </Grid.Item>
          </Grid>
        )
        : <Progress circular />
      }
    </>
  );

  /** ========================== Callbacks ================================= */
  function changeGraphType (newType: Frame288DataType) {
    setGraphDataType(newType);
  }

  function goToScenarioCreation () {
    history.push(routes.dashboard.createScenario.selectDers);
  }
};
