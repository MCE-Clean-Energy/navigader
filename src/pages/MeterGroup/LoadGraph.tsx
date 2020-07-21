import * as React from 'react';

import { Card, Flex, Frame288Graph, MonthSelector, Toggle, Tooltip } from 'navigader/components';
import { makeStylesHook } from 'navigader/styles';
import { Frame288DataType, MeterGroup, MonthsOption } from 'navigader/types';
import { PowerFrame288 } from 'navigader/util';
import { capitalize } from 'navigader/util/formatters';


/** ============================ Types ===================================== */
type LoadGraphCommonProps = {
  dataType: Frame288DataType;
  meterGroup: MeterGroup;
};

type LoadGraphProps = LoadGraphCommonProps & {
  months: MonthsOption;
};

type LoadGraphCardProps = LoadGraphCommonProps & {
  changeType: (newType: Frame288DataType) => void;
};

type LoadTypeSelectorProps = {
  changeType: (newType: Frame288DataType) => void;
  selectedType: Frame288DataType;
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
}), 'LoadGraph');

const useLoadTypeSelectorStyles = makeStylesHook(() => ({
  tooltipAnchor: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0
  }
}), 'LoadTypeSelector');

/** ============================ Components ================================ */
const Graph: React.FC<LoadGraphProps> = ({ dataType, meterGroup, months }) => {
  // If we haven't loaded the data yet, don't render the graph
  const dataOfType = meterGroup.data[dataType];
  if (!dataOfType) return null;

  const data = new PowerFrame288(dataOfType).scale();
  return <Frame288Graph axisLabel="Customer Load" months={months} data={data} />;
};

export const LoadGraph: React.FC<LoadGraphCardProps> = ({ changeType, dataType, meterGroup }) => {
  const [selectedMonth, setMonth] = React.useState<MonthsOption>('all');
  const classes = useStyles();
  return (
    <Card className={classes.card} raised>
      <Flex.Container alignItems="center" justifyContent="center">
        <Flex.Item>
          <MonthSelector selected={selectedMonth} onChange={setMonth}/>
        </Flex.Item>
        <Flex.Item style={{ marginLeft: '1rem' }}>
          <LoadTypeSelector changeType={changeType} selectedType={dataType} />
        </Flex.Item>
      </Flex.Container>

      <Graph dataType={dataType} meterGroup={meterGroup} months={selectedMonth} />
    </Card>
  );
};

export const LoadTypeSelector: React.FC<LoadTypeSelectorProps> = (props) => {
  const { changeType, selectedType } = props;
  const classes = useLoadTypeSelectorStyles();
  const loadTypeOptions: Frame288DataType[] = ['average', 'maximum', 'minimum'];
  return (
    <Toggle.Group exclusive onChange={selectType} size="small" value={selectedType}>
      {loadTypeOptions.map(loadType =>
        <Toggle.Button aria-label={tooltips[loadType]} key={loadType} value={loadType}>
          {capitalize(loadType)}
          
          {/** The tooltip can't wrap the Button because MUI passes props from the Group */}
          <Tooltip title={tooltips[loadType]}>
            <span className={classes.tooltipAnchor} />
          </Tooltip>
        </Toggle.Button>
      )}
    </Toggle.Group>
  );

  /** ============================ Callbacks =============================== */
  function selectType (loadType: Frame288DataType) {
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
