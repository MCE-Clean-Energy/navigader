import * as React from 'react';

import { makeStylesHook } from 'navigader/styles';
import { Maybe, Scenario } from 'navigader/types';
import { printWarning } from 'navigader/util';
import { pluralize } from 'navigader/util/formatters';
import { Chip, ChipProps } from '../Chip';
import { getDERIconName } from '../ders';
import { ValidIcon } from '../Icon';
import { Popover } from '../Popover';
import { Tooltip } from '../Tooltip';
import { Typography } from '../Typography';


/** ============================ Types ===================================== */
type ScenarioChipProps = Omit<ChipProps, 'label'> & {
  className?: string;
  scenario: Scenario;
  showCount?: boolean;
  tooltipText?: React.ReactNode;
};

type DERSectionProps = {
  field: string;
  value: string;
};

/** ============================ Styles ==================================== */
const useDERSectionStyles = makeStylesHook((theme) => ({
  container: {
    margin: theme.spacing(1, 0)
  }
}), 'DERSection');

const useDetailsBoxStyles = makeStylesHook(theme => ({
  detailsBox: {
    '& > *': {
      padding: theme.spacing(1, 2)
    }
  },
  meterGroup: {
    borderBottom: `1px solid ${theme.palette.divider}`
  }
}), 'DetailsBox');

const useStyles = makeStylesHook(() => ({
  hover: {
    maxWidth: 500,
    padding: 0
  }
}), 'ScenarioChip');

/** ============================ Components ================================ */
const DERSection: React.FC<DERSectionProps> = ({ field, value }) => {
  const classes = useDERSectionStyles();
  return (
    <div className={classes.container}>
      <Typography emphasis="bold" useDiv variant="body2">
        {field}
      </Typography>

      <Typography useDiv variant="body2">
        {value}
      </Typography>
    </div>
  );
};

const DetailsBox: React.FC<{ scenario: Scenario }> = ({ scenario }) => {
  const { der, meter_count, meter_group } = scenario;
  const classes = useDetailsBoxStyles();

  if (!der) return null;
  return (
    <div className={classes.detailsBox}>
      <div className={classes.meterGroup}>
        <Typography emphasis="bold" variant="body2">
          {meter_group?.name} ({meter_count} {pluralize('meter', meter_count)})
        </Typography>
      </div>
      <div>
        <DERSection field="DER Type" value={der.der_strategy.der_type} />
        <DERSection field="Configuration" value={der.der_configuration.name} />
        <DERSection field="Strategy" value={der.der_strategy.name} />
      </div>
    </div>
  );
};

export const ScenarioChip: React.FC<ScenarioChipProps> = (props) => {
  const {
    color = 'secondary',
    disabled,
    icon,
    scenario,
    onClick,
    showCount = false,
    tooltipText,
    ...rest
  } = props;

  const classes = useStyles();

  // Validate props
  if (tooltipText && showCount) {
    printWarning(`
      \`ScenarioChip\` component received both \`showCount\` and \`tooltipText\` props. At most
      one should be provided.
    `);
  }

  // Resolve the icon
  let chipIcon: Maybe<ValidIcon>;
  if (icon) {
    chipIcon = icon;
  } else if (scenario.der) {
    const { der_type } = scenario.der.der_configuration;
    chipIcon = getDERIconName(der_type);
  }

  const chip = (
    <Chip
      color={disabled ? 'default' : color}
      data-testid="scenario-chip"
      disabled={disabled}
      icon={chipIcon}
      label={scenario.name}
      onClick={onClick}
      {...rest}
    />
  );

  // If we have DER config/strategy info, render it in a `Hover`
  if (scenario.der) {
    return (
      <Popover
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        className={classes.hover}
        HoverComponent={<DetailsBox scenario={scenario} />}
      >
        {chip}
      </Popover>
    );
  }

  if (!tooltipText && !showCount) return chip;

  const numMeterText = `${scenario.meter_count} ${pluralize('meter', scenario.meter_count)}`;
  const text = tooltipText || numMeterText;
  return <Tooltip title={text}>{chip}</Tooltip>;
};
