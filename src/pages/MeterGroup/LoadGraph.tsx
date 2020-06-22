import * as React from 'react';

import { Card, Grid, Flex, Frame288Graph, MonthSelector, Toggle } from 'navigader/components';
import { hasDataField } from 'navigader/models/meter';
import { makeStylesHook } from 'navigader/styles';
import { Frame288LoadType, MeterGroup, MonthsOption, PowerFrame288 } from 'navigader/types';
import { capitalize } from 'navigader/util/formatters';


/** ============================ Types ===================================== */
type LoadGraphCommonProps = {
  dataType: Frame288LoadType;
  meterGroup: MeterGroup;
};

type LoadGraphProps = LoadGraphCommonProps & {
  months: MonthsOption;
};

type LoadGraphCardProps = LoadGraphCommonProps & {
  changeType: (newType: Frame288LoadType) => void;
};

type LoadTypeSelectorProps = {
  changeType: (newType: Frame288LoadType) => void;
  className?: string;
  selectedType: Frame288LoadType;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  card: {
    // Makes the graph tooltips visible
    overflow: 'visible'
  },
  loadTypeMenu: {
    marginTop: theme.spacing(1)
  }
}), 'NavigaderCard');

/** ============================ Components ================================ */
const LoadGraph: React.FC<LoadGraphProps> = ({ dataType, meterGroup, months }) => {
  // If we haven't loaded the data yet, don't render the graph
  if (!hasDataField(meterGroup.data, dataType)) {
    return null;
  }

  const data = new PowerFrame288(meterGroup.data[dataType]).scale();
  return <Frame288Graph axisLabel="Customer Load" months={months} data={data} />;
};

const LoadGraphCard: React.FC<LoadGraphCardProps> = ({ changeType, dataType, meterGroup }) => {
  const [selectedMonth, setMonth] = React.useState<MonthsOption>('all');
  const classes = useStyles();
  return (
    <Card className={classes.card} raised>
      <Grid>
        <Grid.Item span={12}>
          <Flex.Container alignItems="center" justifyContent="center">
            <Flex.Item>
              <MonthSelector selected={selectedMonth} onChange={setMonth}/>
            </Flex.Item>
            <Flex.Item style={{ marginLeft: '1rem' }}>
              <LoadTypeSelector changeType={changeType} selectedType={dataType} />
            </Flex.Item>
          </Flex.Container>
        </Grid.Item>

        <Grid.Item span={12}>
          <LoadGraph dataType={dataType} meterGroup={meterGroup} months={selectedMonth} />
        </Grid.Item>
      </Grid>
    </Card>
  );
};

export const LoadTypeSelector: React.FC<LoadTypeSelectorProps> = (props) => {
  const { changeType, className, selectedType } = props;
  const loadTypeOptions: Frame288LoadType[] = ['average', 'maximum', 'minimum'];
  return (
    <div className={className}>
      <Toggle.Group
        exclusive
        onChange={selectType}
        size="small"
        value={selectedType}
      >
        {loadTypeOptions.map(loadType =>
          <Toggle.Button
            aria-label="show simulated load"
            key={loadType}
            value={loadType}
          >
            {capitalize(loadType)}
          </Toggle.Button>
        )}
      </Toggle.Group>
    </div>
  );
  
  /** ============================ Callbacks =============================== */
  function selectType (loadType: Frame288LoadType) {
    // Don't update if they click the same load type again
    if (selectedType !== loadType) {
      changeType(loadType);
    }
  }
};

/** ============================ Exports =================================== */
export default LoadGraphCard;
