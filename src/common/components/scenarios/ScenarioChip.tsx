import * as React from 'react';

import { makeStylesHook } from 'navigader/styles';
import { Maybe, Scenario } from 'navigader/types';
import { hooks } from 'navigader/util';
import { pluralize } from 'navigader/util/formatters';
import { Chip, ChipProps } from '../Chip';
import { getDERIconName } from '../ders';
import { Grid } from '../Grid';
import { ValidIcon } from '../Icon';
import { Popover } from '../Popover';
import { Tooltip } from '../Tooltip';
import { Typography } from '../Typography';


/** ============================ Types ===================================== */
type ScenarioChipProps = Omit<ChipProps, 'label'> & {
  className?: string;
  scenario: Scenario;
  tooltipText?: React.ReactNode;
};

type DERSectionProps = {
  field: string;
  value: string;
};

/** ============================ Styles ==================================== */
const useDERSectionStyles = makeStylesHook((theme) => ({
  gridRow: {
    padding: `${theme.spacing(1, 2)} !important`
  }
}), 'DERSection');

const useDetailsBoxStyles = makeStylesHook(theme => ({
  meterGroup: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1, 2)
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
    <>
      <Grid.Item className={classes.gridRow} span={3}>
        <Typography emphasis="bold" useDiv variant="body2">
          {field}
        </Typography>
      </Grid.Item>

      <Grid.Item className={classes.gridRow} span={9}>
        <Typography useDiv variant="body2">
          {value}
        </Typography>
      </Grid.Item>
    </>
  );
};

const DetailsBox: React.FC<{ scenario: Scenario }> = ({ scenario }) => {
  const { der, meter_count, meter_group } = scenario;
  const classes = useDetailsBoxStyles();

  if (!der) return null;
  return (
    <>
      <div className={classes.meterGroup}>
        <Typography emphasis="bold" variant="body2">
          {meter_group?.name} ({meter_count} {pluralize('meter', meter_count)})
        </Typography>
      </div>

      <Grid noMargin>
        <DERSection field="DER Type" value={der.der_strategy.der_type} />
        <DERSection field="Configuration" value={der.der_configuration.name} />
        <DERSection field="Strategy" value={der.der_strategy.name} />
      </Grid>
    </>
  );
};

export const ScenarioChip: React.FC<ScenarioChipProps> = (props) => {
  const {
    color = 'secondary',
    disabled,
    icon,
    scenario: scenarioProp,
    onClick,
    tooltipText,
    ...rest
  } = props;

  const classes = useStyles();

  // If the scenario doesn't have its DER info loaded yet, fetch it
  const { scenario: scenarioWithDER } =
    hooks.useScenario(scenarioProp.id, { include: ['ders', 'meter_group.*'] });
  const scenario = scenarioWithDER || scenarioProp;

  // Resolve the icon
  let chipIcon: Maybe<ValidIcon>;
  if (icon) {
    chipIcon = icon;
  } else if (scenario.der) {
    const { der_type } = scenario.der.der_configuration;
    chipIcon = getDERIconName(der_type);
  }

  const chip = (
    <Tooltip title={tooltipText}>
      <Chip
        color={disabled ? 'default' : color}
        data-testid="scenario-chip"
        disabled={disabled}
        icon={chipIcon}
        label={scenario.name}
        onClick={onClick}
        {...rest}
      />
    </Tooltip>
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

  return chip;
};
