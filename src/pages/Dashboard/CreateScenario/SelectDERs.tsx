import * as React from 'react';

import { Button, Grid } from 'navigader/components';
import { BatteryConfiguration, BatteryStrategy } from 'navigader/models/der';
import { DerSelectionCard, DERSelection } from './common';


/** ============================ Types ===================================== */
type SelectDERsProps = {
  derConfigurations?: BatteryConfiguration[];
  derStrategies?: BatteryStrategy[];
  selectedDers: Partial<DERSelection>[];
  updateDerSelections: (ders: Partial<DERSelection>[]) => void;
};

/** ============================ Components ================================ */
const SelectDERs: React.FC<SelectDERsProps> = (props) => {
  const { derConfigurations, derStrategies, selectedDers, updateDerSelections } = props;
  return (
    <Grid>
      <Grid.Item span={12}>
        {selectedDers.map((selectedDer, index) =>
          <DerSelectionCard
            configurations={derConfigurations}
            delete={removeSelection.bind(null, index)}
            der={selectedDer}
            key={index}
            numDers={selectedDers.length}
            strategies={derStrategies}
            update={(der: Partial<DERSelection>) => updateDer(index, der)}
          />
        )}
      </Grid.Item>
      <Grid.Item span={12}>
        <Button color="secondary" icon="plus" onClick={addDer} size="small">Add DER</Button>
      </Grid.Item>
    </Grid>
  );
  
  /** ============================ Callbacks =============================== */
  function addDer () {
    updateDerSelections([...selectedDers, {}]);
  }
  
  /**
   * Deletes the DER selection at the provided index
   *
   * @param {number} index: the array index of the DER to remove
   */
  function removeSelection (index: number) {
    updateDerSelections([
      ...selectedDers.slice(0, index),
      ...selectedDers.slice(index + 1)
    ]);
  }
  
  /**
   * Updates the attributes of a DER
   *
   * @param {number} index: the array index of the DER to update
   * @param {DERSelection} der: the new attributes of the DER
   */
  function updateDer (index: number, der: Partial<DERSelection>) {
    updateDerSelections([
      ...selectedDers.slice(0, index),
      { ...selectedDers[index], ...der },
      ...selectedDers.slice(index + 1)
    ]);
  }
};

/** ============================ Exports =================================== */
export default SelectDERs;
