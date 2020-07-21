import * as React from 'react';
import { useHistory } from 'react-router-dom';

import * as api from 'navigader/api';
import { Button, Grid, PageHeader, Progress } from 'navigader/components';
import * as routes from 'navigader/routes';
import { makeStylesHook } from 'navigader/styles';
import { MeterGroup } from 'navigader/types';
import { makeCancelableAsync } from 'navigader/util';
import { MeterGroupCard } from './MeterGroupCard';


/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  pageContent: {
    marginTop: theme.spacing(1)
  },
  uploadButton: {
    marginRight: theme.spacing(2)
  }
}), 'LoadPage');

/** ============================ Components ================================ */
export const LoadPage = () => {
  const [meterGroups, setMeterGroups] = React.useState<MeterGroup[]>();
  const history = useHistory();
  const classes = useStyles();
  
  React.useEffect(makeCancelableAsync(
    () => api.getMeterGroups({
      data_types: 'average',
      page: 1,
      page_size: 20
    }),
    res => setMeterGroups(res.data)
  ), []);

  return (
    <>
      <PageHeader
        actions={
          <>
            <Button className={classes.uploadButton} color="secondary" onClick={goToUpload}>
              Upload New File
            </Button>
            <Button color="secondary" onClick={createScenario}>Create New Scenario</Button>
          </>
        }
        title="Uploaded Files"
      />
      <div className={classes.pageContent}>
        <Grid>
          {
            meterGroups
              ? meterGroups.map(meterGroup =>
                  <Grid.Item key={meterGroup.id} span={6}>
                    <MeterGroupCard meterGroup={meterGroup} />
                  </Grid.Item>
                )
              : <Progress circular />
          }
        </Grid>
      </div>
    </>
  );

  /** ============================ Callbacks =============================== */
  function goToUpload () {
    history.push(routes.upload);
  }
  
  function createScenario () {
    history.push(routes.dashboard.createScenario.selectDers);
  }
};
