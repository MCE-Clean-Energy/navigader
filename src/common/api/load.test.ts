import { assertHasQueryParams, makePaginationResponse } from '@nav/common/util/testing';
import { getMeters } from './load';


describe('`getMeters` method', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponse(async () => makePaginationResponse({
      meters: []
    }));
  });
  
  it('Constructs the URI correctly', () => {
    getMeters({ meterGroupId: '1', data_types: ['default'] });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    
    const callArgs = fetchMock.mock.calls[0];
    assertHasQueryParams(callArgs[0] as string, [
      ['data_types', 'default'],
      ['filter{meter_groups}', '1']
    ]);
  });
});
