import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Button, Grid, PageHeader, Progress } from 'navigader/components';
import * as routes from 'navigader/routes';
import { makeStylesHook } from 'navigader/styles';
import { useMeterGroups } from 'navigader/util/hooks';
import _ from 'navigader/util/lodash';
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
export const UploadedFiles = () => {
  const history = useHistory();
  const classes = useStyles();

  const { loading, meterGroups } = useMeterGroups({
    data_types: 'average',
    page: 1,
    page_size: 50
  });

  const sortedMeterGroups = _.sortBy(meterGroups, 'created_at').reverse();
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
            loading
              ? <Progress circular />
              : (
                sortedMeterGroups.map(meterGroup =>
                  <Grid.Item key={meterGroup.id} span={6}>
                    <MeterGroupCard meterGroup={meterGroup} />
                  </Grid.Item>
                )
              )
          }
        </Grid>
      </div>
    </>
  );

  /** ========================== Callbacks ================================= */
  function goToUpload () {
    history.push(routes.upload);
  }

  function createScenario () {
    history.push(routes.dashboard.createScenario.selectDers);
  }
};
