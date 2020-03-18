import * as React from 'react';

import { Chip } from '@nav/shared/components';
import { getMeterGroupDisplayName, MeterGroup } from '@nav/shared/models/meter';


/** ============================ Types ===================================== */
type CustomerChipProps = {
  meterGroup: MeterGroup;
  selected: boolean;
  onClick?: (id: string) => void;
};

/** ============================ Components ================================ */
export const CustomerChip: React.FC<CustomerChipProps> = (props) => {
  const { meterGroup, selected, onClick } = props;
  return (
    <Chip
      color={selected ? 'primary' : 'secondary'}
      data-testid="meter-group-chip"
      icon={selected ? 'checkMark' : 'plus'}
      label={getMeterGroupDisplayName(meterGroup)}
      onClick={onClick ? onClick.bind(null, meterGroup.id) : undefined}
    />
  );
};
