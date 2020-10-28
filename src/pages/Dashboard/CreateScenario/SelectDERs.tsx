import * as React from 'react';

import { Button, Grid } from 'navigader/components';
import { DerSelectionCard, DERSelection, CreateScenarioScreenProps } from './common';

/** ============================ Components ================================ */
export const SelectDERs: React.FC<CreateScenarioScreenProps> = (props) => {
  const { derConfigurations, derStrategies, state, updateState } = props;
  return (
    <Grid>
      <Grid.Item span={12}>
        {state.derSelections.map((selectedDer, index) => (
          <DerSelectionCard
            configurations={derConfigurations}
            delete={removeSelection.bind(null, index)}
            der={selectedDer}
            key={index}
            numDers={state.derSelections.length}
            strategies={derStrategies}
            update={(der: Partial<DERSelection>) => updateDer(index, der)}
          />
        ))}
      </Grid.Item>
      <Grid.Item span={12}>
        <Button color="secondary" icon="plus" onClick={addDer} size="small">
          Add DER
        </Button>
      </Grid.Item>
    </Grid>
  );

  /** ========================== Callbacks ================================= */
  function addDer() {
    updateDERSelections([...state.derSelections, {}]);
  }

  /**
   * Deletes the DER selection at the provided index
   *
   * @param {number} index: the array index of the DER to remove
   */
  function removeSelection(index: number) {
    updateDERSelections([
      ...state.derSelections.slice(0, index),
      ...state.derSelections.slice(index + 1),
    ]);
  }

  /**
   * Updates the attributes of a DER
   *
   * @param {number} index: the array index of the DER to update
   * @param {DERSelection} der: the new attributes of the DER
   */
  function updateDer(index: number, der: Partial<DERSelection>) {
    updateDERSelections([
      ...state.derSelections.slice(0, index),
      { ...state.derSelections[index], ...der },
      ...state.derSelections.slice(index + 1),
    ]);
  }

  function updateDERSelections(ders: Partial<DERSelection>[]) {
    updateState({ derSelections: ders });
  }
};
