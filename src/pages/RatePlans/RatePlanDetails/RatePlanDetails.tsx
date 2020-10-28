import * as React from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";

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
import { slices } from "navigader/store";
import { RateCollection } from "navigader/types";
import { AlertSnackbar } from "navigader/components";

/** ============================ Components ================================ */
export const RatePlanDetails: React.FC = () => {
  const dispatch = useDispatch();
  let [createFormOpen, setCreateFormOpen] = React.useState(false);
  let [errors, setErrors] = React.useState<FormErrorObject>();
  const { id } = useParams<{ id: string }>();
  const { loading, ratePlan } = hooks.useRatePlan(+id, {
    include: "rate_collections.*",
  });
  const collections = _.sortBy(
    ratePlan?.rate_collections,
    "effective_date"
  ).reverse();
  let [selectedCollection, setSelectedCollection] = React.useState<
    RateCollection | undefined
  >(collections[0] || undefined);

  React.useEffect(() => {
    setSelectedCollection((curr) =>
      curr && collections.includes(curr) ? curr : collections[0]
    );
  }, [collections]);

  const createRateCollection = React.useCallback(
    (params: api.CreateRateCollectionParams) => {
      api.createRateCollection(params, (xhr) => {
        if (ratePlan && xhr.status === 201) {
          const rateCollection = JSON.parse(xhr.response).rate_collection;
          let updatedRatePlan = Object.assign({}, ratePlan, {
            rate_collections: [rateCollection].concat(
              ratePlan.rate_collections
            ),
          });
          dispatch(slices.models.updateModel(updatedRatePlan));
          setCreateFormOpen(false);
        } else {
          setErrors(JSON.parse(xhr.response));
        }
      });
    },
    [dispatch, ratePlan]
  );

  const deleteRateCollection = React.useCallback(
    async (collectionId: RateCollection["id"]) => {
      const response = await api.deleteRateCollection(collectionId);
      if (ratePlan && response.ok) {
        let updatedRatePlan = Object.assign({}, ratePlan, {
          rate_collections: _.without(collections, selectedCollection),
        });
        dispatch(slices.models.removeModel(ratePlan));
        dispatch(slices.models.updateModel(updatedRatePlan));
        setSelectedCollection(collections[0]);
      }
    },
    [dispatch, ratePlan, selectedCollection, collections]
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
      {!loading ? (
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
              {collections?.map((rate_collection, idx) => (
                <List.Item
                  selected={
                    selectedCollection
                      ? selectedCollection.id === rate_collection.id
                      : idx === 0
                  }
                  key={rate_collection.id}
                  onClick={() => setSelectedCollection(rate_collection)}
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
