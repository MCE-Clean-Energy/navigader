import * as React from 'react';
import MuiStep from '@material-ui/core/Step';
import MuiStepLabel from '@material-ui/core/StepLabel';
import MuiStepper from '@material-ui/core/Stepper';

import { makeStylesHook } from 'navigader/styles';

/** ============================ Types ===================================== */
type StepperProps = {
  activeStep: number;
  className?: string;
  steps: string[];
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(
  () => ({
    stepper: {
      padding: 0,
    },
  }),
  'Stepper'
);

/** ============================ Components ================================ */
export const Stepper: React.FC<StepperProps> = ({ activeStep, className, steps }) => {
  const classes = useStyles();
  return (
    <MuiStepper activeStep={activeStep} classes={{ root: classes.stepper }} className={className}>
      {steps.map((label) => (
        <MuiStep key={label}>
          <MuiStepLabel>{label}</MuiStepLabel>
        </MuiStep>
      ))}
    </MuiStepper>
  );
};
