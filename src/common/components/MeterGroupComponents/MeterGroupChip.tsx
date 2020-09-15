import * as React from 'react';

import { MeterGroup } from 'navigader/types';
import { formatters, models, printWarning } from 'navigader/util';

import { Chip, ChipProps } from '../Chip';
import { Tooltip } from '../Tooltip';


/** ============================ Types ===================================== */
type MeterGroupChipProps = Omit<ChipProps, 'label'> & {
  className?: string;
  meterGroup?: MeterGroup;
  showCount?: boolean;
  tooltipText?: React.ReactNode;
};

/** ============================ Components ================================ */
export const MeterGroupChip: React.FC<MeterGroupChipProps> = (props) => {
  const {
    color = 'secondary',
    disabled,
    icon,
    meterGroup,
    onClick,
    showCount = false,
    tooltipText,
    ...rest
  } = props;

  // Validate props
  if (tooltipText && showCount) {
    printWarning(`
      \`MeterGroupChip\` component received both \`showCount\` and \`tooltipText\` props. At most
      one should be provided.
    `);
  }

  if (!meterGroup) return null;

  const chip = (
    <Chip
      color={disabled ? 'default' : color}
      data-testid="meter-group-chip"
      disabled={disabled}
      icon={icon}
      label={models.meterGroup.getDisplayName(meterGroup)}
      onClick={onClick}
      {...rest}
    />
  );

  // Render a tooltip if either `showCount` or `tooltipText` was provided
  if (!showCount && !tooltipText) return chip;

  const { meter_count } = meterGroup;
  const numMeterText = `${meter_count} ${formatters.pluralize('meter', meter_count)}`;
  const text = tooltipText || numMeterText;
  return <Tooltip title={text}>{chip}</Tooltip>;
};
