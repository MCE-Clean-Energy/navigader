import * as React from 'react';
import find from 'lodash/find';
import without from 'lodash/without';

import { Flex, MeterGroupChip, Tooltip, Typography } from '@nav/shared/components';
import { MeterGroup } from '@nav/shared/models/meter';
import { makeStylesHook } from '@nav/shared/styles';
import { formatters, math } from '@nav/shared/util';


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
  },
  meterGroupChip: {
    marginBottom: theme.spacing(2)
  }
}), 'SelectCustomers');

/** ============================ Components ================================ */
const SelectCustomers: React.FC<SelectCustomersProps> = (props) => {
  const { meterGroups, selectedMeterGroupIds, updateMeterGroups } = props;
  const classes = useStyles();
  if (meterGroups === null) return null;
  
  const selectedMeterCount = selectedMeterGroupIds.reduce((curCount, meterId) => {
    const meter = find(meterGroups, { id: meterId });
    return meter ? meter.meter_count + curCount : curCount;
  }, 0);
  
  return (
    <>
      <Flex.Container className={classes.chipContainer} justifyContent="center" wrap>
        {meterGroups.map((meterGroup) => {
          const selected = selectedMeterGroupIds.includes(meterGroup.id);
          const chip = (
            <MeterGroupChip
              className={classes.meterGroupChip}
              color={selected ? 'primary' : 'secondary'}
              icon={selected ? 'checkMark' : 'plus'}
              key={meterGroup.id}
              meterGroup={meterGroup}
              onClick={toggleMeterGroup.bind(null, meterGroup.id)}
            />
          );
          
          // Customer clusters are always selectable
          if (meterGroup.object_type === 'CustomerCluster') return chip;
          
          const { meter_count } = meterGroup;
          const { expected_meter_count } = meterGroup.metadata;
          
          // If origin files have sufficiently finished ingesting, they are selectable. We don't
          // require 100% completion in case a few meters fail to ingest.
          const sufficientlyFinishedPercent = 95;
          if (
            typeof expected_meter_count === 'number' &&
            math.percentOf(meter_count, expected_meter_count) > sufficientlyFinishedPercent
          ) return chip;
          
          // Otherwise we will render a tooltip explaining why the meter group is disabled
          const percentComplete = expected_meter_count === null
            ? '0%'
            : formatters.percentage(meter_count, expected_meter_count);
          
          const explanation = (
            <Typography variant="body2">
              This file has successfully uploaded but is still being processed. It is
              currently {percentComplete} complete. You can run a scenario with this file once it
              has finished processing.
            </Typography>
          );
          
          return (
            <Tooltip key={meterGroup.id} title={explanation}>
              {React.cloneElement(chip, { disabled: true })}
            </Tooltip>
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
