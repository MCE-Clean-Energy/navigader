import * as React from 'react';

import { Button, Card, Flex, Select } from '@nav/shared/components';
import { BatteryConfiguration, BatteryStrategy } from '@nav/shared/models/der';
import { makeStylesHook } from '@nav/shared/styles';
import { DERSelection } from '../util';
import { ProgramOptions } from './ProgramOptions';


/** ============================ Types ===================================== */
type SelectDERsProps = {
  derConfigurations?: BatteryConfiguration[];
  derStrategies?: BatteryStrategy[];
  selectedDers: Partial<DERSelection>[];
  updateDerSelections: (ders: Partial<DERSelection>[]) => void;
};

type DERCardProps = {
  configurations?: BatteryConfiguration[];
  delete: () => void;
  der: Partial<DERSelection>;
  numDers: number;
  strategies?: BatteryStrategy[];
  update: (der: Partial<DERSelection>) => void;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook<DERCardProps>(theme => ({
  derCard: {
    marginBottom: theme.spacing(2)
  },
  flexContainer: {
    '& > *': {
      marginRight: theme.spacing(2)
    }
  },
  deleteIcon: (props) => ({
    // When there is only 1 DER in the list, don't make the icon invisible and un-clickable
    cursor: props.numDers > 1 ? 'pointer' : 'default',
    ...theme.mixins.transition(
      'opacity',
      props.numDers > 1,
      [1, 0]
    )
  }),
  deleteIconContainer: {
    marginRight: 0,
    marginLeft: 'auto',
  },
  typeSelect: {
    width: 200
  }
}));

/** ============================ Components ================================ */
const DERCard: React.FC<DERCardProps> = (props) => {
  const classes = useStyles(props);
  
  return (
    <Card className={classes.derCard} raised>
      <Flex.Container className={classes.flexContainer}>
        <Flex.Item>
          <Select
            className={classes.typeSelect}
            label="DER Type"
            onChange={updateType}
            options={['Battery', 'Solar Panel']}
            value={props.der.type}
          />
        </Flex.Item>
        
        <ProgramOptions {...props} />
        
        <Flex.Item className={classes.deleteIconContainer}>
          <Button className={classes.deleteIcon} icon="trash" onClick={deleteDer} />
        </Flex.Item>
      </Flex.Container>
    </Card>
  );
  
  /** ============================ Callbacks =============================== */
  /**
   * Updates the DER's type. Additionally resets the configuration and strategy when the type
   * changes
   *
   * @param {DerType} type: the DER's new type
   */
  function updateType (type: DERSelection['type']) {
    props.update({
      configurationId: undefined,
      strategyId: undefined,
      type
    });
  }
  
  /**
   * Removes the DER configuration from the list of selected DERs. Doesn't allow deleting the
   * last DER selection
   */
  function deleteDer () {
    if (props.numDers === 1) return;
    props.delete();
  }
};

const SelectDERs: React.FC<SelectDERsProps> = (props) => {
  const { derConfigurations, derStrategies, selectedDers, updateDerSelections } = props;
  return (
    <div>
      {selectedDers.map((selectedDer, index) =>
        <DERCard
          configurations={derConfigurations}
          delete={removeSelection.bind(null, index)}
          der={selectedDer}
          key={index}
          numDers={selectedDers.length}
          strategies={derStrategies}
          update={(der: Partial<DERSelection>) => updateDer(index, der)}
        />
      )}
      <Button color="secondary" icon="plus" onClick={addDer} size="small">Add DER</Button>
    </div>
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
