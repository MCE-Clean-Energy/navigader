import { fireEvent, waitForElement } from '@testing-library/react'

import { fixtures, renderAppRoute } from '@nav/shared/util/testing';


describe('Meter Group Page', () => {
  const groupName = 'Test group';
  const meterGroup = fixtures.makeOriginFile({
    name: groupName
  });
  
  beforeEach(() => {
    fetchMock.resetMocks();
    
    // Set up URLs to mock
    fetchMock.mockResponse(async (req) => {
      if (req.url.match(/v1\/load\/meter_group\/\d+/)) {
        return JSON.stringify({
          meter_group: meterGroup
        });
      } else if (req.url.match(/v1\/load\/meter_group/)) {
        return JSON.stringify({
          count: 1,
          next: null,
          previous: null,
          results: {
            meter_groups: [meterGroup]
          }
        });
      } else if (req.url.match(/v1\/load\/meter/)) {
        return JSON.stringify({
          count: 1,
          next: null,
          previous: null,
          results: {
            meters: [fixtures.meter]
          }
        });
      } else {
        return "default mock response";
      }
    });
  });
  
  describe('Back button', () => {
    it('Clicking the back button returns you to the load page', async () => {
      const { getByRole, getByText } = renderAppRoute('/load/group/2');
      
      // Click on the back button
      expect(getByRole('back-button')).toBeInTheDocument();
      fireEvent.click(getByRole('back-button'));
    
      // check that the content changed to the new page
      await waitForElement(() => getByText('Uploaded Files'));
    });
  });
  
  describe('Header',  () => {
    it('Meter group name is rendered', async () => {
      const { getByText } = renderAppRoute('/load/group/2');
      await waitForElement(() => getByText(groupName));
    });
  });
});
