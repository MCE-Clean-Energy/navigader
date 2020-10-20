import * as React from 'react';
import { cleanup } from '@testing-library/react';

import {
  asyncForEach, getCombinations, renderContextDependentComponent
} from 'navigader/util/testing';
import { stepNumbers, CostFunctionSelections, DERSelection } from './common';
import { StepActions } from './StepActions';
import { makeDataProps, makeState } from './testing';


describe('`Step Actions` component', () => {
  describe('DER selection page', () => {
    it('disables "Next" button on DER Selection page when no DER selections', () => {
      const { getAllByRole } = renderContextDependentComponent(
        <StepActions
          activeStep={stepNumbers.selectDers}
          {...makeDataProps()}
          state={makeState()}
          updateState={() => {}}
        />
      );

      const buttons = getAllByRole('button') as HTMLButtonElement[];
      expect(buttons[0].disabled).toBeFalsy();
      expect(buttons[1].disabled).toBeTruthy();
    });

    it('disables "Next" button on DER Selection page when DER selections are incomplete', async () => {
      const derNoType: Partial<DERSelection> = { configurationId: 'a', strategyId: 'b' };
      const derNoConfiguration: Partial<DERSelection> = { strategyId: 'a', type: 'Battery' };
      const derNoStrategy: Partial<DERSelection> = { configurationId: 'a', type: 'Battery' };

      await asyncForEach([derNoType, derNoConfiguration, derNoStrategy], async (partialDer) => {
        const { getAllByRole } = renderContextDependentComponent(
          <StepActions
            activeStep={stepNumbers.selectDers}
            {...makeDataProps()}
            state={makeState({ derSelections: [partialDer] })}
            updateState={() => {}}
          />
        );

        const buttons = getAllByRole('button') as HTMLButtonElement[];
        expect(buttons[0].disabled).toBeFalsy();
        expect(buttons[1].disabled).toBeTruthy();
        await cleanup();
      });
    });

    it('enables "Next" button on DER selection page when DER selections are valid', () => {
      const validDer: DERSelection = {
        configurationId: 'a',
        strategyId: 'b',
        type: 'Battery'
      };

      const { getAllByRole } = renderContextDependentComponent(
        <StepActions
          activeStep={stepNumbers.selectDers}
          {...makeDataProps()}
          state={makeState({ derSelections: [validDer] })}
          updateState={() => {}}
        />
      );

      const buttons = getAllByRole('button') as HTMLButtonElement[];
      buttons.forEach((button) => {
        expect(button.disabled).not.toBeTruthy();
      });
    });
  });

  describe('Cost function page', () => {
    function makeCostFunctionState (costFunctionKeys: Array<keyof CostFunctionSelections>) {
      const costFunctionState: CostFunctionSelections = {};
      costFunctionKeys.forEach(key => {
        costFunctionState[key] = 1;
      });
      return costFunctionState;
    }

    it('enables "Next" button on "Cost Function Selection" at all times', async () => {
      // Get all incomplete combinations of the selections
      const combinations = getCombinations<keyof CostFunctionSelections>([
        'caisoRate',
        'ghgRate',
        'ratePlan',
        'systemProfile'
      ]);
      expect(combinations).toHaveLength(Math.pow(2, 4));

      await asyncForEach(combinations, async (combination) => {
        const { getAllByRole } = renderContextDependentComponent(
          <StepActions
            activeStep={stepNumbers.selectCostFunctions}
            {...makeDataProps()}
            state={makeState({ costFunctionSelections: makeCostFunctionState(combination) })}
            updateState={() => {}}
          />
        );

        // Both buttons should be enabled
        const buttons = getAllByRole('button') as HTMLButtonElement[];
        expect(buttons[0].disabled).toBeFalsy();
        expect(buttons[1].disabled).toBeFalsy();

        await cleanup();
      });
      }
    );
  });
});
