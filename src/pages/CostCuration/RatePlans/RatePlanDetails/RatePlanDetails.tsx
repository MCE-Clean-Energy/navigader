import _ from 'lodash';
import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import * as api from 'navigader/api';
import { Grid, Progress, List, Typography, Flex, Button, Card } from 'navigader/components';
import { slices } from 'navigader/store';
import { RateCollection } from 'navigader/types';
import { formatters, hooks } from 'navigader/util';

import { CreateRateCollectionForm, FormErrorObject } from './CreateRateCollectionForm';
import { RateCollectionView } from './RateCollectionView';

/** ============================ Components ================================ */
export const RatePlanDetails: React.FC = () => {
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();

  // State
  const [createFormOpen, setCreateFormOpen] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrorObject>();
  const { loading, ratePlan } = hooks.useRatePlan(+id, { include: 'rate_collections.*' });

  const collections = _.sortBy(ratePlan?.rate_collections, 'effective_date').reverse();
  const [selectedCollection, setSelectedCollection] = React.useState<RateCollection>();

  React.useEffect(() => {
    setSelectedCollection((curr) => (curr && collections.includes(curr) ? curr : collections[0]));
  }, [collections]);

  if (loading) return <Progress />;

  return (
    <Grid>
      <Grid.Item span={3}>
        <Flex.Container>
          <Flex.Item grow>
            <Typography variant="h5">Rate Changes</Typography>
          </Flex.Item>
          <Flex.Item>
            <Button
              onClick={() => setCreateFormOpen((o) => !o)}
              icon={createFormOpen ? 'close' : 'plus'}
            />
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
                selectedCollection ? selectedCollection.id === rate_collection.id : idx === 0
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
          <RateCollectionView rateCollection={selectedCollection} onDelete={deleteRateCollection} />
        ) : (
          <Card>
            <Card.Content>
              <Typography variant="h5">No Rate Data</Typography>
            </Card.Content>
          </Card>
        )}
      </Grid.Item>
    </Grid>
  );

  /** ========================== Callbacks ================================= */
  function createRateCollection(params: api.CreateRateCollectionParams) {
    api.createRateCollection(params, (xhr) => {
      if (ratePlan && xhr.status === 201) {
        const rateCollection = JSON.parse(xhr.response).rate_collection;
        dispatch(
          slices.models.updateModel({
            ...ratePlan,
            rate_collections: [rateCollection].concat(ratePlan.rate_collections),
          })
        );
        setCreateFormOpen(false);
      } else {
        setErrors(JSON.parse(xhr.response));
      }
    });
  }

  async function deleteRateCollection(collectionId: RateCollection['id']) {
    const response = await api.deleteRateCollection(collectionId);

    if (ratePlan && response.ok) {
      dispatch(slices.models.removeModel(ratePlan));
      dispatch(
        slices.models.updateModel({
          ...ratePlan,
          rate_collections: _.without(collections, selectedCollection!),
        })
      );

      setSelectedCollection(collections[0]);
      dispatch(slices.ui.setMessage({ msg: 'Rate data deleted.', type: 'success' }));
    } else if (response.status === 403) {
      dispatch(
        slices.ui.setMessage({
          msg: 'You do not have permission to delete this rate data!',
          type: 'error',
        })
      );
    }
  }
};
