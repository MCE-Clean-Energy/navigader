import { omitFalsey } from './omitFalsey';


describe('`omitFalsey` method', () => {
  test('catches `false` values', () => {
    expect(omitFalsey(makeTestData(false))).toEqual(expectedOutput);
  });
  
  test('catches `null` values', () => {
    expect(omitFalsey(makeTestData(null))).toEqual(expectedOutput);
  });
  
  test('catches `undefined` values', () => {
    expect(omitFalsey(makeTestData(undefined))).toEqual(expectedOutput);
  });
  
  test('catches `0` values', () => {
    expect(omitFalsey(makeTestData(0))).toEqual(expectedOutput);
  });
  
  test('catches empty string values', () => {
    expect(omitFalsey(makeTestData(''))).toEqual(expectedOutput);
  });
});

const expectedOutput = {
  abcd: 'abcd',
  number: 456,
  array: []
};

function makeTestData (falseyVal: any) {
  return {
    ...expectedOutput,
    badValue: falseyVal
  }
}
