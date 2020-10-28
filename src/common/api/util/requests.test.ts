import { filterClause } from 'navigader/util';
import { assertHasQueryParams } from 'navigader/util/testing';
import { getRequest } from './requests';

describe('`getRequest` method', () => {
  let mockFn: jest.SpyInstance;

  beforeEach(() => {
    mockFn = jest.spyOn(window, 'fetch');
  });
  afterEach(() => mockFn.mockRestore());

  it('Appends primitive query params as expected', () => {
    getRequest('myRoute', { param1: 'abc', param2: 3 });
    expect(mockFn).toHaveBeenCalledTimes(1);

    const callArgs = mockFn.mock.calls[0];
    expect(callArgs[0]).toEqual('myRoute?param1=abc&param2=3');
  });

  it('Appends array query params as expected', () => {
    getRequest('myRoute', { param1: ['a', 'b', 'c'] });
    expect(mockFn).toHaveBeenCalledTimes(1);

    const callArgs = mockFn.mock.calls[0];
    const expectedValue = `myRoute?param1=${encodeURIComponent('a,b,c')}`;
    expect(callArgs[0]).toEqual(expectedValue);
  });

  describe('`dynamic-rest` special parameters', () => {
    it('Handles `includes` and `excludes` as expected', () => {
      getRequest('myRoute', {
        exclude: 'ders.*',
        include: ['ders.configuration', 'meter_groups.*', 'meters.rate_plan'],
      });
      expect(mockFn).toHaveBeenCalledTimes(1);

      const callArgs = mockFn.mock.calls[0];
      assertHasQueryParams(callArgs[0], [
        ['exclude[]', ['ders.*']],
        ['include[]', ['ders.configuration', 'meter_groups.*', 'meters.rate_plan']],
      ]);
    });

    it('Handles `filter` as expected', () => {
      getRequest('myRoute', {
        filter: {
          'meter_group': filterClause.equals(123),
          'scenario.name': filterClause.equals('my-scenario'),
        },
      });

      expect(mockFn).toHaveBeenCalledTimes(1);

      const callArgs = mockFn.mock.calls[0];
      const expectedValue =
        'myRoute?' + 'filter{meter_group}=123&' + 'filter{scenario.name}=my-scenario';

      expect(callArgs[0]).toEqual(expectedValue);
    });
  });

  it('Provides route as given if no query params provided', () => {
    getRequest('myRoute');
    expect(mockFn).toHaveBeenCalledTimes(1);
    const callArgs = mockFn.mock.calls[0];
    expect(callArgs[0]).toEqual('myRoute');
  });
});
