import * as React from 'react';
import { useHistory } from 'react-router-dom';

import * as api from '@nav/shared/api';
import { Button, Grid, PageHeader } from '@nav/shared/components';
import { MeterGroup } from '@nav/shared/models/meter';
import * as routes from '@nav/shared/routes';
import { makeCancelableAsync } from '@nav/shared/util';
import { MeterGroupCard } from './MeterGroupCard';


/** ============================ Components ================================ */
export const LoadPage = () => {
  const [meterGroups, setMeterGroups] = React.useState([] as MeterGroup[]);
  const history = useHistory();
  
  React.useEffect(makeCancelableAsync(
    () => api.getMeterGroups({ data_types: 'average' }),
    res => setMeterGroups(res.data)
  ), []);

  return (
    <>
      <PageHeader
        actions={<Button color="secondary" onClick={goToUpload}>Add File</Button>}
        title="Uploaded Files"
      />
      <Grid>
        {meterGroups.map(meterGroup =>
          <Grid.Item key={meterGroup.id} span={6}>
            <MeterGroupCard meterGroup={meterGroup} />
          </Grid.Item>
        )}
      </Grid>
    </>
  );

  /** ============================ Callbacks =============================== */
  function goToUpload () {
    history.push(routes.upload);
  }
};
