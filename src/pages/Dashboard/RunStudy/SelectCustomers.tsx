import * as React from 'react';
import find from 'lodash/find';
import without from 'lodash/without';

import { Flex } from '@nav/shared/components';
import { MeterGroup } from '@nav/shared/models/meter';
import { makeStylesHook } from '@nav/shared/styles';
import { CustomerChip } from './shared';


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
            <CustomerChip
              key={meterGroup.id}
              meterGroup={meterGroup}
              selected={selected}
              onClick={toggleMeterGroup}
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
