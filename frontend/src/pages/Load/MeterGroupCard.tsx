import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { createUseStyles } from 'react-jss';

import { Card, Grid, Frame288Graph, Statistic, Typography } from '@nav/shared/components';
import { hasDataField, MeterGroup } from '@nav/shared/models/meter';
import * as routes from '@nav/shared/routes';
import { dateFormatter } from '@nav/shared/util';


/** ============================ Types ===================================== */
type MeterGroupCardProps = RouteComponentProps & {
  meterGroup: MeterGroup
};

/** ============================ Styles ==================================== */
const useMeterGroupCardStyles = createUseStyles({
  card: {
    cursor: 'pointer'
  }
});

/** ============================ Components ================================ */
const MeterGroupCard: React.FC<MeterGroupCardProps> = ({ meterGroup, history}) => {
  const classes = useMeterGroupCardStyles();
  
  // Render the graph if we've loaded the average data
  const graph = hasDataField(meterGroup.data, 'average')
    ? <Frame288Graph data={meterGroup.data.average} height={200} />
    : null;
  
  return (
    <Card raised className={classes.card} onClick={viewMeterGroup}>
      <Typography variant="h6">{meterGroup.fileName}</Typography>
      {graph}
      <Grid>
        <Grid.Item>
          <Statistic title="# of Meters" value={meterGroup.numMeters} />
        </Grid.Item>
        <Grid.Item span={1} />
        <Grid.Item>
          <Statistic title="Uploaded" value={dateFormatter(meterGroup.created)} />
        </Grid.Item>
      </Grid>
    </Card>
  );
  
  function viewMeterGroup () {
    history.push(routes.meterGroup(meterGroup.id));
  }
};

/** ============================ Exports =================================== */
export default withRouter(MeterGroupCard);
