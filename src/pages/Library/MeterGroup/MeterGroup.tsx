import * as React from 'react';
import { useParams } from 'react-router-dom';

import {
  Button,
  Card,
  Flex,
  Grid,
  Link,
  MeterGroupChip,
  PageHeader,
  Progress,
  SummaryTable,
  Typography,
} from 'navigader/components';
import { routes, usePushRouter } from 'navigader/routes';
import { makeStylesHook } from 'navigader/styles';
import { Frame288DataType, OriginFile } from 'navigader/types';
import { filterClause, models } from 'navigader/util';
import { useOriginFile, useScenarios } from 'navigader/util/hooks';
import { LoadGraph } from './LoadGraph';
import MetersTable from './MetersTable';

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(
  (theme) => ({
    graphTitle: {
      marginBottom: theme.spacing(1),
    },
  }),
  'SummaryCard'
);

const useLinkedScenarioStyles = makeStylesHook(
  (theme) => ({
    chip: {
      marginBottom: theme.spacing(1),
    },
    chipContainer: {
      '& > *': {
        margin: theme.spacing(0.5),
      },
    },
    scenariosWrapper: {
      marginTop: theme.spacing(0.5),
    },
  }),
  'LinkedScenariosCard'
);

/** ============================ Components ================================ */
const LinkedScenariosCard: React.FC<{ originFile: OriginFile }> = ({ originFile }) => {
  const routeTo = usePushRouter();
  const classes = useLinkedScenarioStyles();
  const scenarios = useScenarios({
    filter: {
      'meter_group.id': filterClause.equals(originFile.id),
    },
    // Including `meter_group` returns the scenario with the meter group ID, so it gets parsed with
    // the meter group attached
    include: ['ders', 'meter_group', 'report_summary'],
    page: 0,
    pageSize: 100,
  });

  return (
    <Card raised>
      <Typography useDiv variant="h6">
        Scenarios
      </Typography>

      <div className={classes.scenariosWrapper}>
        {scenarios.loading ? (
          <Progress circular />
        ) : scenarios.length === 0 ? (
          <>
            <span>No scenarios have been run using this customer segment.</span>
            &nbsp;
            <Link to={routes.dashboard.createScenario.base}>Create one.</Link>
          </>
        ) : (
          <Flex.Container className={classes.chipContainer} wrap>
            {scenarios.map((s) => (
              <MeterGroupChip
                className={classes.chip}
                disabled={!s.progress.is_complete}
                key={s.id}
                onClick={routeTo.scenario.details(s)}
                meterGroup={s}
              />
            ))}
          </Flex.Container>
        )}
      </div>
    </Card>
  );
};

const SummaryCard: React.FC<{ originFile: OriginFile }> = ({ originFile }) => {
  const classes = useStyles();
  return (
    <Card raised>
      <Typography className={classes.graphTitle} useDiv variant="h6">
        Summary
      </Typography>
      <SummaryTable originFile={originFile} />
    </Card>
  );
};

export const MeterGroupPage: React.FC = () => {
  const [graphDataType, setGraphDataType] = React.useState<Frame288DataType>('average');
  const routeTo = usePushRouter();
  const { id } = useParams<{ id: string }>();

  const { originFile } = useOriginFile(id, {
    data_types: ['average', 'maximum', 'minimum'],
    include: 'total_therms',
  });

  return (
    <>
      <PageHeader
        actions={
          models.meterGroup.isSufficientlyIngested(originFile) ? (
            <Button color="secondary" onClick={routeTo.dashboard.createScenario.base}>
              New Scenario
            </Button>
          ) : null
        }
        breadcrumbs={[
          ['Library', routes.library.base],
          models.meterGroup.getDisplayName(originFile) || 'Customer Data',
        ]}
        title={models.meterGroup.getDisplayName(originFile)}
      />

      {originFile ? (
        <Grid>
          <Grid.Item span={8}>
            <LoadGraph
              changeType={changeGraphType}
              dataType={graphDataType}
              meterGroup={originFile}
            />
          </Grid.Item>

          <Grid.Item span={4}>
            <Grid>
              <Grid.Item span={12}>
                <SummaryCard originFile={originFile} />
              </Grid.Item>
              <Grid.Item span={12}>
                <LinkedScenariosCard originFile={originFile} />
              </Grid.Item>
            </Grid>
          </Grid.Item>

          <Grid.Item span={12}>
            <MetersTable originFile={originFile} />
          </Grid.Item>
        </Grid>
      ) : (
        <Progress circular />
      )}
    </>
  );

  /** ========================== Callbacks ================================= */
  function changeGraphType(newType: Frame288DataType) {
    setGraphDataType(newType);
  }
};
