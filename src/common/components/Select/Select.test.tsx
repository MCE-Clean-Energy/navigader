import * as React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';

import _ from 'navigader/util/lodash';
import { renderContextDependentComponent } from 'navigader/util/testing';
import { Select } from './Select';


describe('`Select` component', () => {
  it('can sort the passed options', async () => {
    const spy = jest.fn();
    const dogs = [
      { name: 'Dora', color: 'brown', sound: 'howl' },
      { name: 'Scout', color: 'white', sound: 'roof!' },
      { name: 'Libby', color: 'black', sound: 'WOOF' }
    ];
    
    const { findAllByRole, getByRole } = renderContextDependentComponent(
      <Select
        label="Choose Best Dog"
        onChange={spy}
        options={dogs}
        renderOption="name"
        sorted
        value={undefined}
      />
    );
    
    // Open the menu
    const menuRoot = getByRole('button');
    fireEvent.mouseDown(menuRoot);

    // Assert they render in sorted order
    const options = await findAllByRole('option');
    expect(options[0]).toHaveTextContent('Dora');
    expect(options[1]).toHaveTextContent('Libby');
    expect(options[2]).toHaveTextContent('Scout');
    
    // Select "Libby"
    fireEvent.click(options[1]);
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(dogs[2]);
  });
  
  it('can render options under groupings', async () => {
    const dogs = [
      { name: 'Dora', breed: 'mutt' },
      { name: 'Scout', breed: 'shepherd' },
      { name: 'Libby', breed: 'mutt' }
    ];
    
    const { getByRole, getAllByRole } = renderContextDependentComponent(
      <Select
        label="Choose Best Dog"
        optionSections={[
          { title: 'Mutts', options: _.filter(dogs, { breed: 'mutt' })},
          { title: 'Shepherds', options: _.filter(dogs, { breed: 'shepherd' })}
        ]}
        renderOption="name"
        sorted
        value={undefined}
      />
    );
    
    // Open the menu
    fireEvent.mouseDown(getByRole('button'));
    
    await waitFor(() => getAllByRole('option'));
    const options = getAllByRole('option');
    
    // There should be 5 options, 3 for the dogs and 2 for subheaders
    expect(options).toHaveLength(5);
    
    const optionsText = [
      'Mutts',
      'Dora',
      'Libby',
      
      'Shepherds',
      'Scout'
    ];
    
    options.forEach((option, i) => expect(option).toHaveTextContent(optionsText[i]));
  });
});
