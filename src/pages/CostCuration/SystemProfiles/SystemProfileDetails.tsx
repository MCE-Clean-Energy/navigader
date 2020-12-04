import { DateTime } from 'luxon';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import {
  Grid,
  Typography,
  IntervalDataGraph,
  Progress,
  MonthSelectorExclusive,
  Centered,
} from 'navigader/components';
import { formatters, hooks } from 'navigader/util';
import { MonthIndex } from 'navigader/types';
import { makeStylesHook } from 'navigader/styles';

/** ============================ Styles ===================================== */
const useStyles = makeStylesHook(() => ({ chart: { padding: '1rem' } }), 'SystemProfileDetails');

/** ============================ Components ================================ */
export const SystemProfileDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const classes = useStyles();
  const { loading, systemProfile } = hooks.useSystemProfile(+id, { data_types: ['default'] });
  const [selectedMonth, setSelectedMonth] = React.useState<MonthIndex>(
    DateTime.local().month as MonthIndex
  );

  if (!systemProfile || loading) return <Progress />;

  return (
    <Grid>
      <Grid.Item span={12}>
        <Typography variant="h6">{systemProfile?.name || ''}</Typography>
      </Grid.Item>
      <Grid.Item span={12}>
        {systemProfile.data && systemProfile.data.default && (
          <Grid>
            <Grid.Item span={6}>
              <Centered>
                <Typography variant="h6">
                  Rate: {formatters.dollars(systemProfile?.resource_adequacy_rate)}/kW
                </Typography>
              </Centered>
            </Grid.Item>
            <Grid.Item span={6}>
              <MonthSelectorExclusive selected={selectedMonth} onChange={setSelectedMonth} />
            </Grid.Item>
            <Grid.Item span={12}>
              <IntervalDataGraph
                axisLabel="System Load"
                className={classes.chart}
                data={systemProfile.data.default}
                month={selectedMonth}
                units="kW"
              />
            </Grid.Item>
          </Grid>
        )}
      </Grid.Item>
    </Grid>
  );
};
