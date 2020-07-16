import { fixtures, makePaginationResponse, mockFetch, renderAppRoute } from 'navigader/util/testing';


describe('Meter Group Page', () => {
  const groupName = 'Test group';
  const meterGroup = fixtures.makeOriginFile({
    name: groupName
  });
  
  beforeEach(() => {
    mockFetch([
      [/load\/meter_group\/.+\//, { meter_group: meterGroup }],
      ['/load/meter_group/', makePaginationResponse({ meter_groups: [meterGroup] })],
      ['/load/meter/', makePaginationResponse({ meters: [fixtures.meter] })]
    ]);
  });
  
  describe('Header',  () => {
    it('Meter group name is rendered', async () => {
      const { findByTestId } = renderAppRoute('/load/group/2');
      expect((await findByTestId('page-header')).textContent).toEqual(groupName);
    });
  });
});
