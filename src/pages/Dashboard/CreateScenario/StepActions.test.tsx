import * as React from 'react';
import { cleanup } from '@testing-library/react';

import { asyncForEach, renderContextDependentComponent } from 'navigader/util/testing';
import { DERSelection } from './common';
import StepActions from './StepActions';


describe('`Step Actions` component', () => {
  it('disables "Next" button on DER Selection page when no DER selections', () => {
    const { getByRole } = renderContextDependentComponent(
      <StepActions
        activeStep={0}
        meterGroups={null}
        scenarioName={null}
        selectedDers={[]}
        selectedMeterGroupIds={[]}
      />
    );
    
    const button = getByRole('button') as HTMLButtonElement;
    expect(button.disabled).toBeTruthy();
  });
  
  it('disables "Next" button on DER Selection page when DER selections are incomplete', async () => {
    const derNoType: Partial<DERSelection> = { configurationId: 'a', strategyId: 'b' };
    const derNoConfiguration: Partial<DERSelection> = { strategyId: 'a', type: 'Battery' };
    const derNoStrategy: Partial<DERSelection> = { configurationId: 'a', type: 'Battery' };

    await asyncForEach([derNoType, derNoConfiguration, derNoStrategy], async (partialDer) => {
      const { getByRole } = renderContextDependentComponent(
        <StepActions
          activeStep={0}
          meterGroups={null}
          scenarioName={null}
          selectedDers={[partialDer]}
          selectedMeterGroupIds={[]}
        />
      );

      const button = getByRole('button') as HTMLButtonElement;
      expect(button.disabled).toBeTruthy();
      await cleanup();
    });
  });
  
  it('enables "Next" button on DER selection page when DER selections are valid', () => {
    const validDer: DERSelection = {
      configurationId: 'a',
      strategyId: 'b',
      type: 'Battery'
    };
    
    const { getByRole } = renderContextDependentComponent(
      <StepActions
        activeStep={0}
        meterGroups={null}
        scenarioName={null}
        selectedDers={[validDer]}
        selectedMeterGroupIds={[]}
      />
    );
    
    const button = getByRole('button') as HTMLButtonElement;
    expect(button.disabled).not.toBeTruthy();
  });
});
