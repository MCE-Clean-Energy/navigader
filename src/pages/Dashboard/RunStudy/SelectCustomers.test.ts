import { fireEvent, waitForElement } from '@testing-library/react'

import * as routes from '@nav/shared/routes';
import { fixtures, setupRouter } from '@nav/shared/util/testing';


describe('"Select Customers" page', () => {
  const rawMeterGroup1 = fixtures.makeRawMeterGroup({
    id: '1',
    numMeters: 20,
    name: 'My meters'
  });
  
  const rawMeterGroup2 = fixtures.makeRawMeterGroup({
    id: '2',
    numMeters: 322,
    name: 'Residential customers'
  });
  
  beforeEach(() => {
    fetchMock.resetMocks();
    
    // Set up URLs to mock
    fetchMock.mockResponse(async (req) => {
      if (req.url.match(/v1\/load\/meter_group/)) {
        return JSON.stringify({
          count: 2,
          next: null,
          previous: null,
          results: [rawMeterGroup1, rawMeterGroup2]
        });
      } else {
        return "default mock response";
      }
    });
  });
  
  test('Proper number of chips are rendered', async () => {
    const { getAllByTestId } = setupRouter(routes.dashboard.runStudy.selectCustomers);
    
    // Wait for the fetch response
    await waitForElement(() => getAllByTestId('meter-group-chip'));
    
    // Check the number of chips
    const chips = getAllByTestId('meter-group-chip');
    expect(chips.length).toEqual(2);
    
    // Should have the names of the meter groups
    expect(chips[0].textContent).toEqual(rawMeterGroup1.name);
    expect(chips[1].textContent).toEqual(rawMeterGroup2.name);
  });
  
  test('Selecting a meter group updates the meter count', async () => {
    const { getAllByTestId, getByText } = setupRouter(routes.dashboard.runStudy.selectCustomers);
    
    // Wait for the fetch response
    await waitForElement(() => getAllByTestId('meter-group-chip'));
    
    const numMetersDiv = getByText(/Number of meters:/);
    const chips = getAllByTestId('meter-group-chip');
    
    // None should be selected at first
    expect(numMetersDiv.textContent).toEqual('Number of meters: 0');
    
    // Toggle the first meter group
    fireEvent.click(chips[0]);
    expect(numMetersDiv.textContent)
      .toEqual(`Number of meters: ${rawMeterGroup1.meter_count}`);
    
    // Untoggle the first and toggle the second
    fireEvent.click(chips[0]);
    fireEvent.click(chips[1]);
    expect(numMetersDiv.textContent)
      .toEqual(`Number of meters: ${rawMeterGroup2.meter_count}`);
    
    // Re-toggle the first
    fireEvent.click(chips[0]);
    expect(numMetersDiv.textContent).toEqual(
      `Number of meters: ${rawMeterGroup1.meter_count + rawMeterGroup2.meter_count}`
    );
  });
});
