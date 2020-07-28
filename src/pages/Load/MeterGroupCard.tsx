import * as React from 'react';
import { useHistory } from 'react-router-dom';

import {
  Card, Grid, Frame288Graph, Statistic, MeterGroupChip, Progress, Typography, Tooltip
} from 'navigader/components';
import { isSufficientlyIngested } from 'navigader/models/meter';
import * as routes from 'navigader/routes';
import { makeStylesHook } from 'navigader/styles';
import { MeterGroup } from 'navigader/types';
import { PowerFrame288 } from 'navigader/util/data';
import { date } from 'navigader/util/formatters';


/** ============================ Types ===================================== */
type MeterGroupCardProps = {
  meterGroup: MeterGroup
};

/** ============================ Styles ==================================== */
const cardPadding = '1rem';
const useStyles = makeStylesHook<MeterGroupCardProps>(theme => ({
  card: (props) => ({
    cursor: isSufficientlyIngested(props.meterGroup) ? 'pointer' : 'default',
    marginBottom: theme.spacing(2),
    overflow: 'visible',
    position: 'relative'
  }),
  meterGroupChip: {
    left: cardPadding,
    marginTop: '-1rem',
    position: 'absolute',
    top: 0
  }
}), 'MeterGroupCard');

const useCardContentStyles = makeStylesHook(theme => ({
  progressBar: {
    margin: `${theme.spacing(2)}px 0`
  }
}), 'CardContent');

/** ============================ Components ================================ */
/**
 * If the meter group was recently uploaded and is still being ingested, we render a loading bar;
 * otherwise, we render the graph if we've loaded the group's average data; if for whatever reason
 * the meter group data was not loaded, we render a message saying as much
 */
export const CardContent: React.FC<MeterGroupCardProps> = ({ meterGroup }) => {
  const classes = useCardContentStyles();
  if (!isSufficientlyIngested(meterGroup)) {
    return (
      <Progress
        className={classes.progressBar}
        value={Math.max(meterGroup.progress.percent_complete, 3)}
      />
    );
  } else if (meterGroup.data.average) {
    return (
      <Frame288Graph
        axisLabel="Customer Load"
        data={new PowerFrame288(meterGroup.data.average).scale()}
        months="all"
      />
    );
  } else {
    return <Typography variant="subtitle1">Data unavailable</Typography>;
  }
};

export const MeterGroupCard: React.FC<MeterGroupCardProps> = (props) => {
  const { meterGroup } = props;
  const classes = useStyles(props);
  const history = useHistory();

  // Card behavior depends on if the meter group has finished ingesting
  const isIngested = isSufficientlyIngested(meterGroup);
  const { percent_complete } = meterGroup.progress;
  const onClick = isIngested ? viewMeterGroup : undefined;
  const statisticProps = isIngested
    ? { title: '# of Meters', value: meterGroup.meter_count }
    : { suffix: '%', title: 'Progress', value: percent_complete };

  const card = (
    <Card raised className={classes.card} onClick={onClick} padding={cardPadding}>
      <MeterGroupChip
        className={classes.meterGroupChip}
        meterGroup={meterGroup}
        onClick={onClick}
      />
      <CardContent meterGroup={meterGroup} />
      <Grid>
        <Grid.Item>
          <Statistic {...statisticProps} />
        </Grid.Item>
        <Grid.Item span={1} />
        <Grid.Item>
          <Statistic title="Uploaded" value={date.standard(meterGroup.created_at)} />
        </Grid.Item>
      </Grid>
    </Card>
  );

  const tooltipTitle = isIngested
    ? 'Click to see load data details'
    : `This file is being processed. It's currently ${percent_complete}% complete`;

  return <Tooltip title={tooltipTitle}>{card}</Tooltip>;

  /** ========================== Callbacks ================================= */
  function viewMeterGroup (event: React.MouseEvent<HTMLDivElement>) {
    // If the user clicks on the meter group chip, the event will propagate up to the card and this
    // method will be called again. Stopping the propagation prevents that second call
    event.stopPropagation();
    history.push(routes.meterGroup(meterGroup.id));
  }
};
