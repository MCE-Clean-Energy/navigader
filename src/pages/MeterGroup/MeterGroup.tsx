import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import * as api from '@nav/shared/api';
import { Button, Fade, Grid, Progress, Typography } from '@nav/shared/components';
import { Frame288LoadType, getMeterGroupDisplayName, MeterGroup } from '@nav/shared/models/meter';
import * as routes from '@nav/shared/routes';
import { makeStylesHook } from '@nav/shared/styles';
import LoadGraph from './LoadGraph';
import MetersTable from './MetersTable';


/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  header: {
    alignItems: 'center',
    display: 'flex',
    marginBottom: theme.spacing(2),
    '& > button': {
      marginRight: theme.spacing(2)
    }
  },
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

const BackButton = () => {
  const history = useHistory();
  return <Button icon="back" onClick={goBack} role="back-button" />;
 
  /** ============================ Callbacks =============================== */
  function goBack () {
    history.push(routes.load);
  }
};

const MeterGroupPage: React.FC = () => {
  const [meterGroup, setMeterGroup] = React.useState<MeterGroup | null>(null);
  const [graphDataType, setGraphDataType] = React.useState<Frame288LoadType>('average');
  const classes = useStyles();
  const { id } = useParams();
  
  React.useEffect(() => {
    if (!id) return;
    api.getMeterGroup(id, { types: [graphDataType] })
      .then(res => setMeterGroup(res));
  }, [id, graphDataType]);
  
  return (
    <>
      <div className={classes.header}>
        <BackButton />
        <Typography variant="h6">
          {meterGroup && getMeterGroupDisplayName(meterGroup)}
        </Typography>
      </div>
      
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

/** ============================ Exports =================================== */
export default MeterGroupPage;
