import * as React from "react";
import {
  Card,
  Icon,
  Fade,
  Link,
  Progress,
  Table,
  PrefetchedTable,
  Typography,
  Grid,
  Divider,
  Flex,
} from "navigader/components";
import { formatters } from "navigader/util";
import { RateCollection, RateBucket, } from "navigader/types/cost";

/** ============================ Types ===================================== */
type RateCollectionViewsProps = {
  rateCollection: RateCollection;
};

type RateBucketViewProps = {
  bucket: RateBucket;
  demand: boolean;
  idx: number;
  unit?: string;
};

/** ============================ Components ================================ */
export const RateBucketView: React.FC<RateBucketViewProps> = (props) => {
  const { bucket, demand, unit, idx } = props;
  const components = demand
    ? bucket.demandRateTiers
    : bucket.energyRateTiers;

  return (
    <>
      {components?.map((component, index) => (
        <Flex.Container key={`${idx}-${index}`}>
          <Flex.Item grow>
            ${component.rate} / {component.unit || unit}
          </Flex.Item>
          {typeof component.max !== 'undefined' && <Flex.Item grow>Max: {component.max}</Flex.Item>}
          {typeof component.adj !== 'undefined' && <Flex.Item grow>Adj: {component.adj}</Flex.Item>}
          {typeof component.sell !== 'undefined' && <Flex.Item grow>Sell: {component.sell}</Flex.Item>}
        </Flex.Container>
      ))}
    </>
  );
};

export const RateCollectionView: React.FC<RateCollectionViewsProps> = ({
  rateCollection,
}) => {
  return (
    <Card raised>
      <Typography useDiv variant="h6">
        Rate Data for {formatters.date.standard(rateCollection.effective_date)}
      </Typography>
      {rateCollection ? (
        <PrefetchedTable data={[]} hover={false} size="small">
          {() => (
              <Table.Body>
                <Table.Row>
                  <Table.Cell>Rate Name</Table.Cell>
                  <Table.Cell>{rateCollection.rate_data.rateName}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Sector</Table.Cell>
                  <Table.Cell>{rateCollection.rate_data.sector}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Approved</Table.Cell>
                  <Table.Cell>
                    {
                      rateCollection.rate_data.approved
                        ? <Icon name={"checkMark"} />
                        : null
                    }
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Source Reference</Table.Cell>
                  <Table.Cell>
                    <Link.NewTab to={rateCollection.utility_url} useAnchor>
                      {formatters.truncateAtLength(rateCollection.utility_url, 50)}
                    </Link.NewTab>
                  </Table.Cell>
                </Table.Row>

                {rateCollection.rate_data.energyRateStrux && (
                  <Table.Row>
                    <Table.Cell>Energy Rate Structure</Table.Cell>
                    <Table.Cell>
                      {rateCollection.rate_data.energyRateStrux.map(
                        (bucket, idx, arr) => (
                          <Grid key={idx}>
                            <Grid.Item span={5}>
                              {
                                rateCollection.rate_data.energyKeyVals
                                  ? rateCollection.rate_data.energyKeyVals[idx].key
                                  : null
                              }
                            </Grid.Item>
                            <Grid.Item span={7}>
                              <RateBucketView
                                bucket={bucket}
                                demand={false}
                                idx={idx}
                              />
                              {idx < arr.length - 1 ? <Divider /> : ""}
                            </Grid.Item>
                          </Grid>
                        )
                      )}
                    </Table.Cell>
                  </Table.Row>
                )}

                {rateCollection.rate_data.demandRateStrux && (
                  <Table.Row>
                    <Table.Cell>Demand Rate Structure</Table.Cell>
                    <Table.Cell>
                      {rateCollection.rate_data.demandRateStrux.map(
                        (bucket, idx, arr) => (
                          <Grid key={idx}>
                            <Grid.Item span={5}>
                              {
                                rateCollection.rate_data.energyKeyVals
                                  ? rateCollection.rate_data.energyKeyVals[idx].key
                                  : null
                              }
                            </Grid.Item>
                            <Grid.Item span={7}>
                              <RateBucketView
                                bucket={bucket}
                                demand={true}
                                unit={rateCollection.rate_data.demandRateUnits}
                                idx={idx}
                              />
                              {idx < arr.length - 1 ? <Divider /> : ""}
                            </Grid.Item>
                          </Grid>
                        )
                      )}
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
          )}
        </PrefetchedTable>
      ) : (
        <Fade in unmountOnExit>
          <Progress circular />
        </Fade>
      )}
    </Card>
  );
};
