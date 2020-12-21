import _ from 'lodash';
import { DateTime } from 'luxon';
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
import { Nullable, OriginFile, Scenario } from 'navigader/types';
import { formatters, interval, models } from 'navigader/util';
import { CreateScenarioScreenProps } from './common';

/** ============================ Types ===================================== */
type CommonChipProps = {
  onClick: () => void;
  selected: boolean;
  startDate: Nullable<DateTime>;
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
  const { originFile, onClick, selected, startDate } = props;
  const classes = useCustomerChipStyles();
  const { meter_count } = originFile;
  const { expected_meter_count } = originFile.metadata;
  const spansMultipleYears = interval.spansMultipleYears(originFile);
  const hasDifferentYear = !interval.hasYear(originFile, startDate);
  const ingested = models.meterGroup.isSufficientlyIngested(originFile);

  return (
    <MeterGroupChip
      className={classes.meterGroupChip}
      color={selected ? 'primary' : 'secondary'}
      disabled={!ingested || spansMultipleYears || hasDifferentYear}
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
    } else if (spansMultipleYears) {
      // The non-null assertions (!'s) here are acceptable because `spansMultipleYears` can't be
      // truthy if the date range couldn't be ascertained
      const dateRange = formatters.date.range(originFile.date_range!, formatters.date.standard);
      return `
        This file contains data from multiple calendar years. Scenarios can only be run on files
        from the same year. This file contains data from ${dateRange}.
      `;
    } else if (hasDifferentYear) {
      const originFileStartDate = interval.getStartDate(originFile);
      if (_.isNull(originFileStartDate)) {
        // This is a strange situation in which the origin file has finished ingesting but for some
        // reason we don't have a date range for it. It's possible the file has no meter data.
        return `
          File's start date could not be determined. Please refresh the page and try again, or
          contact support.
        `;
      } else {
        const originFileYear = originFileStartDate.year;
        return `
          This file's interval data is for the year ${originFileYear}, which differs from the year
          of other selected customer segments (${startDate!.year}). All customer segments must have
          the same calendar year or the scenarios will not be able to run properly.
        `;
      }
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
                onClick={toggleMeterGroup.bind(null, originFile)}
                selected={state.originFileSelections.includes(originFile.id)}
                startDate={state.startDate}
              />
            ))}
          </Flex.Container>
          <div className={classes.meterCount}>Number of meters: {selectedMeterCount}</div>
        </>
      )}
    </SelectionCard>
  );

  /** ========================== Callbacks ================================= */
  function toggleMeterGroup(originFile: OriginFile) {
    const { id } = originFile;
    const { originFileSelections } = state;
    const wasSelected = originFileSelections.includes(id);
    updateState(
      {
        originFileSelections: wasSelected
          ? _.without(originFileSelections, id)
          : [...originFileSelections, id],
      },
      wasSelected ? null : interval.getStartDate(originFile)
    );
  }
};

const SelectScenarioChip: React.FC<SelectScenarioChipProps> = (props) => {
  const { scenario, onClick, selected, startDate } = props;
  const classes = useCustomerChipStyles();
  const { is_complete, percent_complete } = scenario.progress;
  const hasDifferentYear = !interval.hasYear(scenario, startDate);

  return (
    <MeterGroupChip
      className={classes.meterGroupChip}
      color={selected ? 'primary' : 'secondary'}
      disabled={!is_complete || hasDifferentYear}
      onClick={onClick}
      meterGroup={scenario}
      info={getTooltipText()}
    />
  );

  /** ========================== Helpers =================================== */
  function getTooltipText() {
    if (!is_complete) {
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
    } else if (hasDifferentYear) {
      const scenarioStartDate = interval.getStartDate(scenario);
      if (_.isNull(scenarioStartDate)) {
        // This is a strange situation in which the scenario has finished processing but for some
        // reason we don't have a date range for it.
        return `
          Scenario's start date could not be determined. Please refresh the page and try again, or
          contact support.
        `;
      } else {
        const scenarioYear = scenarioStartDate.year;
        return `
          This scenario's interval data is for the year ${scenarioYear}, which differs from the year
          of other selected customer segments (${startDate!.year}). All customer segments must have
          the same calendar year or the scenarios will not be able to run properly.
        `;
      }
    }
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
                onClick={toggleScenario.bind(null, scenario)}
                scenario={scenario}
                selected={state.scenarioSelections.includes(scenario.id)}
                startDate={state.startDate}
              />
            ))}
          </Flex.Container>
          <div className={classes.meterCount}>Number of meters: {selectedMeterCount}</div>
        </>
      )}
    </SelectionCard>
  );

  /** ========================== Callbacks ================================= */
  function toggleScenario(scenario: Scenario) {
    const { id } = scenario;
    const { scenarioSelections } = state;
    const wasSelected = scenarioSelections.includes(id);
    updateState(
      {
        scenarioSelections: wasSelected
          ? _.without(scenarioSelections, id)
          : [...scenarioSelections, id],
      },
      wasSelected ? null : interval.getStartDate(scenario)
    );
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
