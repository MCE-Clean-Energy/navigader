import * as React from 'react';
import { useParams } from 'react-router-dom';

import * as api from '@nav/shared/api';
import { Fade, Grid, PageHeader, Progress, Typography } from '@nav/shared/components';
import { Frame288LoadType, getMeterGroupDisplayName, MeterGroup } from '@nav/shared/models/meter';
import * as routes from '@nav/shared/routes';
import { makeStylesHook } from '@nav/shared/styles';
import LoadGraph from './LoadGraph';
import MetersTable from './MetersTable';


/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  tableWrapper: {
    marginTop: theme.spacing(3)
  }
}));

/** ============================ Components ================================ */
const DetailsSection: React.FC = () => (
  <div>
    <Typography variant="h6" useDiv>
      Details
    </Typography>
    
    <Typography variant="body1">
      This is where some description of the meter group would go. Details might include what sort
      of meters are included, why the file was uploaded/cluster was created, and so on.
    </Typography>
  </div>
);

export const MeterGroupPage: React.FC = () => {
  const [meterGroup, setMeterGroup] = React.useState<MeterGroup | null>(null);
  const [graphDataType, setGraphDataType] = React.useState<Frame288LoadType>('average');
  const classes = useStyles();
  const { id } = useParams();
  
  React.useEffect(() => {
    if (!id) return;
    api.getMeterGroup(id, { data_types: graphDataType })
      .then(res => setMeterGroup(res));
  }, [id, graphDataType]);
  
  return (
    <>
      <PageHeader
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
          <Grid.Item span={8}>
            <LoadGraph
              changeType={changeGraphType}
              dataType={graphDataType}
              meterGroup={meterGroup}
            />
          </Grid.Item>
          <Grid.Item span={1} />
          <Grid.Item span={3}>
            <DetailsSection />
          </Grid.Item>
          
          <Grid.Item span={12}>
            <div className={classes.tableWrapper}>
              <MetersTable meterGroupId={meterGroup.id} />
            </div>
          </Grid.Item>
        </Grid>
      ) : (
        <Fade in unmountOnExit>
          <Progress circular />
        </Fade>
      )}
    </>
  );
  
  /** ============================ Callbacks =============================== */
  function changeGraphType (newType: Frame288LoadType) {
    setGraphDataType(newType);
  }
};
