import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Card, Grid, Frame288Graph, Statistic, Typography } from '@nav/shared/components';
import { getMeterGroupDisplayName, hasDataField, MeterGroup } from '@nav/shared/models/meter';
import * as routes from '@nav/shared/routes';
import { makeStylesHook } from '@nav/shared/styles';
import { formatters } from '@nav/shared/util';


/** ============================ Types ===================================== */
type MeterGroupCardProps = {
  meterGroup: MeterGroup
};

/** ============================ Styles ==================================== */
const useMeterGroupCardStyles = makeStylesHook(() => ({
  card: {
    cursor: 'pointer'
  }
}));

/** ============================ Components ================================ */
export const MeterGroupCard: React.FC<MeterGroupCardProps> = ({ meterGroup}) => {
  const classes = useMeterGroupCardStyles();
  const history = useHistory();
  
  // Render the graph if we've loaded the average data
  const graph = hasDataField(meterGroup.data, 'average')
    ? <Frame288Graph data={meterGroup.data.average} loadType="average" />
    : null;
  
  return (
    <Card raised className={classes.card} onClick={viewMeterGroup}>
      <Typography variant="h6">{getMeterGroupDisplayName(meterGroup)}</Typography>
      {graph}
      <Grid>
        <Grid.Item>
          <Statistic title="# of Meters" value={meterGroup.numMeters} />
        </Grid.Item>
        <Grid.Item span={1} />
        <Grid.Item>
          <Statistic title="Uploaded" value={formatters.standardDate(meterGroup.created_at)} />
        </Grid.Item>
      </Grid>
    </Card>
  );
  
  function viewMeterGroup () {
    history.push(routes.meterGroup(meterGroup.id));
  }
};
