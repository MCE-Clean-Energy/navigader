import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import * as api from 'navigader/api';
import { Button, Flex } from 'navigader/components';
import * as routes from 'navigader/routes';
import { setMessage } from 'navigader/store/slices/ui';
import { MeterGroup } from 'navigader/types';
import { omitFalsey, printWarning } from 'navigader/util';
import _ from 'navigader/util/lodash';
import {
  DERSelection, stepPaths, stepNumbers, validateCustomerSelections, validateDerSelections
} from './common';


/** ============================ Types ===================================== */
type StepActionProps = {
  activeStep: number;
  
  // Props needed for validation
  meterGroups: MeterGroup[] | null;
  scenarioName: string | null;
  selectedDers: Partial<DERSelection>[];
  selectedMeterGroupIds: string[];
}

/** ============================ Components ================================ */
const StepActions: React.FC<StepActionProps> = (props) => {
  const { activeStep, meterGroups, selectedDers, selectedMeterGroupIds, scenarioName } = props;
  const history = useHistory();
  const dispatch = useDispatch();
  const prevButton = activeStep === 0
    ? null
    : <Button onClick={goBack}>Back</Button>;
  
  const nextButtonText = activeStep === 2 ? 'Create Scenario' : 'Next';
  const nextButtonCb = activeStep === 2 ? createScenario : goForward;
  const nextButton =
    <Button
      color="primary"
      disabled={disableNext()}
      onClick={nextButtonCb}
    >
      {nextButtonText}
    </Button>;
  
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
    if (activeStep === stepPaths.length - 1) return;
    history.push(stepPaths[activeStep + 1]);
  }
  
  /**
   * Validates all inputs and makes a POST request to the back end to create a study/scenarios.
   */
  async function createScenario () {
    // Validate all inputs
    if (!(
      !!scenarioName &&
      validateDerSelections(selectedDers) &&
      validateCustomerSelections(getSelectedMeterGroups(meterGroups, selectedMeterGroupIds))
    )) {
      printWarning('`createScenario` method ran with invalid inputs!');
      return;
    }
    
    try {
      const response = await api.postStudy(scenarioName, selectedMeterGroupIds, selectedDers);
      if (response.ok) {
        handleStudyCreationSuccess();
      } else {
        handleStudyCreationFailure();
      }
    } catch (e) {
      handleStudyCreationFailure();
    }
  }
  
  /**
   * Triggered when the POST request succeeds. Shows a success message and redirects the user to
   * the dashboard.
   */
  function handleStudyCreationSuccess () {
    dispatch(setMessage({ msg: 'Scenario created!', type: 'success' }));
    history.push(routes.dashboard.base);
  }
  
  /**
   * Triggered when the POST request fails. Shows an error message.
   */
  function handleStudyCreationFailure () {
    dispatch(
      setMessage({ msg: 'An error occurred. Please try submitting again.', type: 'error' })
    );
  }
  
  /**
   * Performs validation on the current step.
   *   - On the "DER Selection" page, at least one DER must be selected and filled out
   *   - On the "Customer Selection" page, at least one meter group must be selected
   *   - On the "Review" page, all the above validations must pass and a name must be provided
   */
  function disableNext () {
    const hasScenarioName = !!scenarioName;
    const hasValidDerSelections = validateDerSelections(selectedDers);
    const hasValidCustomerSelections = validateCustomerSelections(
      getSelectedMeterGroups(meterGroups, selectedMeterGroupIds)
    );
    
    switch (activeStep) {
      case stepNumbers.selectDers:
        return !hasValidDerSelections;
      case stepNumbers.selectCustomers:
        return !hasValidCustomerSelections;
      case stepNumbers.review:
        return !(hasValidDerSelections && hasValidCustomerSelections && hasScenarioName);
    }
  }
};

/** ============================ Helpers =================================== */
function getSelectedMeterGroups (meterGroups: MeterGroup[] | null, ids: string[]) {
  return meterGroups === null
    ? []
    : omitFalsey(ids.map(id => _.find(meterGroups, { id })));
}

/** ============================ Exports =================================== */
export default StepActions;
