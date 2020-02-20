import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';

import * as api from '@nav/shared/api';
import { AppContainer, Grid, Typography } from '@nav/shared/components';
import { MeterGroup } from '@nav/shared/models/meter';
import { Theme } from '@nav/shared/styles';
import MeterGroupCard from './MeterGroupCard';


/** ============================ Styles ==================================== */
const useStyles = createUseStyles((theme: Theme) => ({
  header: {
    marginBottom: theme.spacing(3)
  }
}));

/** ============================ Components ================================ */
const LandingPage: React.FC = () => {
  const [meterGroups, setMeterGroups] = useState([] as MeterGroup[]);
  const classes = useStyles();
  
  useEffect(() => {
    api.getMeterGroups({ types: 'average' })
      .then(res => setMeterGroups(res.data));
  }, []);

  return (
    <AppContainer>
      <Typography className={classes.header} useDiv variant="h6">
        Uploaded Files
      </Typography>
      <Grid>
        {meterGroups.map(meterGroup =>
          <Grid.Item key={meterGroup.id} span={6}>
            <MeterGroupCard meterGroup={meterGroup} />
          </Grid.Item>
        )}
      </Grid>
    </AppContainer>
  );
};

/** ============================ Exports =================================== */
export default LandingPage;
