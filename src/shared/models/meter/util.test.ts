import { fixtures } from '@nav/shared/util/testing';
import * as utils from './util';


/** ============================ Tests ===================================== */
describe('`parseMeterGroup` method', () => {
  const meterGroup = fixtures.makeRawMeterGroup({
    created: 'Yesterday',
    data: {},
    fileName: 'myFile.csv',
    id: 'abcd',
    groupType: 'OriginFile',
    meterIds: [],
    name: 'My File',
    numMeters: 0,
    numMetersExpected: 0
  });
  
  test('Successfully parses meter groups', () => {
    // Assert the meter group is unparsed
    expect(meterGroup).toEqual({
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
    expect(utils.parseMeterGroup(meterGroup)).toEqual({
      created: 'Yesterday',
      data: {},
      fileName: 'myFile.csv',
      id: 'abcd',
      groupType: 'OriginFile',
      meterIds: [],
      name: 'My File',
      numMeters: 0,
      numMetersExpected: 0
    })
  });
});
