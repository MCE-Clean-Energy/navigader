import * as React from 'react';

import {
  Card, Grid, Frame288Graph, Statistic, MeterGroupChip, Progress, Typography, Tooltip
} from 'navigader/components';
import { useRouter } from 'navigader/routes';
import { makeStylesHook } from 'navigader/styles';
import { OriginFile } from 'navigader/types';
import { formatters, models, PowerFrame288 } from 'navigader/util';


/** ============================ Types ===================================== */
type MeterGroupCardProps = {
  originFile: OriginFile
};

/** ============================ Styles ==================================== */
const cardPadding = '1rem';
const useStyles = makeStylesHook<MeterGroupCardProps>(theme => ({
  card: (props) => ({
    cursor: models.meterGroup.isSufficientlyIngested(props.originFile) ? 'pointer' : 'default',
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
export const CardContent: React.FC<MeterGroupCardProps> = ({ originFile }) => {
  const classes = useCardContentStyles();
  if (!models.meterGroup.isSufficientlyIngested(originFile)) {
    return (
      <Progress
        className={classes.progressBar}
        value={Math.max(originFile.progress.percent_complete, 3)}
      />
    );
  } else if (originFile.data.average) {
    return (
      <Frame288Graph
        axisLabel="Customer Load"
        data={new PowerFrame288(originFile.data.average).scale()}
        months="all"
      />
    );
  } else {
    return <Typography variant="subtitle1">Data unavailable</Typography>;
  }
};

export const MeterGroupCard: React.FC<MeterGroupCardProps> = (props) => {
  const { originFile } = props;
  const classes = useStyles(props);
  const routeTo = useRouter();

  // Card behavior depends on if the meter group has finished ingesting
  const isIngested = models.meterGroup.isSufficientlyIngested(originFile);
  const { percent_complete } = originFile.progress;
  const statisticProps = isIngested
    ? { title: '# of Meters', value: originFile.meter_count }
    : { title: 'Progress', value: percent_complete + '%' };

  const card = (
    <Card
      raised
      className={classes.card}
      onClick={routeTo.originFile(originFile)}
      padding={cardPadding}
    >
      <MeterGroupChip className={classes.meterGroupChip} link meterGroup={originFile} />
      <CardContent originFile={originFile} />
      <Grid>
        <Grid.Item>
          <Statistic {...statisticProps} />
        </Grid.Item>
        <Grid.Item span={1} />
        <Grid.Item>
          <Statistic title="Uploaded" value={formatters.date.standard(originFile.created_at)} />
        </Grid.Item>
      </Grid>
    </Card>
  );

  const tooltipTitle = isIngested
    ? 'Click to see load data details'
    : `This file is being processed. It's currently ${percent_complete}% complete`;

  return <Tooltip title={tooltipTitle}>{card}</Tooltip>;
};
