import * as React from 'react';
import { useDispatch } from 'react-redux';

import * as api from 'navigader/api';
import { Button, Flex } from 'navigader/components';
import { useRouter } from 'navigader/routes';
import { setMessage } from 'navigader/store/slices/ui';
import { OriginFile, Scenario } from 'navigader/types';
import { omitFalsey, printWarning } from 'navigader/util';
import _ from 'navigader/util/lodash';
import {
  CreateScenarioScreenProps, stepPaths, stepNumbers, validateCustomerSelections,
  validateDerSelections
} from './common';


/** ============================ Types ===================================== */
type StepActionProps = CreateScenarioScreenProps & { activeStep: number };

/** ============================ Components ================================ */
export const StepActions: React.FC<StepActionProps> = (props) => {
  const {
    activeStep,
    originFiles,
    scenarios,
    state
  } = props;

  const routeTo = useRouter();
  const dispatch = useDispatch();
  const [createInProcess, setCreateInProcess] = React.useState(false);
  const prevButton = activeStep === 0
    ? null
    : <Button onClick={goBack}>Back</Button>;

  const onReviewPage = activeStep === stepNumbers.review;
  const nextButtonText = onReviewPage ? 'Create Scenario' : 'Next';
  const nextButtonCb = onReviewPage ? createScenario : goForward;
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

  /** ========================== Callbacks ================================= */
  function goBack () {
    if (activeStep === 0) return;
    routeTo.page(stepPaths[activeStep - 1])();
  }

  function goForward () {
    if (activeStep === stepPaths.length - 1) return;
    routeTo.page(stepPaths[activeStep + 1])();
  }

  /**
   * Validates all inputs and makes a POST request to the back end to create a study/scenarios.
   */
  async function createScenario () {
    const {
      costFunctionSelections,
      derSelections,
      originFileSelections,
      name,
      scenarioSelections
    } = state;

    // Validate all inputs
    if (!(
      !!name &&
      validateDerSelections(derSelections) &&
      validateCustomerSelections(
        getCustomerSelection(originFiles, originFileSelections),
        getCustomerSelection(scenarios, scenarioSelections)
      )
    )) {
      printWarning('`createScenario` method ran with invalid inputs!');
      return;
    }

    try {
      setCreateInProcess(true);

      const response = await api.postScenario(
        name,
        [...originFileSelections, ...scenarioSelections],
        derSelections,
        costFunctionSelections
      );

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
    routeTo.dashboard.base();
  }

  /**
   * Triggered when the POST request fails. Shows an error message.
   */
  function handleStudyCreationFailure () {
    setCreateInProcess(false);
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
    const hasScenarioName = !!state.name;
    const hasValidDerSelections = validateDerSelections(state.derSelections);
    const hasValidCustomerSelections = validateCustomerSelections(
      getCustomerSelection(originFiles, state.originFileSelections),
      getCustomerSelection(scenarios, state.scenarioSelections)
    );

    switch (activeStep) {
      case stepNumbers.review:
        return !(
          hasValidDerSelections &&
          hasValidCustomerSelections &&
          hasScenarioName
        ) || createInProcess;
      case stepNumbers.selectCostFunctions:
        return false;
      case stepNumbers.selectCustomers:
        return !hasValidCustomerSelections;
      case stepNumbers.selectDers:
        return !hasValidDerSelections;
    }
  }
};

/** ============================ Helpers =================================== */
function getCustomerSelection <T extends OriginFile | Scenario>(
  customers: T[],
  ids: string[]
): T[] {
  return omitFalsey(ids.map(id => _.find(customers, ['id', id])));
}
