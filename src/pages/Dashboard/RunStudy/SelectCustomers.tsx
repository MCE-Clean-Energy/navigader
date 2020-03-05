import * as React from 'react';
import find from 'lodash/find';
import without from 'lodash/without';

import { Chip, Flex } from '@nav/shared/components';
import { getMeterGroupDisplayName, MeterGroup } from '@nav/shared/models/meter';
import { makeStylesHook } from '@nav/shared/styles';


/** ============================ Types ===================================== */
type SelectCustomersProps = {
  meterGroups: MeterGroup[] | null;
  selectedMeterGroupIds: string[];
  updateMeterGroups: (ids: string[]) => void;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  chipContainer: {
    '& > *': {
      margin: theme.spacing(0.5)
    }
  },
  meterCount: {
    marginBottom: theme.spacing(1),
    marginTop: 'auto',
    textAlign: 'right'
  }
}));

/** ============================ Components ================================ */
const SelectCustomers: React.FC<SelectCustomersProps> = (props) => {
  const { meterGroups, selectedMeterGroupIds, updateMeterGroups } = props;
  const classes = useStyles();
  if (meterGroups === null) return null;
  
  const selectedMeterCount = selectedMeterGroupIds.reduce((curCount, meterId) => {
    const meter = find(meterGroups, { id: meterId });
    return meter ? meter.numMeters + curCount : curCount;
  }, 0);
  
  return (
    <>
      <Flex.Container className={classes.chipContainer} justifyContent="center" wrap>
        {meterGroups.map((meterGroup) => {
          const selected = selectedMeterGroupIds.includes(meterGroup.id);
          return (
            <Chip
              color={selected ? 'primary' : 'secondary'}
              data-testid="meter-group-chip"
              icon={selected ? 'checkMark' : 'plus'}
              key={meterGroup.id}
              label={getMeterGroupDisplayName(meterGroup)}
              onClick={toggleMeterGroup.bind(null, meterGroup.id)}
            />
          );
        })}
      </Flex.Container>
      <div className={classes.meterCount}>
        Number of meters: {selectedMeterCount}
      </div>
    </>
  );
  
  /** ============================ Callbacks =============================== */
  function toggleMeterGroup (id: string) {
    updateMeterGroups(
      selectedMeterGroupIds.includes(id)
        ? without(selectedMeterGroupIds, id)
        : [...selectedMeterGroupIds, id]
    );
  }
};

/** ============================ Exports =================================== */
export default SelectCustomers;
