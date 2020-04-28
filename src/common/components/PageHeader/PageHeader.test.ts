import { fireEvent, waitForElement } from '@testing-library/react';

import * as routes from '@nav/common/routes';
import { fixtures, renderAppRoute } from '@nav/common/util/testing';


describe('Back button', () => {
  const meterGroup = fixtures.makeOriginFile({
    name: 'Test group'
  });

  beforeEach(() => {
    fetchMock.resetMocks();

    // Set up URLs to mock
    fetchMock.mockResponse(async (req) => {
      if (req.url.match(/v1\/load\/meter_group\/.+\//)) {
        return JSON.stringify({
          meter_group: meterGroup
        });
      } else if (req.url.match(/v1\/load\/meter_group\//)) {
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

  it('Clicking the back button returns you to the previous page', async () => {
    const { getByRole, getByText } = renderAppRoute([routes.load, routes.meterGroup('random-id')], 1);

    // Click on the back button
    expect(getByRole('back-button')).toBeInTheDocument();
    fireEvent.click(getByRole('back-button'));

    // check that the page header changed to the prior page
    await waitForElement(() => getByText('Uploaded Files'));
  });
});
