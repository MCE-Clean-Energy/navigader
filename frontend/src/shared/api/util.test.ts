import * as utils from './util';


/** ============================ Tests ===================================== */
describe('`appendId` method', () => {
  test('Appends a / when no id is provided', () => {
    const uriFactory = utils.appendId('myRoute');
    const uri = uriFactory();
    expect(uri).toEqual('myRoute/');
  });
  
  test('Appends the ID correctly when provided', () => {
    const uriFactory = utils.appendId('myRoute');
    const uriNumeric = uriFactory(1);
    const uuid = '5eec8ec9-8f01-48b6-bc84-8042ed6ec3e1';
    const uriString = uriFactory(uuid);
    expect(uriNumeric).toEqual('myRoute/1/');
    expect(uriString).toEqual(`myRoute/${uuid}/`);
  });
});

describe('`getRequest` method', () => {
  let mockFn: jest.SpyInstance;
  
  beforeEach(() => { mockFn = jest.spyOn(window, 'fetch') });
  afterEach(() => mockFn.mockRestore());
  
  test('Appends primitive query params as expected', () => {
    utils.getRequest('myRoute', { param1: 'abc', param2: 3 });
    expect(mockFn).toHaveBeenCalledTimes(1);
    
    const callArgs = mockFn.mock.calls[0];
    expect(callArgs[0]).toEqual('myRoute?param1=abc&param2=3');
  });
  
  test('Appends array query params as expected', () => {
    utils.getRequest('myRoute', { param1: ['a', 'b', 'c'] });
    expect(mockFn).toHaveBeenCalledTimes(1);
    
    const callArgs = mockFn.mock.calls[0];
    const expectedValue = `myRoute?param1=${encodeURIComponent('a,b,c')}`;
    expect(callArgs[0]).toEqual(expectedValue);
  });
  
  test('Provides route as given if no query params provided', () => {
    utils.getRequest('myRoute');
    expect(mockFn).toHaveBeenCalledTimes(1);
    const callArgs = mockFn.mock.calls[0];
    expect(callArgs[0]).toEqual('myRoute');
  });
});
