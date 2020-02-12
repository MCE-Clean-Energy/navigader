import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { createUseStyles } from 'react-jss';

import * as api from '@nav/shared/api';
import { AppContainer, Centered, Grid, Typography } from '@nav/shared/components';
import { Frame288LoadType, MeterGroup } from '@nav/shared/models/meter';
import { Theme } from '@nav/shared/styles';
import LoadGraph from './LoadGraph';
import MetersTable from './MetersTable';


/** ============================ Types ===================================== */
type MeterGroupProps = RouteComponentProps<{
  id: string;
}>;

/** ============================ Styles ==================================== */
const useStyles = createUseStyles((theme: Theme) => ({
  header: {
    marginBottom: theme.spacing(5)
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

const MeterGroupPage: React.FC<MeterGroupProps> = ({ match }) => {
  const [meterGroup, setMeterGroup] = useState<MeterGroup | null>(null);
  const [graphDataType, setGraphDataType] = useState<Frame288LoadType>('average');
  const classes = useStyles();
  
  useEffect(() => {
    api.getMeterGroup(match.params.id, { types: [graphDataType] })
      .then(res => setMeterGroup(res));
  }, [match.params.id, graphDataType]);
  
  // If we don't have the meter group, don't render anything yet
  if (!meterGroup) return null;
  
  return (
    <AppContainer>
      <Centered className={classes.header}>
        <Typography variant="h6">
          ID: {meterGroup && meterGroup.id}
        </Typography>
      </Centered>
      
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
    </AppContainer>
  );
  
  function changeGraphType (newType: Frame288LoadType) {
    setGraphDataType(newType);
  }
};

/** ============================ Exports =================================== */
export default MeterGroupPage;
