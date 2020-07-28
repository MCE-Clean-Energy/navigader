import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import * as api from 'navigader/api';
import { Button, Fade, Grid, PageHeader, Progress, Typography } from 'navigader/components';
import { getMeterGroupDisplayName, isSufficientlyIngested } from 'navigader/models/meter';
import * as routes from 'navigader/routes';
import { makeStylesHook } from 'navigader/styles';
import { Frame288DataType, MeterGroup } from 'navigader/types';
import { LoadGraph } from './LoadGraph';
import MetersTable from './MetersTable';


/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  graphTitle: {
    marginBottom: theme.spacing(1)
  }
}), 'MeterGroupPage');

/** ============================ Components ================================ */
export const MeterGroupPage: React.FC = () => {
  const [meterGroup, setMeterGroup] = React.useState<MeterGroup>();
  const [graphDataType, setGraphDataType] = React.useState<Frame288DataType>('average');
  const history = useHistory();
  const { id } = useParams();
  const classes = useStyles();

  React.useEffect(() => {
    if (!id) return;
    api.getMeterGroup(id, { data_types: graphDataType })
      .then(res => setMeterGroup(res));
  }, [id, graphDataType]);

  return (
    <>
      <PageHeader
        actions={
          isSufficientlyIngested(meterGroup)
            ? <Button color="secondary" onClick={goToScenarioCreation}>New Scenario</Button>
            : null
        }
        breadcrumbs={[
          ['Customer Groups', routes.load],
          [
            getMeterGroupDisplayName(meterGroup) || 'Customer Group',
            routes.dashboard.createScenario.review
          ]
        ]}
        title={getMeterGroupDisplayName(meterGroup)}
      />

      {meterGroup ? (
        <Grid>
          <Grid.Item span={12}>
            <Typography className={classes.graphTitle} useDiv variant="h6">
              Aggregate Load Curve by Month
            </Typography>
            <LoadGraph
              changeType={changeGraphType}
              dataType={graphDataType}
              meterGroup={meterGroup}
            />
          </Grid.Item>

          <Grid.Item span={12}>
            <MetersTable meterGroupId={meterGroup.id} />
          </Grid.Item>
        </Grid>
      ) : (
        <Fade in unmountOnExit>
          <Progress circular />
        </Fade>
      )}
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
