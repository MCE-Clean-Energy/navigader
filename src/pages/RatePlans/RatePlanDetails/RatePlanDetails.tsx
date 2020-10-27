import * as React from "react";
import { useParams } from "react-router-dom";

import { routes } from "navigader/routes";
import _ from "navigader/util/lodash";
import {
  Grid,
  PageHeader,
  Fade,
  Progress,
  List,
  Typography,
  Flex,
  Button,
  Card,
} from "navigader/components";
import * as api from "navigader/api";
import { formatters, hooks } from "navigader/util";
import { RateCollectionView } from "./RateCollectionView";
import {
  CreateRateCollectionForm,
  FormErrorObject,
} from "./CreateRateCollectionForm";
import { useDispatch } from "react-redux";
import { slices } from "navigader/store";
import { RateCollection, RatePlan } from "navigader/types";
import { AlertSnackbar } from "navigader/components";

/** ============================ Components ================================ */
export const RatePlanDetails: React.FC = () => {
  const dispatch = useDispatch();
  let [selectedCollectionIdx, setSelectedIdx] = React.useState(0);
  let [createFormOpen, setCreateFormOpen] = React.useState(false);
  let [ratePlan, setRatePlan] = React.useState<RatePlan>();
  let [selectedCollection, setSelectedCollection] = React.useState<
    RateCollection | undefined
  >();
  let [collections, setCollections] = React.useState<RateCollection[]>([]);
  let [errors, setErrors] = React.useState<FormErrorObject>();

  const { id } = useParams<{ id: string }>();

  let ratePlans = hooks.useRatePlans({
    include: "rate_collections.*",
    page: 1,
    page_size: 100,
  });

  React.useEffect(() => {
    setRatePlan(_.find(ratePlans, { id: +id }));
  }, [id, setRatePlan, ratePlans]);

  React.useEffect(() => {
    setCollections(
      ratePlan
        ? _.sortBy(ratePlan.rate_collections, "effective_date").reverse()
        : []
    );
  }, [ratePlan]);

  React.useEffect(() => {
    setSelectedCollection(collections[selectedCollectionIdx]);
  }, [collections, selectedCollectionIdx]);

  const createRateCollection = React.useCallback(
    async (params: api.CreateRateCollectionParams) => {
      api.createRateCollection(params, (xhr) => {
        if (ratePlan && xhr.status === 201) {
          const rateCollection = JSON.parse(xhr.response).rate_collection;
          let updatedRatePlan = Object.assign({}, ratePlan, {
            rate_collections: [rateCollection].concat(collections),
          });
          dispatch(slices.models.updateModel(updatedRatePlan));
          setCreateFormOpen(false);
        } else {
          setErrors(JSON.parse(xhr.response));
        }
      });
    },
    [dispatch, ratePlan, collections]
  );

  const deleteRateCollection = React.useCallback(
    async (collectionId: string) => {
      const response = await api.deleteRateCollection(collectionId);
      if (ratePlan && response.status === 204) {
        let updatedRatePlan = Object.assign({}, ratePlan, {
          rate_collections: _.without(collections, selectedCollection),
        });
        dispatch(slices.models.removeModel(ratePlan));
        dispatch(slices.models.updateModel(updatedRatePlan));
        setSelectedIdx(0);
      }
    },
    [dispatch, ratePlan, collections, selectedCollection]
  );

  return (
    <Grid>
      <Grid.Item span={12}>
        <PageHeader
          breadcrumbs={[
            ["Rate Plans", routes.rates.base],
            ["Current Rate Plan", routes.rates.ratePlan(id)],
          ]}
          title={ratePlan?.name || ""}
        />
      </Grid.Item>
      {ratePlan ? (
        <>
          <Grid.Item span={3}>
            <Flex.Container>
              <Flex.Item grow>
                <Typography variant="h5">Rate Changes</Typography>
              </Flex.Item>
              <Flex.Item>
                <Button
                  onClick={() => {
                    setCreateFormOpen((o) => !o);
                  }}
                  icon={createFormOpen ? "close" : "plus"}
                ></Button>
              </Flex.Item>
            </Flex.Container>
            <CreateRateCollectionForm
              open={createFormOpen}
              onSubmit={createRateCollection}
              errors={errors}
            />
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
            {selectedCollection && selectedCollection.rate_data ? (
              <RateCollectionView
                rateCollection={selectedCollection}
                onDelete={deleteRateCollection}
              />
            ) : (
              <Card>
                <Card.Content>
                  <Typography variant="h5">No Rate Data</Typography>
                </Card.Content>
              </Card>
            )}
          </Grid.Item>
        </>
      ) : (
        <Fade in unmountOnExit>
          <Progress circular />
        </Fade>
      )}
      <AlertSnackbar
        open={errors !== undefined}
        msg={<Typography>"Something went wrong"</Typography>}
        type="error"
      />
    </Grid>
  );
};
