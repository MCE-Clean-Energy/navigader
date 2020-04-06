import { getMeters } from './load';


describe('`getMeters` method', () => {
  let mockFn: jest.SpyInstance;
  
  beforeEach(() => mockFn = jest.spyOn(window, 'fetch'));
  afterEach(() => mockFn.mockRestore());
  
  it('Constructs the URI correctly', () => {
    getMeters({ meterGroupId: '1', data_types: ['default'] });
    expect(mockFn).toHaveBeenCalledTimes(1);
    
    const callArgs = mockFn.mock.calls[0];
    expect(callArgs[0]).toContain('/v1/load/meter/?data_types=default&filter{meter_groups}=1');
  })
});
