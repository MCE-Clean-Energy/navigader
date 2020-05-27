import { fixtures, renderAppRoute } from 'navigader/util/testing';


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
  
  describe('Header',  () => {
    it('Meter group name is rendered', async () => {
      const { findByTestId } = renderAppRoute('/load/group/2');
      expect((await findByTestId('page-header')).textContent).toEqual(groupName);
    });
  });
});
