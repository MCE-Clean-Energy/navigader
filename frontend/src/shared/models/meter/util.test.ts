import { fixtures } from '@nav/shared/util/testing';
import * as utils from './util';


/** ============================ Tests ===================================== */
describe('`parseMeterGroup` method', () => {
  const meterGroup = fixtures.makeRawMeterGroup({
    created: 'Yesterday',
    data: {},
    fileName: 'myFile',
    id: 'abcd',
    groupType: 'originfile',
    meterIds: [],
    numMeters: 0
  });
  
  test('Successfully parses meter groups', () => {
    // Assert the meter group is unparsed
    expect(meterGroup).toEqual({
      created_at: 'Yesterday',
      data: {},
      id: 'abcd',
      meter_group_type: 'originfile',
      meter_count: 0,
      meters: [],
      originfile: {
        filename: 'myFile',
        owners: []
      }
    });
    
    // Assert parsing works as expected
    expect(utils.parseMeterGroup(meterGroup)).toEqual({
      created: 'Yesterday',
      data: {},
      fileName: 'myFile',
      id: 'abcd',
      groupType: 'originfile',
      meterIds: [],
      numMeters: 0
    })
  });
});
