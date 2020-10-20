import * as React from 'react';

import { useRouter } from 'navigader/routes';
import { isOriginFile, isScenario, MeterGroup } from 'navigader/types';
import { formatters, models, printWarning } from 'navigader/util';

import { Chip, ChipProps } from '../Chip';
import { ScenarioChip } from '../scenarios';
import { Tooltip } from '../Tooltip';


/** ============================ Types ===================================== */
type MeterGroupChipProps = Omit<ChipProps, 'label'> & {
  link?: boolean;
  meterGroup?: MeterGroup;
  showCount?: boolean;
  tooltipText?: React.ReactNode;
};

/** ============================ Components ================================ */
export const MeterGroupChip: React.FC<MeterGroupChipProps> = (props) => {
  const routeTo = useRouter();
  const {
    color = 'secondary',
    disabled,
    icon,
    link = false,
    meterGroup,
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

  if (link && props.onClick) {
    printWarning(`
      \`MeterGroupChip\` component received both \`link\` and \`onClick\` props. At most one should
      be provided.
    `);
  }

  const onClick = props.onClick || getLinkCb();

  if (!meterGroup) return null;
  if (isScenario(meterGroup)) {
    return (
      <ScenarioChip
        color={color}
        disabled={disabled}
        icon={icon}
        onClick={onClick}
        scenario={meterGroup}
        tooltipText={tooltipText}
      />
    );
  }

  const numMeterText = showCount
    ? `${meterGroup.meter_count} ${formatters.pluralize('meter', meterGroup.meter_count)}`
    : undefined;

  return (
    <Tooltip title={tooltipText || numMeterText}>
      <Chip
        color={disabled ? 'default' : color}
        data-testid="meter-group-chip"
        disabled={disabled}
        icon={icon}
        label={models.meterGroup.getDisplayName(meterGroup)}
        onClick={onClick}
        {...rest}
      />
    </Tooltip>
  );

  /** ============================ Helpers ================================= */
  /**
   * Returns a callback which can be used to link to the meter group's details page. The actual page
   * depends on what type of meter group we're dealing with.
   */
  function getLinkCb () {
    if (!link) return;

    // If the meter group is an origin file, we only enable viewing its details page if it has been
    // sufficiently ingested
    if (isOriginFile(meterGroup)) {
      const isIngested = models.meterGroup.isSufficientlyIngested(meterGroup);
      return isIngested ? routeTo.originFile(meterGroup) : undefined;
    }

    if (isScenario(meterGroup)) {
      return meterGroup.progress.is_complete ? routeTo.scenario.details(meterGroup) : undefined;
    }
  }
};
