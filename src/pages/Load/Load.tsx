import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { withRouter } from 'react-router-dom';

import * as api from '@nav/shared/api';
import { AppContainer, Button, Flex, Grid, Typography } from '@nav/shared/components';
import { MeterGroup } from '@nav/shared/models/meter';
import * as routes from '@nav/shared/routes';
import { Theme } from '@nav/shared/styles';
import MeterGroupCard from './MeterGroupCard';


/** ============================ Styles ==================================== */
const useStyles = createUseStyles((theme: Theme) => ({
  header: {
    marginBottom: theme.spacing(3)
  }
}));

/** ============================ Components ================================ */
const LandingPage = withRouter(({ history }) => {
  const [meterGroups, setMeterGroups] = useState([] as MeterGroup[]);
  const classes = useStyles();
  
  useEffect(() => {
    api.getMeterGroups({ types: 'average' })
      .then(res => setMeterGroups(res.data));
  }, []);

  return (
    <AppContainer>
      <Flex.Container className={classes.header}>
        <Flex.Item>
          <Typography variant="h6">
            Uploaded Files
          </Typography>
        </Flex.Item>
        <Flex.Item>
          <Button color="secondary" onClick={goToUpload}>Add File</Button>
        </Flex.Item>
      </Flex.Container>
      <Grid>
        {meterGroups.map(meterGroup =>
          <Grid.Item key={meterGroup.id} span={6}>
            <MeterGroupCard meterGroup={meterGroup} />
          </Grid.Item>
        )}
      </Grid>
    </AppContainer>
  );
  
  function goToUpload () {
    history.push(routes.upload);
  }
});

/** ============================ Exports =================================== */
export default LandingPage;
