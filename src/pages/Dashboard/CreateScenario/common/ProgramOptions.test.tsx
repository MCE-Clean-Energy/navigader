import * as React from 'react';
import { fireEvent } from '@testing-library/react';

import { fixtures, renderContextDependentComponent } from 'navigader/util/testing';
import { ProgramOptions } from './ProgramOptions';

describe('`ProgramOptions` component', () => {
  it('Renders the strategies grouped by their objective', async () => {
    const { getByLabelText, getAllByRole } = renderContextDependentComponent(
      <ProgramOptions
        configurations={[]}
        der={{ type: 'Battery' }}
        strategies={[
          fixtures.makeDerStrategy({ name: 'Reduce bill 1', objective: 'reduce_bill' }),
          fixtures.makeDerStrategy({ name: 'Reduce GHG', objective: 'reduce_ghg' }),
          fixtures.makeDerStrategy({ name: 'Flatten load', objective: 'load_flattening' }),
          fixtures.makeDerStrategy({ name: 'Reduce bill 2', objective: 'reduce_bill' }),
          fixtures.makeDerStrategy({ name: 'Minimize RA', objective: 'reduce_cca_finance' }),
        ]}
        update={() => {}}
      />
    );

    // Click the strategy select to open it
    const strategyLabel = getByLabelText('Strategy');
    fireEvent.mouseDown(strategyLabel);
    const options = getAllByRole('option');

    const optionText = [
      // section 1
      'Bill Reduction',
      'Reduce bill 1',
      'Reduce bill 2',

      // section 2
      'GHG Reduction',
      'Reduce GHG',

      // section 3
      'Load Flattening',
      'Flatten load',

      // section 4
      'Minimize CCA Financial Impacts',
      'Minimize RA',
    ];

    // Should be one option per strategy, plus one per strategy sub-header
    expect(options).toHaveLength(9);
    options.forEach((option, i) => expect(option).toHaveTextContent(optionText[i]));
  });
});
