import range from 'lodash/range';

import { RawPandasFrame } from '@nav/shared/types';
import { parsePandasFrame } from './parsePandasFrame';


describe('`parsePandasFrame` method', () => {
  it('parses values', () => {
    const parsed = parsePandasFrame(
      makeRawPandasFrame({
        propA: 1,
        propB: 'c'
      }, 3)
    );
    
    expect(parsed.propA.length).toEqual(3);
    expect(parsed.propB.length).toEqual(3);
    expect(parsed.propA).toEqual([1, 1, 1]);
    expect(parsed.propB).toEqual(['c', 'c', 'c']);
  });
  
  it('should maintain alphanumeric order', () => {
    const parsed = parsePandasFrame({
      propA: {
        '1': 1,
        '3': 3,
        '0': 'b',
        '2': null
      }
    });
    
    expect(parsed.propA).toEqual(['b', 1, null, 3]);
  });
});

function makeRawPandasFrame <RowType extends Record<string, any>>(pandaRow: RowType, numRows: number) {
  return Object.keys(pandaRow).reduce((frame, key: keyof RowType) => {
    frame[key] = range(numRows).reduce((frameObj, i) => {
      frameObj[i] = pandaRow[key];
      return frameObj;
    }, {} as { [i: number]: any });
    return frame;
  }, {} as RawPandasFrame<RowType>);
}
