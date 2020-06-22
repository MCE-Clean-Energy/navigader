import * as React from 'react';
import { cleanup, fireEvent } from '@testing-library/react'

import _ from 'navigader/util/lodash';
import { asyncForEach, fixtures, renderContextDependentComponent } from 'navigader/util/testing';
import { SelectCustomers } from './SelectCustomers';


describe('"Select Customers" page', () => {
  const meterGroup1 = fixtures.makeOriginFile({
    id: '1',
    meter_count: 20,
    name: 'My meters'
  });
  
  const meterGroup2 = fixtures.makeOriginFile({
    id: '2',
    meter_count: 322,
    name: 'Residential customers'
  });
  
  it('Proper number of chips are rendered', async () => {
    const { getAllByTestId } = renderContextDependentComponent(
      <SelectCustomers
        meterGroups={[meterGroup1, meterGroup2]}
        selectedMeterGroupIds={[]}
        updateMeterGroups={() => {}}
      />
    );
    
    // Check the number of chips
    const chips = getAllByTestId('meter-group-chip');
    expect(chips.length).toEqual(2);
    
    // Should have the names of the meter groups
    expect(chips[0].textContent).toEqual(meterGroup1.name);
    expect(chips[1].textContent).toEqual(meterGroup2.name);
  });
  
  it('Selecting a meter group triggers callback', async () => {
    const updateMeterGroupsMock = jest.fn();
    const { getAllByTestId } = renderContextDependentComponent(
      <SelectCustomers
        meterGroups={[meterGroup1, meterGroup2]}
        selectedMeterGroupIds={[]}
        updateMeterGroups={updateMeterGroupsMock}
      />
    );
    
    const chips = getAllByTestId('meter-group-chip');
    
    fireEvent.click(chips[0]);
    expect(updateMeterGroupsMock).toHaveBeenCalledTimes(1);
    expect(updateMeterGroupsMock.mock.calls[0][0]).toEqual([meterGroup1.id]);
    
    fireEvent.click(chips[1]);
    expect(updateMeterGroupsMock).toHaveBeenCalledTimes(2);
    expect(updateMeterGroupsMock.mock.calls[1][0]).toEqual([meterGroup2.id]);
  });
  
  it('Renders the meter count', async () => {
    // All combinations of two meter groups
    const meterGroupCombinations = [
      [],
      [meterGroup1],
      [meterGroup2],
      [meterGroup1, meterGroup2]
    ];
    
    await asyncForEach(meterGroupCombinations, async (selectedMeterGroups) => {
      const { getByText } = renderContextDependentComponent(
        <SelectCustomers
          meterGroups={[meterGroup1, meterGroup2]}
          selectedMeterGroupIds={_.map(selectedMeterGroups, 'id')}
          updateMeterGroups={() => {}}
        />
      );
      
      const expectedNumMeters = selectedMeterGroups.reduce(
        (numMetersPrev, curMeterGroup) => numMetersPrev + curMeterGroup.meter_count,
        0
      );
      
      const numMetersDiv = getByText(/Number of meters:/);
      expect(numMetersDiv.textContent).toEqual(`Number of meters: ${expectedNumMeters}`);
      await cleanup();
    });
  });
});
