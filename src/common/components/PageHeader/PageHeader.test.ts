import { fireEvent } from '@testing-library/react';

import { routes } from 'navigader/routes';
import { fixtures, makePaginationResponse, mockFetch, renderAppRoute } from 'navigader/util/testing';


describe('Back button', () => {
  const meterGroup = fixtures.makeOriginFile({
    name: 'Test group'
  });

  beforeEach(() => {
    mockFetch([
      [/load\/meter_group\/.+\//, { meter_group: meterGroup }],
      ['/load/meter_group/', makePaginationResponse({ meter_groups: [meterGroup] })],
      ['/load/meter/', makePaginationResponse({ meters: [fixtures.meter] })]
    ]);
  });

  it('Clicking the back button returns you to the previous page', async () => {
    const { findByText, getByRole } = renderAppRoute([routes.load.base, routes.load.meterGroup(meterGroup.id)], 1);

    // Click on the back button
    expect(getByRole('back-button')).toBeInTheDocument();
    fireEvent.click(getByRole('back-button'));

    // check that the page header changed to the prior page
    expect(await findByText('Uploaded Files')).toBeInTheDocument();
  });
});
