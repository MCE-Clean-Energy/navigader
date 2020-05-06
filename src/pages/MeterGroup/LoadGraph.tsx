import * as React from 'react';

import {
  Card, Grid, Frame288Graph, Frame288MonthsOption, MonthsMenu, LoadTypeMenu
} from 'navigader/components';
import { Frame288LoadType, hasDataField, MeterGroup } from 'navigader/models/meter';
import { makeStylesHook } from 'navigader/styles';


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
  
  const data = meterGroup.data[dataType];
  return <Frame288Graph data={data} loadType={dataType} months={months} />;
};

const LoadGraphCard: React.FC<LoadGraphCardProps> = ({ changeType, dataType, meterGroup }) => {
  const [selectedMonths, setMonths] = React.useState<Frame288MonthsOption>('all');
  const classes = useStyles();
  return (
    <Card className={classes.card} raised>
      <Grid>
        <Grid.Item span={2}>
          <MonthsMenu selectedMonths={selectedMonths} changeMonths={setMonths} />
          <LoadTypeMenu
            changeType={changeType}
            className={classes.loadTypeMenu}
            selectedType={dataType}
          />
        </Grid.Item>

        <Grid.Item span={10}>
          <LoadGraph dataType={dataType} meterGroup={meterGroup} months={selectedMonths} />
        </Grid.Item>
      </Grid>
    </Card>
  );
};

/** ============================ Exports =================================== */
export default LoadGraphCard;

