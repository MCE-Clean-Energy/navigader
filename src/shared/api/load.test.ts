import { getMeters } from './load';


describe('`getMeters` method', () => {
  let mockFn: jest.SpyInstance;
  
  beforeEach(() => mockFn = jest.spyOn(window, 'fetch'));
  afterEach(() => mockFn.mockRestore());
  
  test('Constructs the URI correctly', () => {
    getMeters({ meterGroupId: '1', types: ['default'] });
    expect(mockFn).toHaveBeenCalledTimes(1);
    
    const callArgs = mockFn.mock.calls[0];
    expect(callArgs[0]).toEqual('/beo/v1/load/meter/?data_types=default&meter_groups=1');
  })
});
