import * as React from "react";
import { useParams } from "react-router-dom";

import { Grid, PageHeader, Fade, Progress, List, Typography } from "navigader/components";
import * as routes from "navigader/routes";
import { formatters, hooks } from "navigader/util";
import _ from "navigader/util/lodash";
import { RateCollectionView } from "./RateCollectionView";


/** ============================ Components ================================ */
export const RatePlanDetails: React.FC = () => {
  const [selectedCollectionIdx, setSelectedIdx] = React.useState(0);
  const { id } = useParams<{ id: string }>();
  const ratePlans = hooks.useRatePlans({
    include: "rate_collections.*",
    page: 1,
    page_size: 100,
  });

  const ratePlan = _.find(ratePlans, { id: +id });
  const collections = ratePlan
    ? _.sortBy(ratePlan.rate_collections, 'effective_date').reverse()
    : [];
  const selectedCollection = collections
    ? collections[selectedCollectionIdx]
    : undefined;

  return (
    <Grid>
      <Grid.Item span={12}>
        <PageHeader
          breadcrumbs={[
            ["Rate Plans", routes.rates.base],
            ["Current Rate Plan", routes.rates.ratePlan(id)],
          ]}
          title={ratePlan?.name || ''}
        />
      </Grid.Item>
      {ratePlan ? (
        <>
          <Grid.Item span={3}>
            <Typography variant="h5">Rate Changes</Typography>
            <List>
              {collections.map((rate_collection, idx) => (
                <List.Item
                  selected={idx === selectedCollectionIdx}
                  key={rate_collection.id}
                  onClick={() => setSelectedIdx(idx)}
                >
                  {formatters.date.standard(rate_collection.effective_date)}
                </List.Item>
              ))}
            </List>
          </Grid.Item>
          <Grid.Item span={9}>
            {selectedCollection && <RateCollectionView rateCollection={selectedCollection} />}
          </Grid.Item>
        </>
      ) : (
        <Fade in unmountOnExit>
          <Progress circular />
        </Fade>
      )}
    </Grid>
  );
};
