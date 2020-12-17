import _ from 'lodash';
import * as React from 'react';

import {
  Alert,
  Card,
  Flex,
  Grid,
  MeterGroupChip,
  Progress,
  Typography,
} from 'navigader/components';
import { makeStylesHook } from 'navigader/styles';
import { OriginFile, Scenario } from 'navigader/types';
import { formatters, models } from 'navigader/util';
import { CreateScenarioScreenProps } from './common';

/** ============================ Types ===================================== */
type CommonChipProps = {
  onClick: () => void;
  selected: boolean;
};

type SelectOriginFileChipProps = CommonChipProps & { originFile: OriginFile };
type SelectScenarioChipProps = CommonChipProps & { scenario: Scenario };
type SelectionCardProps = { title: string };

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(
  (theme) => ({
    chipContainer: {
      '& > *': {
        margin: theme.spacing(0.5),
      },
    },
    meterCount: {
      marginTop: 'auto',
      textAlign: 'right',
    },
  }),
  'SelectMeterGroups'
);

const useSelectCustomerStyles = makeStylesHook(
  (theme) => ({ alertWarning: { marginTop: theme.spacing(1) } }),
  'SelectCustomers'
);

const useCustomerChipStyles = makeStylesHook(
  (theme) => ({
    meterGroupChip: {
      marginBottom: theme.spacing(2),
    },
  }),
  'SelectOriginFileChip'
);

const useSelectionCardStyles = makeStylesHook(
  (theme) => ({
    card: {
      ...theme.mixins.flex({ direction: 'column', wrap: 'nowrap' }),
      height: '100%',
      boxSizing: 'border-box',
    },
  }),
  'SelectionCard'
);

/** ============================ Components ================================ */
const SelectionCard: React.FC<SelectionCardProps> = ({ title, children }) => {
  const classes = useSelectionCardStyles();
  return (
    <Card className={classes.card} raised>
      <Typography variant="h6">{title}</Typography>
      {children}
    </Card>
  );
};

const SelectOriginFileChip: React.FC<SelectOriginFileChipProps> = (props) => {
  const { originFile, onClick, selected } = props;
  const classes = useCustomerChipStyles();
  const { meter_count } = originFile;
  const { expected_meter_count } = originFile.metadata;
  const intervalTooLong = models.meterGroup.spansMoreThanAYear(originFile);
  const ingested = models.meterGroup.isSufficientlyIngested(originFile);

  return (
    <MeterGroupChip
      className={classes.meterGroupChip}
      color={selected ? 'primary' : 'secondary'}
      disabled={!ingested || intervalTooLong}
      meterGroup={originFile}
      onClick={onClick}
      info={getTooltipText()}
    />
  );

  /** ========================== Helpers =================================== */
  function getTooltipText() {
    if (!ingested) {
      // If the meter group can not yet be run in a scenario, render a tooltip explaining why
      const percentComplete =
        expected_meter_count === null
          ? '0%'
          : formatters.percentage(meter_count, expected_meter_count);

      return `
        This file has successfully uploaded but is still being processed. It is currently
        ${percentComplete} complete. You can run a scenario with this file once it has
        finished processing.
      `;
    } else if (intervalTooLong) {
      // The non-null assertions (!'s) here are acceptable because `intervalTooLong` can't be truthy
      // if the date range couldn't be ascertained
      const numDays = Math.floor(models.meterGroup.getDateRangeInterval(originFile, 'days')!);
      const dateRange = formatters.date.range(originFile.date_range!, formatters.date.standard);
      return `
        This file spans more than a year. Scenarios can only be run on files that span 366 days or
        less. This file contains data from ${dateRange}, a period of ${numDays} days.
      `;
    }
  }
};

const MeterGroups: React.FC<CreateScenarioScreenProps> = (props) => {
  const { originFiles, state, updateState } = props;
  const classes = useStyles();

  const selectedMeterCount = state.originFileSelections.reduce((curCount, meterId) => {
    const meter = _.find(originFiles, { id: meterId });
    return meter ? meter.meter_count + curCount : curCount;
  }, 0);

  return (
    <SelectionCard title="Uploaded Files">
      {originFiles.loading ? (
        <Progress />
      ) : (
        <>
          <Flex.Container className={classes.chipContainer} wrap>
            {originFiles.map((originFile) => (
              <SelectOriginFileChip
                key={originFile.id}
                originFile={originFile}
                onClick={toggleMeterGroup.bind(null, originFile.id)}
                selected={state.originFileSelections.includes(originFile.id)}
              />
            ))}
          </Flex.Container>
          <div className={classes.meterCount}>Number of meters: {selectedMeterCount}</div>
        </>
      )}
    </SelectionCard>
  );

  /** ========================== Callbacks ================================= */
  function toggleMeterGroup(id: string) {
    updateState({
      originFileSelections: state.originFileSelections.includes(id)
        ? _.without(state.originFileSelections, id)
        : [...state.originFileSelections, id],
    });
  }
};

const SelectScenarioChip: React.FC<SelectScenarioChipProps> = ({ scenario, onClick, selected }) => {
  const classes = useCustomerChipStyles();
  const { is_complete, percent_complete } = scenario.progress;

  return (
    <MeterGroupChip
      className={classes.meterGroupChip}
      color={selected ? 'primary' : 'secondary'}
      disabled={!is_complete}
      onClick={onClick}
      meterGroup={scenario}
      info={getTooltipText()}
    />
  );

  /** ========================== Helpers =================================== */
  function getTooltipText() {
    if (is_complete) return undefined;

    let rationale = `It is currently ${percent_complete}% complete`;
    if (percent_complete === 100) {
      rationale = `
        The simulation has finished, and aggregate statistics are being produced. It should be
        available for use shortly
      `;
    }

    return `
      This scenario is still being processed. ${rationale}. You
      can run a scenario with it once it has finished processing.
    `;
  }
};

const Scenarios: React.FC<CreateScenarioScreenProps> = (props) => {
  const { scenarios, state, updateState } = props;
  const classes = useStyles();

  const selectedMeterCount = state.scenarioSelections.reduce((curCount, scenarioId) => {
    const scenario = _.find(scenarios, { id: scenarioId });
    return scenario ? scenario.meter_count + curCount : curCount;
  }, 0);

  return (
    <SelectionCard title="Scenarios">
      {scenarios.loading ? (
        <Progress />
      ) : scenarios.length === 0 ? (
        <Typography variant="body2">
          No scenarios have been run yet. Once you have run a scenario, you will be able to use it
          as the input to another scenario. This allows simulating multiple DERs on the same
          customer segment.
        </Typography>
      ) : (
        <>
          <Flex.Container className={classes.chipContainer} wrap>
            {scenarios.map((scenario) => (
              <SelectScenarioChip
                key={scenario.id}
                onClick={toggleScenario.bind(null, scenario.id)}
                scenario={scenario}
                selected={state.scenarioSelections.includes(scenario.id)}
              />
            ))}
          </Flex.Container>
          <div className={classes.meterCount}>Number of meters: {selectedMeterCount}</div>
        </>
      )}
    </SelectionCard>
  );

  /** ========================== Callbacks ================================= */
  function toggleScenario(id: string) {
    updateState({
      scenarioSelections: state.scenarioSelections.includes(id)
        ? _.without(state.scenarioSelections, id)
        : [...state.scenarioSelections, id],
    });
  }
};

export const SelectCustomers: React.FC<CreateScenarioScreenProps> = (props) => {
  const classes = useSelectCustomerStyles();
  return (
    <Card raised>
      <Grid>
        <Grid.Item span={12}>
          <Alert type="info">
            Scenarios can be run on uploaded customer segments, or on top of other scenarios.
            "Stacked" scenarios can be used to simulate programs of multiple DERs with the same
            customer segment. You must choose at least one customer segment below, and up to as many
            as you like. Each segment will be run in its own scenario.
          </Alert>
          <Alert className={classes.alertWarning} type="warning">
            All customer segments <i>must</i> have the same calendar year or the scenarios will not
            be able to run properly.
          </Alert>
        </Grid.Item>

        <Grid.Item span={6}>
          <MeterGroups {...props} />
        </Grid.Item>
        <Grid.Item span={6}>
          <Scenarios {...props} />
        </Grid.Item>
      </Grid>
    </Card>
  );
};
