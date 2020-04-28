import * as React from 'react';
import find from 'lodash/find';

import { Card, Grid, Link, MeterGroupChip, TextField, Typography } from '@nav/common/components';
import { BatteryConfiguration, BatteryStrategy } from '@nav/common/models/der';
import { MeterGroup } from '@nav/common/models/meter';
import * as routes from '@nav/common/routes';
import { makeStylesHook } from '@nav/common/styles';
import { DerCardReadOnly, DERSelection, validateDerSelections } from './common';


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
const useSectionHeadingStyles = makeStylesHook(theme => ({
  heading: {
    marginBottom: theme.spacing(3)
  }
}), 'SectionHeading');

const useSelectedCustomersStyles = makeStylesHook(theme => ({
  meterGroupChip: {
    '&:not(:last-of-type)': {
      marginBottom: theme.spacing(2)
    }
  }
}), 'SelectedCustomers');

/** ============================ Components ================================ */
const SectionHeading: React.FC = ({ children }) => {
  const classes = useSectionHeadingStyles();
  return <Typography className={classes.heading} useDiv variant="subtitle1">{children}</Typography>;
};

const SelectedCustomers: React.FC<ReviewProps> = (props) => {
  const { meterGroups, selectedMeterGroupIds } = props;
  const classes = useSelectedCustomersStyles();
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
        
        return selectedMeterGroupIds.map((meterGroupId) =>
          <MeterGroupChip
            className={classes.meterGroupChip}
            color="primary"
            icon="checkMark"
            key={meterGroupId}
            meterGroup={find(meterGroups, { id: meterGroupId })}
            showCount
          />
        );
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
        
        <Grid.Item span={6}>
          <TextField
            autoFocus
            id="scenario-name"
            label="Scenario Name"
            onChange={handleNameChange}
            outlined
            tabIndex={1}
            value={props.scenarioName || ''}
          />
        </Grid.Item>
      </Grid>
      
    </>
  );
  
  /** ============================ Callbacks =============================== */
  function handleNameChange (newName: string) {
    props.updateScenarioName(newName === '' ? null : newName);
  }
};

/** ============================ Exports =================================== */
export default Review;
