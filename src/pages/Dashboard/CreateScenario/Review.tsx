import * as React from 'react';
import { Link } from 'react-router-dom';
import find from 'lodash/find';

import { Card, Flex, Grid, TextField, Typography } from '@nav/shared/components';
import { MeterGroup } from '@nav/shared/models/meter';
import { makeStylesHook } from '@nav/shared/styles';
import * as routes from '@nav/shared/routes';
import { BatteryConfiguration, BatteryStrategy } from '@nav/shared/models/der';
import { CustomerChip, DerCardReadOnly, DERSelection, validateDerSelections } from './shared';


/** ============================ Types ===================================== */
type ReviewProps = {
  derConfigurations?: BatteryConfiguration[];
  derStrategies?: BatteryStrategy[];
  meterGroups: MeterGroup[] | null;
  selectedDers: Partial<DERSelection>[];
  selectedMeterGroupIds: string[];
  scenarioName: string | null;
  updateScenarioName: (name: string | null) => void;
};

/** ============================ Styles ==================================== */
const selectedCustomersUseStyles = makeStylesHook(theme => ({
  customerRow: {
    marginBottom: theme.spacing(2)
  },
  numMeters: {
    marginLeft: theme.spacing(2)
  }
}));

const sectionHeadingUseStyles = makeStylesHook(theme => ({
  heading: {
    marginBottom: theme.spacing(3)
  }
}));

const reviewUseStyles = makeStylesHook(theme => ({
  scenarioName: {
    marginTop: theme.spacing(3),
    width: '50%'
  }
}));

/** ============================ Components ================================ */
const SectionHeading: React.FC = ({ children }) => {
  const classes = sectionHeadingUseStyles();
  return <Typography className={classes.heading} useDiv variant="subtitle1">{children}</Typography>;
};

const SelectedCustomers: React.FC<ReviewProps> = (props) => {
  const { meterGroups, selectedMeterGroupIds } = props;
  const classes = selectedCustomersUseStyles();
  return (
    <div>
      <SectionHeading>Selected Customers</SectionHeading>
      
      {(() => {
        // If there aren't any meter groups selected...
        if (selectedMeterGroupIds.length === 0) {
          return (
            <Card raised>
              <Typography variant="body1">
                None selected. <Link to={routes.dashboard.createScenario.selectCustomers}>Add customers</Link>
              </Typography>
            </Card>
          );
        }
        
        return selectedMeterGroupIds.map((meterGroupId) => {
          const meterGroup = find(meterGroups, { id: meterGroupId });
          if (!meterGroup) return null;
          return (
            <Flex.Container
              alignItems="center"
              className={classes.customerRow}
              key={meterGroup.id}
            >
              <Flex.Item>
                <CustomerChip meterGroup={meterGroup} selected />
              </Flex.Item>
              
              <Flex.Item className={classes.numMeters}>
                <Typography variant="body2">
                  Number of meters: {meterGroup.numMeters}
                </Typography>
              </Flex.Item>
            </Flex.Container>
          );
        });
      })()}
    </div>
  );
};

const SelectedDers: React.FC<ReviewProps> = (props) => {
  const { derConfigurations, derStrategies, selectedDers } = props;
  return (
    <div>
      <SectionHeading>Selected DERs</SectionHeading>
      
      {(() => {
        // If there aren't any DERs selected or any are invalid...
        if (!validateDerSelections(selectedDers)) {
          return (
            <Card raised>
              <Typography variant="body1">
                None selected. <Link to={routes.dashboard.createScenario.selectDers}>Add DERs</Link>
              </Typography>
            </Card>
          );
        }
        
        return selectedDers.map((selectedDer, index) =>
          <DerCardReadOnly
            configurations={derConfigurations}
            der={selectedDer}
            key={index}
            numDers={selectedDers.length}
            strategies={derStrategies}
          />
        );
      })()}
    </div>
  );
};

const Review: React.FC<ReviewProps> = (props) => {
  const classes = reviewUseStyles();
  return (
    <>
      <Grid>
        <Grid.Item span={7}>
          <SelectedDers {...props} />
        </Grid.Item>
        
        <Grid.Item span={1} />
        
        <Grid.Item span={4}>
          <SelectedCustomers {...props} />
        </Grid.Item>
      </Grid>
      
      <TextField
        autoFocus
        className={classes.scenarioName}
        id="scenario-name"
        label="Scenario Name"
        onChange={handleNameChange}
        outlined
        tabIndex={1}
        value={props.scenarioName || ''}
      />
    </>
  );
  
  /** ============================ Callbacks =============================== */
  function handleNameChange (newName: string) {
    props.updateScenarioName(newName === '' ? null : newName);
  }
};

/** ============================ Exports =================================== */
export default Review;
