import { fixtures } from '@nav/shared/util/testing';
import * as utils from './util';


/** ============================ Tests ===================================== */
describe('`parseMeterGroup` method', () => {
  const originFile = fixtures.makeRawOriginFile({
    created: 'Yesterday',
    data: {},
    fileName: 'myFile.csv',
    id: 'abcd',
    meterIds: [],
    name: 'My File',
    numMeters: 0,
    numMetersExpected: 0
  });
  
  const customerCluster = fixtures.makeRawCustomerCluster({
    created: 'Yesterday',
    data: {},
    id: 'abcd',
    meterIds: [],
    name: '',
    numMeters: 0,
  });
  
  it('Successfully parses origin files', () => {
    // Assert the meter group is unparsed
    expect(originFile).toEqual({
      created_at: 'Yesterday',
      data: {},
      id: 'abcd',
      metadata: {
        expected_meter_count: 0,
        filename: 'myFile.csv',
        owners: []
      },
      meter_count: 0,
      meters: [],
      name: 'My File',
      object_type: 'OriginFile',
    });
    
    // Assert parsing works as expected
    expect(utils.parseMeterGroup(originFile)).toEqual({
      created: 'Yesterday',
      data: {},
      fileName: 'myFile.csv',
      id: 'abcd',
      objectType: 'OriginFile',
      meterIds: [],
      name: 'My File',
      numMeters: 0,
      numMetersExpected: 0
    });
  });
  
  it('Successfully parses customer clusters', () => {
    // Assert the meter group is unparsed
    expect(customerCluster).toEqual({
      created_at: 'Yesterday',
      data: {},
      id: 'abcd',
      metadata: {},
      meter_count: 0,
      meters: [],
      name: '',
      object_type: 'CustomerCluster',
    });
    
    // Assert parsing works as expected
    expect(utils.parseMeterGroup(customerCluster)).toEqual({
      created: 'Yesterday',
      data: {},
      id: 'abcd',
      objectType: 'CustomerCluster',
      meterIds: [],
      name: '',
      numMeters: 0,
    });
  });
});
