import * as React from 'react';

import { Button, Grid, PageHeader, Progress } from 'navigader/components';
import { useRouter } from 'navigader/routes';
import { makeStylesHook } from 'navigader/styles';
import { useOriginFiles } from 'navigader/util/hooks';
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
  const routeTo = useRouter();
  const classes = useStyles();

  const originFiles = useOriginFiles({
    data_types: 'average',
    page: 1,
    page_size: 50
  });

  const sortedMeterGroups = _.sortBy(originFiles, 'created_at').reverse();
  return (
    <>
      <PageHeader
        actions={
          <>
            <Button className={classes.uploadButton} color="secondary" onClick={routeTo.upload}>
              Upload New File
            </Button>
            <Button color="secondary" onClick={routeTo.dashboard.createScenario.base}>
              Create New Scenario
            </Button>
          </>
        }
        title="Uploaded Files"
      />
      <div className={classes.pageContent}>
        <Grid>
          {originFiles.loading
            ? <Progress circular />
            : (
              sortedMeterGroups.map(meterGroup =>
                <Grid.Item key={meterGroup.id} span={6}>
                  <MeterGroupCard originFile={meterGroup} />
                </Grid.Item>
              )
            )
          }
        </Grid>
      </div>
    </>
  );
};
