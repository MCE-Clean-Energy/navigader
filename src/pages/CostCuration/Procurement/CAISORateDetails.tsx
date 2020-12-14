import { DateTime } from 'luxon';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import * as api from 'navigader/api';
import {
  Grid,
  Typography,
  IntervalDataGraph,
  MonthSelectorExclusive,
  Centered,
  Button,
} from 'navigader/components';
import { hooks } from 'navigader/util';
import { CAISORate, MonthIndex } from 'navigader/types';
import { makeStylesHook } from 'navigader/styles';

/** ============================ Styles ===================================== */
const useStyles = makeStylesHook(
  () => ({ chart: { padding: '1rem' }, download_btn: { float: 'right' } }),
  'CAISORateDetails'
);

/** ============================ Components ================================ */
export const CAISORateDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const classes = useStyles();
  const { caisoRate, loading } = hooks.useCAISORate(+id, { data_types: ['default'] });
  const [selectedMonth, setSelectedMonth] = React.useState<MonthIndex>(
    DateTime.local().month as MonthIndex
  );

  return (
    <Grid>
      <Grid.Item span={6}>
        <Typography variant="h6">{caisoRate?.name || ''}</Typography>
      </Grid.Item>
      <Grid.Item span={6}>
        <Button
          icon="download"
          color="primary"
          className={classes.download_btn}
          onClick={() => clickDownload(caisoRate)}
        >
          Download
        </Button>
      </Grid.Item>
      <Grid.Item span={12}>
        {caisoRate && !loading && (
          <Grid>
            <Grid.Item span={12}>
              <Centered>
                <MonthSelectorExclusive selected={selectedMonth} onChange={setSelectedMonth} />
              </Centered>
            </Grid.Item>
            <Grid.Item span={12}>
              <IntervalDataGraph
                axisLabel="Procurement Cost"
                className={classes.chart}
                data={caisoRate.data.default}
                month={selectedMonth}
                units="$"
              />
            </Grid.Item>
          </Grid>
        )}
      </Grid.Item>
    </Grid>
  );

  /* =============================== Callbacks ==============================*/
  async function clickDownload(caisoRate: CAISORate) {
    api.downloadCAISORate(caisoRate.id);
  }
};
