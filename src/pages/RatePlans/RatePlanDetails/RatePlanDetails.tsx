import * as React from "react";
import { useParams } from "react-router-dom";
import _ from "navigader/util/lodash";
import {
  Grid,
  PageHeader,
  Fade,
  Progress,
  List,
  Typography,
} from "navigader/components";
import * as routes from "navigader/routes";
import { formatters } from "navigader/util";
import { useRatePlans } from "navigader/util/hooks";
import { RateCollection, RatePlan } from "navigader/types/cost";
import { RateCollectionView } from "./RateCollectionView";

/** ============================ Types ===================================== */
type RatePlanDetailProps = {};

/** ============================ Interfaces =================================*/
interface RatePlanDetailParamTypes {
  id: string;
}

/** ============================ Components ================================ */
export const RatePlanDetails: React.FC<RatePlanDetailProps> = () => {
  const [selectedCollectionIdx, setSelectedIdx] = React.useState<number>(0);
  const { id } = useParams<RatePlanDetailParamTypes>();
  let rpId: number = parseInt(id);
  const ratePlans = useRatePlans({
    include: "rate_collections.*",
    page: 1,
    page_size: 100,
  });
  const ratePlan: RatePlan | undefined = _.find(ratePlans, { id: rpId });
  const collections: RateCollection[] = ratePlan
    ? _.sortBy(ratePlan?.rate_collections, ["effective_date"]).reverse()
    : [];
  const selectedCollection: RateCollection | undefined = collections
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
          title={ratePlan ? ratePlan.name : ""}
        />
      </Grid.Item>
      {ratePlan ? (
        <>
          <Grid.Item span={3}>
            <Typography variant="h5">Rate Changes</Typography>
            <List>
              {_.sortBy(ratePlan?.rate_collections, ["effective_date"])
                .reverse()
                .map((rate_collection, idx) => (
                  <List.Item
                    selected={idx === selectedCollectionIdx}
                    key={rate_collection.id}
                    onClick={() => {
                      setSelectedIdx(idx);
                    }}
                  >
                    {formatters.date.standard(rate_collection.effective_date)}
                  </List.Item>
                ))}
            </List>
          </Grid.Item>
          <Grid.Item span={9}>
            {selectedCollection ? (
              <RateCollectionView rateCollection={selectedCollection} />
            ) : (
              ""
            )}
          </Grid.Item>
        </>
      ) : (
        <Fade in unmountOnExit>
          <Progress circular />
        </Fade>
      )}
    </Grid>
  );

  /** ========================== Callbacks ================================= */
};
