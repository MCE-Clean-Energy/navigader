import { RawPaginationSet } from '@nav/shared/types';
import * as utils from './util';


/** ============================ Tests ===================================== */
describe('`appendId` method', () => {
  it('Appends a / when no id is provided', () => {
    const uriFactory = utils.appendId('myRoute');
    const uri = uriFactory();
    expect(uri).toEqual('myRoute/');
  });
  
  it('Appends the ID correctly when provided', () => {
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
  
  it('Appends primitive query params as expected', () => {
    utils.getRequest('myRoute', { param1: 'abc', param2: 3 });
    expect(mockFn).toHaveBeenCalledTimes(1);
    
    const callArgs = mockFn.mock.calls[0];
    expect(callArgs[0]).toEqual('myRoute?param1=abc&param2=3');
  });
  
  it('Appends array query params as expected', () => {
    utils.getRequest('myRoute', { param1: ['a', 'b', 'c'] });
    expect(mockFn).toHaveBeenCalledTimes(1);
    
    const callArgs = mockFn.mock.calls[0];
    const expectedValue = `myRoute?param1=${encodeURIComponent('a,b,c')}`;
    expect(callArgs[0]).toEqual(expectedValue);
  });
  
  describe('`dynamic-rest` special parameters', () => {
    it('Handles `includes` and `excludes` as expected', () => {
      utils.getRequest('myRoute', {
        exclude: 'ders.*',
        include: ['ders.configuration', 'meter_groups.*', 'meters.rate_plan']
      });
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      const callArgs = mockFn.mock.calls[0];
      const expectedValue = 'myRoute?' +
        'exclude[]=ders.*&' +
        'include[]=ders.configuration&' +
        'include[]=meter_groups.*&' +
        'include[]=meters.rate_plan';
      
      expect(callArgs[0]).toEqual(expectedValue);
    });
    
    it('Handles `filter` as expected', () => {
      utils.getRequest('myRoute', {
        filter: {
          meter_group: 123,
          'scenario.name': 'my-scenario',
          bad_param: undefined
        }
      });
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      const callArgs = mockFn.mock.calls[0];
      const expectedValue = 'myRoute?' +
        'filter{meter_group}=123&' +
        'filter{scenario.name}=my-scenario';
      
      expect(callArgs[0]).toEqual(expectedValue);
    });
  });
  
  it('Provides route as given if no query params provided', () => {
    utils.getRequest('myRoute');
    expect(mockFn).toHaveBeenCalledTimes(1);
    const callArgs = mockFn.mock.calls[0];
    expect(callArgs[0]).toEqual('myRoute');
  });
});

describe('`parsePaginationSet` method', () => {
  type Coordinate = { x: number, y: number };
  const paginationSetFlat: RawPaginationSet<Coordinate[]> = {
    count: 3,
    results: [
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 4 }
    ]
  };
  
  const paginationSetNested: RawPaginationSet<{ coordinates: Coordinate[] }> = {
    count: 3,
    results: {
      coordinates: [
        { x: 1, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 4 }
      ]
    }
  };
  
  const invertCoord = ({ x, y }: Coordinate): Coordinate => ({ y: x, x: y });
  
  it('Parses schema input with no parse function correctly', () => {
    const parsed = utils.parsePaginationSet(paginationSetNested, 'coordinates');
    
    expect(parsed.count).toEqual(paginationSetNested.count);
    for (let i = 0; i < parsed.data.length; i++) {
      expect(parsed.data[i].x).toEqual(paginationSetNested.results.coordinates[i].x);
      expect(parsed.data[i].y).toEqual(paginationSetNested.results.coordinates[i].y);
    }
  });
  
  it('Parses schema input with parse function correctly', () => {
    const parsed = utils.parsePaginationSet(
      paginationSetNested,
      ({ coordinates }) => coordinates.map(invertCoord)
    );
    
    expect(parsed.count).toEqual(paginationSetNested.count);
    for (let i = 0; i < parsed.data.length; i++) {
      expect(parsed.data[i].x).toEqual(paginationSetNested.results.coordinates[i].y);
      expect(parsed.data[i].y).toEqual(paginationSetNested.results.coordinates[i].x);
    }
  });
});
