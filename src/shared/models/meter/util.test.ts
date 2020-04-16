import { fixtures } from '@nav/shared/util/testing';
import * as utils from './util';


/** ============================ Tests ===================================== */
describe('`parseMeterGroup` method', () => {
  const customerCluster = fixtures.makeCustomerCluster();
  const originFile = fixtures.makeOriginFile({
    metadata: {
      expected_meter_count: 0,
      filename: 'origin_files/myFile.csv'
    }
  });
  
  it('should strip the `origin_files/` prefix from origin filenames', () => {
    expect(utils.parseMeterGroup(originFile)).toMatchObject({
      metadata: {
        filename: 'myFile.csv',
      }
    });
  });
  
  it('just returns a customer cluster unchanged', () => {
    expect(utils.parseMeterGroup(customerCluster) === customerCluster).toBeTruthy();
  });
});
