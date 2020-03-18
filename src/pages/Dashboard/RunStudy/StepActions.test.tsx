import * as React from 'react';

import { renderContextDependentComponent } from '@nav/shared/util/testing';
import StepActions from './StepActions';
import { DERSelection } from './util';


describe('`Step Actions` component', () => {
  it('disables "Next" button on DER Selection page when no DER selections', () => {
    const { getByRole } = renderContextDependentComponent(
      <StepActions activeStep={0} selectedDers={[]} />
    );
    
    const button = getByRole('button') as HTMLButtonElement;
    expect(button.disabled).toBeTruthy();
  });
  
  it('disables "Next" button on DER Selection page when DER selections are incomplete', () => {
    const derNoType: Partial<DERSelection> = { configurationId: 'a', strategyId: 'b' };
    const derNoConfiguration: Partial<DERSelection> = { strategyId: 'a', type: 'Battery' };
    const derNoStrategy: Partial<DERSelection> = { configurationId: 'a', type: 'Battery' };
    
    [derNoType, derNoConfiguration, derNoStrategy].forEach((partialDer) => {
      const { getByRole } = renderContextDependentComponent(
        <StepActions activeStep={0} selectedDers={[partialDer]} />
      );
      
      const button = getByRole('button') as HTMLButtonElement;
      expect(button.disabled).toBeTruthy();
    });
  });
  
  it('enables "Next" button on DER selection page when DER selections are valid', () => {
    const validDer: DERSelection = {
      configurationId: 'a',
      strategyId: 'b',
      type: 'Battery'
    };
    
    const { getByRole } = renderContextDependentComponent(
      <StepActions activeStep={0} selectedDers={[validDer]} />
    );
    
    const button = getByRole('button') as HTMLButtonElement;
    expect(button.disabled).not.toBeTruthy();
  });
});
