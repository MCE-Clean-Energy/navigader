import React from 'react';

import { Card, Grid, Frame288Graph, Radio } from '@nav/shared/components';
import { Frame288LoadType, hasDataField, MeterGroup } from '@nav/shared/models/meter';


/** ============================ Types ===================================== */
type LoadGraphProps = {
  dataType: Frame288LoadType;
  meterGroup: MeterGroup;
};

type LoadGraphCardProps = LoadGraphProps & {
  changeType: (newType: Frame288LoadType) => void;
};

/** ============================ Components ================================ */
const LoadGraph: React.FC<LoadGraphProps> = ({ dataType, meterGroup }) => {
  // If we haven't loaded the data yet, don't render the graph
  if (!hasDataField(meterGroup.data, dataType)) {
    return null;
  }
  
  return <Frame288Graph data={meterGroup.data[dataType]} height={200} width={300} />;
};

const LoadGraphCard: React.FC<LoadGraphCardProps> = ({ changeType, dataType, meterGroup }) => {
  return (
    <Card raised>
      <Grid>
        <Grid.Item span={3}>
          <Radio.Group aria-label="graph view" value={dataType} onChange={changeMode}>
            <Radio value="total" label="Total" />
            <Radio value="average" label="Average" />
            <Radio value="maximum" label="Maximum" />
            <Radio value="minimum" label="Minimum" />
            <Radio value="count" label="Count" />
          </Radio.Group>
        </Grid.Item>

        <Grid.Item span={9}>
          <LoadGraph dataType={dataType} meterGroup={meterGroup} />
        </Grid.Item>
      </Grid>
    </Card>
  );
  
  function changeMode (event: React.ChangeEvent, value: string) {
    changeType(value as Frame288LoadType);
  }
};

/** ============================ Exports =================================== */
export default LoadGraphCard;

