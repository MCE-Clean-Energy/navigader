import * as React from 'react';
import { useParams } from 'react-router-dom';

import * as api from '@nav/shared/api';
import { Fade, Grid, PageHeader, Progress } from '@nav/shared/components';
import { Frame288LoadType, getMeterGroupDisplayName, MeterGroup } from '@nav/shared/models/meter';
import * as routes from '@nav/shared/routes';
import LoadGraph from './LoadGraph';
import MetersTable from './MetersTable';


/** ============================ Components ================================ */
export const MeterGroupPage: React.FC = () => {
  const [meterGroup, setMeterGroup] = React.useState<MeterGroup | null>(null);
  const [graphDataType, setGraphDataType] = React.useState<Frame288LoadType>('average');
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
          <Grid.Item span={12}>
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
  
  /** ============================ Callbacks =============================== */
  function changeGraphType (newType: Frame288LoadType) {
    setGraphDataType(newType);
  }
};
