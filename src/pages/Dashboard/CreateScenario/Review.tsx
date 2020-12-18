import _ from 'lodash';
import * as React from 'react';

import {
  Card,
  Flex,
  Grid,
  Link,
  MeterGroupChip,
  TextField,
  Typography,
} from 'navigader/components';
import { routes } from 'navigader/routes';
import { makeStylesHook } from 'navigader/styles';
import { CostFunction, CostFunctions, Maybe } from 'navigader/types';

import { CreateScenarioScreenProps, DerCardReadOnly, validateDerSelections } from './common';

/** ============================ Types ===================================== */
type CostFunctionSectionProps = CreateScenarioScreenProps & { functionClass: keyof CostFunctions };

/** ============================ Styles ==================================== */
const useSelectedCustomersStyles = makeStylesHook(
  (theme) => ({
    chipContainer: {
      '& > *': {
        margin: theme.spacing(0.5),
      },
    },
  }),
  'SelectedCustomers'
);

/** ============================ Components ================================ */
const SelectedCustomers: React.FC<CreateScenarioScreenProps> = (props) => {
  const { originFiles, scenarios, state } = props;
  const classes = useSelectedCustomersStyles();
  return (
    <Card raised>
      <Typography useDiv variant="h6">
        Customers
      </Typography>

      {(() => {
        // If there aren't any meter groups or scenarios selected...
        if (state.originFileSelections.concat(state.scenarioSelections).length === 0) {
          return (
            <Typography variant="body1">
              None selected.{' '}
              <Link to={routes.dashboard.createScenario.selectCustomers}>Add customers</Link>
            </Typography>
          );
        }

        return (
          <Flex.Container className={classes.chipContainer} wrap>
            {state.originFileSelections.map((meterGroupId) => (
              <MeterGroupChip
                color="primary"
                icon="checkMark"
                key={meterGroupId}
                meterGroup={_.find(originFiles, { id: meterGroupId })}
              />
            ))}

            {state.scenarioSelections.map((scenarioId) => (
              <MeterGroupChip
                color="primary"
                key={scenarioId}
                meterGroup={_.find(scenarios, { id: scenarioId })!}
              />
            ))}
          </Flex.Container>
        );
      })()}
    </Card>
  );
};

const SelectedDers: React.FC<CreateScenarioScreenProps> = (props) => {
  const { derConfigurations, derStrategies, state } = props;
  return (
    <Card raised>
      <Typography useDiv variant="h6">
        DERs
      </Typography>

      {(() => {
        // If there aren't any DERs selected or any are invalid...
        if (!validateDerSelections(state.derSelections)) {
          return (
            <Typography variant="body1">
              None selected. <Link to={routes.dashboard.createScenario.selectDers}>Add DERs</Link>
            </Typography>
          );
        }

        return state.derSelections.map((selectedDer, index) => (
          <DerCardReadOnly
            CardProps={{ outlined: true }}
            configurations={derConfigurations}
            der={selectedDer}
            key={index}
            numDers={state.derSelections.length}
            strategies={derStrategies}
          />
        ));
      })()}
    </Card>
  );
};

const CostFunctionSection: React.FC<CostFunctionSectionProps> = (props) => {
  const { functionClass, state, costFunctions } = props;

  // If nothing in this function class was selected, render nothing
  const selectionId = state.costFunctionSelections[functionClass];
  if (_.isUndefined(selectionId)) return null;

  // Get the cost function's name in an IIFE
  const costFnName = (() => {
    if (selectionId === 'auto') {
      return 'Automatically assigned';
    } else {
      const allFunctionsOfClass = costFunctions[functionClass];
      const selection = _.find(allFunctionsOfClass, ['id', selectionId]) as Maybe<CostFunction>;
      return selection?.name;
    }
  })();

  // If for whatever reason the cost function couldn't be found, render nothing
  if (_.isUndefined(costFnName)) return null;

  return (
    <>
      <Grid.Item span={5}>
        <Typography emphasis="bold" useDiv variant="body2">
          {renderClassName()}
        </Typography>
      </Grid.Item>

      <Grid.Item span={7}>
        <Typography useDiv variant="body2">
          {costFnName}
        </Typography>
      </Grid.Item>
    </>
  );

  /** ========================== Helpers =================================== */
  function renderClassName() {
    switch (functionClass) {
      case 'caisoRate':
        return 'Procurement Rate';
      case 'ghgRate':
        return 'GHG Rate';
      case 'ratePlan':
        return 'Rate Plan';
      case 'systemProfile':
        return 'Resource Adequacy Cost';
    }
  }
};

const SelectedCostFunctions: React.FC<CreateScenarioScreenProps> = (props) => {
  return (
    <Card raised>
      <Typography useDiv variant="h6">
        Cost Functions
      </Typography>

      {(() => {
        // If there aren't any cost functions selected...
        if (_.isEmpty(props.state.costFunctionSelections)) {
          return (
            <Typography variant="body1">
              None selected. <Link to={routes.dashboard.createScenario.selectDers}>Add DERs</Link>
            </Typography>
          );
        }

        return (
          <Grid>
            <CostFunctionSection {...props} functionClass="ghgRate" />
            <CostFunctionSection {...props} functionClass="caisoRate" />
            <CostFunctionSection {...props} functionClass="ratePlan" />
            <CostFunctionSection {...props} functionClass="systemProfile" />
          </Grid>
        );
      })()}
    </Card>
  );
};

export const Review: React.FC<CreateScenarioScreenProps> = (props) => {
  return (
    <>
      <Grid>
        <Grid.Item span={6}>
          <TextField
            autoFocus
            id="scenario-name"
            label="Scenario Name"
            onChange={handleNameChange}
            outlined
            tabIndex={1}
            value={props.state.name || ''}
          />
        </Grid.Item>
        <Grid.Item span={6} />

        <Grid.Item span={4}>
          <SelectedCustomers {...props} />
        </Grid.Item>

        <Grid.Item span={4}>
          <SelectedDers {...props} />
        </Grid.Item>

        <Grid.Item span={4}>
          <SelectedCostFunctions {...props} />
        </Grid.Item>
      </Grid>
    </>
  );

  /** ========================== Callbacks ================================= */
  function handleNameChange(newName: string) {
    props.updateState({ name: newName === '' ? null : newName });
  }
};
