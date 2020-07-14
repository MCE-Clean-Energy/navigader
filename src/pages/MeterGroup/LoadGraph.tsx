import * as React from 'react';

import {
  Card, Grid, Flex, Frame288Graph, MonthSelector, Toggle, Tooltip
} from 'navigader/components';
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
const Graph: React.FC<LoadGraphProps> = ({ dataType, meterGroup, months }) => {
  // If we haven't loaded the data yet, don't render the graph
  if (!hasDataField(meterGroup.data, dataType)) {
    return null;
  }

  const data = new PowerFrame288(meterGroup.data[dataType]).scale();
  return <Frame288Graph axisLabel="Customer Load" months={months} data={data} />;
};

export const LoadGraph: React.FC<LoadGraphCardProps> = ({ changeType, dataType, meterGroup }) => {
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
          <Graph dataType={dataType} meterGroup={meterGroup} months={selectedMonth} />
        </Grid.Item>
      </Grid>
    </Card>
  );
};

export const LoadTypeSelector: React.FC<LoadTypeSelectorProps> = (props) => {
  const { changeType, selectedType } = props;
  const loadTypeOptions: Frame288LoadType[] = ['average', 'maximum', 'minimum'];
  return (
    <Toggle.Group exclusive onChange={selectType} size="small" value={selectedType}>
      {loadTypeOptions.map(loadType =>
        <Tooltip key={loadType} title={tooltips[loadType]}>
          <Toggle.Button aria-label={tooltips[loadType]} value={loadType}>
            {capitalize(loadType)}
          </Toggle.Button>
        </Tooltip>
      )}
    </Toggle.Group>
  );

  /** ============================ Callbacks =============================== */
  function selectType (loadType: Frame288LoadType) {
    // Don't update if they click the same load type again
    if (selectedType !== loadType) {
      changeType(loadType);
    }
  }
};

const tooltips = {
  average: 'The average interval reading at each month-hour of all meters summed',
  maximum: 'The maximum interval reading at each month-hour of all meters summed',
  minimum: 'The minimum interval reading at each month-hour of all meters summed'
};
