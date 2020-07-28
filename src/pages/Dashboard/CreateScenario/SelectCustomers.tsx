import * as React from 'react';

import { Flex, MeterGroupChip } from 'navigader/components';
import { isSufficientlyIngested } from 'navigader/models/meter';
import { makeStylesHook } from 'navigader/styles';
import { MeterGroup, OriginFileMeterGroup } from 'navigader/types';
import { percentage } from 'navigader/util/formatters';
import _ from 'navigader/util/lodash';


/** ============================ Types ===================================== */
type SelectCustomersProps = {
  meterGroups: MeterGroup[] | null;
  selectedMeterGroupIds: string[];
  updateMeterGroups: (ids: string[]) => void;
};

type CustomerChipProps = {
  meterGroup: MeterGroup;
  onClick: () => void;
  selected: boolean;
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
}), 'SelectCustomers');

const useCustomerChipStyles = makeStylesHook(theme => ({
  meterGroupChip: {
    marginBottom: theme.spacing(2)
  }
}), 'CustomerChip');

/** ============================ Components ================================ */
const CustomerChip: React.FC<CustomerChipProps> = ({ meterGroup, onClick, selected }) => {
  const classes = useCustomerChipStyles();
  const { meter_count } = meterGroup;
  const { expected_meter_count } = (meterGroup as OriginFileMeterGroup).metadata;

  if (isSufficientlyIngested(meterGroup)) {
    return (
      <MeterGroupChip
        className={classes.meterGroupChip}
        color={selected ? 'primary' : 'secondary'}
        icon={selected ? 'checkMark' : 'plus'}
        meterGroup={meterGroup}
        onClick={onClick}
        showCount
      />
    );
  }

  // If the meter group can not yet be run in a scenario, disable the chip and render a tooltip
  // explaining why
  const percentComplete = expected_meter_count === null
    ? '0%'
    : percentage(meter_count, expected_meter_count);

  return (
    <MeterGroupChip
      className={classes.meterGroupChip}
      disabled
      meterGroup={meterGroup}
      tooltipText={`
        This file has successfully uploaded but is still being processed. It is currently
        ${percentComplete} complete. You can run a scenario with this file once it has
        finished processing.
      `}
    />
  );
};

export const SelectCustomers: React.FC<SelectCustomersProps> = (props) => {
  const { meterGroups, selectedMeterGroupIds, updateMeterGroups } = props;
  const classes = useStyles();
  if (meterGroups === null) return null;

  const selectedMeterCount = selectedMeterGroupIds.reduce((curCount, meterId) => {
    const meter = _.find(meterGroups, { id: meterId });
    return meter ? meter.meter_count + curCount : curCount;
  }, 0);

  return (
    <>
      <Flex.Container className={classes.chipContainer} justifyContent="center" wrap>
        {meterGroups.map(meterGroup =>
          <CustomerChip
            key={meterGroup.id}
            meterGroup={meterGroup}
            onClick={toggleMeterGroup.bind(null, meterGroup.id)}
            selected={selectedMeterGroupIds.includes(meterGroup.id)}
          />
        )}
      </Flex.Container>
      <div className={classes.meterCount}>
        Number of meters: {selectedMeterCount}
      </div>
    </>
  );

  /** ========================== Callbacks ================================= */
  function toggleMeterGroup (id: string) {
    updateMeterGroups(
      selectedMeterGroupIds.includes(id)
        ? _.without(selectedMeterGroupIds, id)
        : [...selectedMeterGroupIds, id]
    );
  }
};
