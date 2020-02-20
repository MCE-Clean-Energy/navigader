import { fireEvent, waitForElement } from '@testing-library/react'

import { fixtures, setupRouter } from '@nav/shared/util/testing';


describe('Meter Group Page', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    
    // Set up URLs to mock
    fetchMock.mockResponse(async (req) => {
      if (req.url.match(/v1\/load\/meter_group\/\d+/)) {
        return JSON.stringify(fixtures.meterGroup);
      } else if (req.url.match(/v1\/load\/meter_group/)) {
        return JSON.stringify({
          count: 1,
          next: null,
          previous: null,
          results: [fixtures.meterGroup]
        });
      } else if (req.url.match(/v1\/load\/meter/)) {
        return JSON.stringify({
          count: 1,
          next: null,
          previous: null,
          results: [fixtures.meter]
        });
      } else {
        return "default mock response";
      }
    });
  });
  
  describe('Back button', () => {
    test('Clicking the back button returns you to the load page', async () => {
      const { getByRole, getByText } = setupRouter('/meter_group/2');
      
      // Click on the back button
      expect(getByRole('button')).toBeInTheDocument();
      fireEvent.click(getByRole('button'));
    
      // check that the content changed to the new page
      await waitForElement(() => getByText('Uploaded Files'));
    });
  });
  
  describe('Header',  () => {
    test('Meter group name is rendered', async () => {
      const { getByText } = setupRouter('/meter_group/2');
      
      const expectedFileName = fixtures.meterGroup.originfile.filename.replace(/origin_files\//, '');
      await waitForElement(() => getByText(expectedFileName));
    });
  });
});
