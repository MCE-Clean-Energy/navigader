import * as React from 'react';

import { Card, Grid, Frame288Graph, Radio } from '@nav/shared/components';
import { Frame288LoadType, hasDataField, MeterGroup } from '@nav/shared/models/meter';
import { Frame288MonthsOption } from '@nav/shared/components/graphs/Frame288Graph';
import MonthsMenu from './MonthsMenu';


/** ============================ Types ===================================== */
type LoadGraphCommonProps = {
  dataType: Frame288LoadType;
  meterGroup: MeterGroup;
};

type LoadGraphProps = LoadGraphCommonProps & {
  months: Frame288MonthsOption;
};

type LoadGraphCardProps = LoadGraphCommonProps & {
  changeType: (newType: Frame288LoadType) => void;
};

/** ============================ Styles ==================================== */
const cardStyles = {
  // Makes the graph tooltips visible
  overflow: 'visible'
};

/** ============================ Components ================================ */
const LoadGraph: React.FC<LoadGraphProps> = ({ dataType, meterGroup, months }) => {
  // If we haven't loaded the data yet, don't render the graph
  if (!hasDataField(meterGroup.data, dataType)) {
    return null;
  }
  
  const data = meterGroup.data[dataType];
  return <Frame288Graph data={data} loadType={dataType} months={months} />;
};

const LoadGraphCard: React.FC<LoadGraphCardProps> = ({ changeType, dataType, meterGroup }) => {
  const [selectedMonths, setMonths] = React.useState<Frame288MonthsOption>('all');
  return (
    <Card raised styleOverrides={cardStyles}>
      <Grid>
        <Grid.Item span={2}>
          <Radio.Group aria-label="graph view" value={dataType} onChange={changeMode}>
            <Radio value="total" label="Total" />
            <Radio value="average" label="Average" />
            <Radio value="maximum" label="Maximum" />
            <Radio value="minimum" label="Minimum" />
            <Radio value="count" label="Count" />
          </Radio.Group>
          
          <MonthsMenu selectedMonths={selectedMonths} changeMonths={setMonths} />
        </Grid.Item>

        <Grid.Item span={10}>
          <LoadGraph dataType={dataType} meterGroup={meterGroup} months={selectedMonths} />
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

