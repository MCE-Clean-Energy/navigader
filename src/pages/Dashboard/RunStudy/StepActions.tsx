import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import find from 'lodash/find';

import * as api from '@nav/shared/api';
import { Button, Flex } from '@nav/shared/components';
import { MeterGroup } from '@nav/shared/models/meter';
import * as routes from '@nav/shared/routes';
import { setMessage } from '@nav/shared/store/slices/ui';
import { printWarning } from '@nav/shared/util';
import {
  DERSelection, stepPaths, stepNumbers, validateCustomerSelections, validateDerSelections
} from './shared';


/** ============================ Types ===================================== */
type StepActionProps = {
  activeStep: number;
  
  // Props needed for validation
  meterGroups: MeterGroup[] | null;
  selectedDers: Partial<DERSelection>[];
  selectedMeterGroupIds: string[];
  studyName: string | null;
}

/** ============================ Components ================================ */
const StepActions: React.FC<StepActionProps> = (props) => {
  const { activeStep, meterGroups, selectedDers, selectedMeterGroupIds, studyName } = props;
  const history = useHistory();
  const dispatch = useDispatch();
  const prevButton = activeStep === 0
    ? null
    : <Button onClick={goBack}>Back</Button>;
  
  const nextButtonText = activeStep === 2 ? 'Run Study' : 'Next';
  const nextButtonCb = activeStep === 2 ? runStudy : goForward;
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
  
  async function runStudy () {
    // Validate all inputs
    if (!(
      !!studyName &&
      validateDerSelections(selectedDers) &&
      validateCustomerSelections(getSelectedMeterGroups(meterGroups, selectedMeterGroupIds))
    )) {
      printWarning('`runStudy` method ran with invalid inputs!');
      return;
    }
    
    try {
      await api.postStudy(studyName, selectedMeterGroupIds, selectedDers);
      dispatch(
        setMessage({ msg: 'Study created!', type: 'success' })
      );
      
      // Redirect to the dashboard page
      history.push(routes.dashboard.base);
    } catch (e) {
      dispatch(
        setMessage({ msg: 'An error occurred. Please try submitting again.', type: 'error' })
      );
    }
  }
  
  /**
   * Performs validation on the current step.
   *   - On the "DER Selection" page, at least one DER must be selected and filled out
   *   - On the "Customer Selection" page, at least one meter group must be selected
   *   - On the "Review" page, all the above validations must pass and a name must be provided
   */
  function disableNext () {
    const hasStudyName = !!studyName;
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
        return !(hasValidDerSelections && hasValidCustomerSelections && hasStudyName);
    }
  }
};

/** ============================ Helpers =================================== */
function getSelectedMeterGroups (meterGroups: MeterGroup[] | null, ids: string[]): MeterGroup[] {
  if (meterGroups === null) return [];
  return ids
    .map(id => find(meterGroups, { id }))
    .filter(meterGroupFilter);
}

function meterGroupFilter (meterGroup: MeterGroup | undefined): meterGroup is MeterGroup {
  return meterGroup !== undefined;
}

/** ============================ Exports =================================== */
export default StepActions;
