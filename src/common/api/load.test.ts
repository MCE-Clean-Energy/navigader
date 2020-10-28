import { assertHasQueryParams, makePaginationResponse, mockFetch } from 'navigader/util/testing';
import { getMeters } from './load';

describe('`getMeters` method', () => {
  beforeEach(() => {
    mockFetch([['/load/meter/', makePaginationResponse({ meters: [] })]]);
  });

  it('Constructs the URI correctly', () => {
    getMeters({ data_types: ['default'], meterGroupId: '1', page: 1, page_size: 10 });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const callArgs = fetchMock.mock.calls[0];
    assertHasQueryParams(callArgs[0] as string, [
      ['data_types', 'default'],
      ['filter{meter_groups}', '1'],
      ['page', '1'],
      ['page_size', '10'],
    ]);
  });
});
