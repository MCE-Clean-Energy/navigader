import * as React from 'react';
import { useParams } from 'react-router-dom';

import { routes } from 'navigader/routes';
import {
  Grid,
  PageHeader,
  Typography,
  Card,
  IntervalDataGraph,
  Progress,
  MonthSelectorExclusive,
  Centered,
} from 'navigader/components';
import { AlertSnackbar } from 'navigader/components';
import { useSystemProfile } from 'navigader/util/hooks';
import { MonthIndex } from 'navigader/types';

/** ============================ Components ================================ */
export const SystemProfileDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { loading, systemProfile } = useSystemProfile(+id, { data_types: ['default'] });
  const [selectedMonth, setSelectedMonth] = React.useState<MonthIndex>(
    (new Date().getMonth() + 1) as MonthIndex
  );

  return (
    <Grid>
      {systemProfile && !loading ? (
        <>
          <Grid.Item span={12}>
            <PageHeader
              breadcrumbs={[
                ['System Profiles', routes.cost.system_profiles.base],
                ['Current System Profile', routes.cost.system_profiles.profile(id)],
              ]}
              title={systemProfile.name}
            />
          </Grid.Item>
          <Grid.Item span={12}>
            <Card>
              <Card.Content>
                {systemProfile.data && systemProfile.data.default && (
                  <Grid>
                    <Grid.Item span={6}>
                      <Centered>
                        <Typography variant="h6">
                          Rate: ${systemProfile?.resource_adequacy_rate}/kW
                        </Typography>
                      </Centered>
                    </Grid.Item>
                    <Grid.Item span={6}>
                      <MonthSelectorExclusive
                        selected={selectedMonth}
                        onChange={setSelectedMonth}
                      />
                    </Grid.Item>
                    <Grid.Item span={12}>
                      <IntervalDataGraph data={systemProfile.data.default} month={selectedMonth} />
                    </Grid.Item>
                  </Grid>
                )}
              </Card.Content>
            </Card>
          </Grid.Item>
        </>
      ) : (
        <Progress />
      )}
      <AlertSnackbar
        open={false}
        msg={<Typography>"Something went wrong"</Typography>}
        type="error"
      />
    </Grid>
  );
};
