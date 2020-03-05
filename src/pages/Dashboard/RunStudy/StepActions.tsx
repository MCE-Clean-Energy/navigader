import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Button, Flex } from '@nav/shared/components';
import { stepPaths } from './util';


/** ============================ Types ===================================== */
type StepActionProps = {
  activeStep: number;
}

/** ============================ Components ================================ */
const StepActions: React.FC<StepActionProps> = ({ activeStep }) => {
  const history = useHistory();
  const prevButton = activeStep === 0
    ? null
    : <Button onClick={goBack}>Back</Button>;
  
  const nextButtonText = activeStep === 2 ? 'Run Study' : 'Next';
  const nextButtonCb = activeStep === 2 ? runStudy : goForward;
  const nextButton = <Button color="primary" onClick={nextButtonCb}>{nextButtonText}</Button>;
  
  return (
    <Flex.Container justifyContent="space-between">
      <Flex.Item>{prevButton}</Flex.Item>
      <Flex.Item>{nextButton}</Flex.Item>
    </Flex.Container>
  );
  
  /** ============================ Callbacks =============================== */
  function goBack () {
    if (activeStep === 0) return;
    history.push(stepPaths[activeStep - 1]);
  }
  
  function goForward () {
    if (activeStep === 2) return;
    history.push(stepPaths[activeStep + 1]);
  }
  
  function runStudy () {
    console.log('Running study...');
  }
};

/** ============================ Exports =================================== */
export default StepActions;
