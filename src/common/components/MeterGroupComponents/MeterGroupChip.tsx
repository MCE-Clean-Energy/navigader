import * as React from 'react';

import { usePushRouter } from 'navigader/routes';
import { makeStylesHook } from 'navigader/styles';
import { isOriginFile, isScenario, Maybe, MeterGroup, OriginFile, Scenario } from 'navigader/types';
import { formatters, models, printWarning } from 'navigader/util';

import { Alert } from '../Alert';
import { Chip, ChipProps } from '../Chip';
import { getDERIconName } from '../ders';
import { Grid } from '../Grid';
import { ValidIcon } from '../Icon';
import { Popover } from '../Popover';
import { Typography } from '../Typography';
import { SummaryTable } from './SummaryTable';

/** ============================ Types ===================================== */
type MeterGroupChipProps = Omit<ChipProps, 'label'> & {
  link?: boolean;
  meterGroup?: MeterGroup;
  info?: React.ReactNode;
};

type DetailsBoxProps = { info?: React.ReactNode; meterGroup: MeterGroup };
type ScenarioDetailsProps = { info: React.ReactNode; scenario: Scenario };
type OriginFileDetailsProps = { info: React.ReactNode; originFile: OriginFile };
type DERSectionProps = { field: string; value: string };

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(
  () => ({
    hover: {
      maxWidth: 500,
      padding: 0,
    },
  }),
  'MeterGroupChip'
);

const useDetailsBoxStyles = makeStylesHook(
  (theme) => ({
    meterGroup: {
      borderBottom: `1px solid ${theme.palette.divider}`,
      padding: theme.spacing(1, 2),
    },
  }),
  'DetailsBox'
);

const useDERSectionStyles = makeStylesHook(
  (theme) => ({
    gridRow: {
      padding: `${theme.spacing(1, 2)} !important`,
    },
  }),
  'DERSection'
);

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

const ScenarioDetails: React.FC<ScenarioDetailsProps> = ({ info, scenario }) => {
  const { der, meter_count, meter_group } = scenario;
  const classes = useDetailsBoxStyles();

  return (
    <>
      <div className={classes.meterGroup}>
        <Typography emphasis="bold" variant="body2">
          {meter_group?.name} ({meter_count} {formatters.pluralize('meter', meter_count)})
        </Typography>
      </div>

      {der && (
        <Grid noMargin>
          <DERSection field="DER Type" value={der.der_strategy.der_type} />
          <DERSection field="Configuration" value={der.der_configuration.name} />
          <DERSection field="Strategy" value={der.der_strategy.name} />
        </Grid>
      )}

      {info && <Alert type="info">{info}</Alert>}
    </>
  );
};

const OriginFileDetails: React.FC<OriginFileDetailsProps> = ({ info, originFile }) => (
  <>
    <SummaryTable originFile={originFile} />
    {info && <Alert type="info">{info}</Alert>}
  </>
);

const DetailsBox: React.FC<DetailsBoxProps> = ({ info, meterGroup }) => {
  if (isScenario(meterGroup)) {
    return <ScenarioDetails info={info} scenario={meterGroup} />;
  } else if (isOriginFile(meterGroup)) {
    return <OriginFileDetails info={info} originFile={meterGroup} />;
  } else {
    return null;
  }
};

export const MeterGroupChip: React.FC<MeterGroupChipProps> = (props) => {
  const { color = 'secondary', disabled, icon, link = false, meterGroup, info, ...rest } = props;
  const routeTo = usePushRouter();
  const classes = useStyles();

  // Validate props
  if (link && props.onClick) {
    printWarning(`
      \`MeterGroupChip\` component received both \`link\` and \`onClick\` props. At most one should
      be provided.
    `);
  }

  const onClick = props.onClick || getLinkCb();

  if (!meterGroup) return null;
  return (
    <Popover
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      className={classes.hover}
      HoverComponent={<DetailsBox info={info} meterGroup={meterGroup} />}
    >
      <Chip
        color={disabled ? 'default' : color}
        data-testid="meter-group-chip"
        disabled={disabled}
        icon={getIcon()}
        label={models.meterGroup.getDisplayName(meterGroup)}
        onClick={onClick}
        {...rest}
      />
    </Popover>
  );

  /** ============================ Helpers ================================= */
  /**
   * Returns a callback which can be used to link to the meter group's details page. The actual page
   * depends on what type of meter group we're dealing with.
   */
  function getLinkCb() {
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

  function getIcon(): Maybe<ValidIcon> {
    if (icon) {
      return icon;
    } else if (isScenario(meterGroup) && meterGroup.der) {
      const { der_type } = meterGroup.der.der_configuration;
      return getDERIconName(der_type);
    } else if (isOriginFile(meterGroup) && meterGroup.has_gas) {
      return 'flame';
    }
  }
};
