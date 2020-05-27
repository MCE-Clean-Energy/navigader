import * as React from 'react';
import { fireEvent } from '@testing-library/react';

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
});
