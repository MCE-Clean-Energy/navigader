import _ from 'lodash';
import * as React from 'react';

import {
  Card,
  Flex,
  Grid,
  MeterGroupChip,
  Progress,
  ScenarioChip,
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
  const isIngested = models.meterGroup.isSufficientlyIngested(originFile);
  const icon = isIngested ? (selected ? 'checkMark' : 'plus') : undefined;

  return (
    <MeterGroupChip
      className={classes.meterGroupChip}
      color={selected ? 'primary' : 'secondary'}
      disabled={!isIngested}
      icon={icon}
      meterGroup={originFile}
      onClick={onClick}
      showCount={isIngested}
      tooltipText={getTooltipText()}
    />
  );

  /** ========================== Helpers =================================== */
  function getTooltipText() {
    if (isIngested) return;

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
    <ScenarioChip
      className={classes.meterGroupChip}
      color={selected ? 'primary' : 'secondary'}
      disabled={!is_complete}
      onClick={onClick}
      scenario={scenario}
      tooltipText={getTooltipText()}
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
  return (
    <Grid>
      <Grid.Item span={6}>
        <MeterGroups {...props} />
      </Grid.Item>

      <Grid.Item span={6}>
        <Scenarios {...props} />
      </Grid.Item>
    </Grid>
  );
};
