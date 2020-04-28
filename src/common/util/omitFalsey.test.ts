import { omitFalsey } from './omitFalsey';


describe('`omitFalsey` method', () => {
  it('catches `false` values', () => {
    expect(omitFalsey(makeObjectTestData(false))).toEqual(expectedObjectOutput);
    expect(omitFalsey(makeArrayTestData(false))).toEqual(expectedArrayOutput);
  });
  
  it('catches `null` values', () => {
    expect(omitFalsey(makeObjectTestData(null))).toEqual(expectedObjectOutput);
    expect(omitFalsey(makeArrayTestData(null))).toEqual(expectedArrayOutput);
  });
  
  it('catches `undefined` values', () => {
    expect(omitFalsey(makeObjectTestData(undefined))).toEqual(expectedObjectOutput);
    expect(omitFalsey(makeArrayTestData(undefined))).toEqual(expectedArrayOutput);
  });
  
  it('catches `0` values', () => {
    expect(omitFalsey(makeObjectTestData(0))).toEqual(expectedObjectOutput);
    expect(omitFalsey(makeArrayTestData(0))).toEqual(expectedArrayOutput);
  });
  
  it('catches empty string values', () => {
    expect(omitFalsey(makeObjectTestData(''))).toEqual(expectedObjectOutput);
    expect(omitFalsey(makeArrayTestData(''))).toEqual(expectedArrayOutput);
  });
});

const expectedObjectOutput = {
  abcd: 'abcd',
  number: 456,
  array: []
};

const expectedArrayOutput = ['abcd', 456, []];

function makeObjectTestData (falseyVal: any) {
  return {
    ...expectedObjectOutput,
    badValue: falseyVal
  }
}

function makeArrayTestData (falseyVal: any) {
  return [...expectedArrayOutput, falseyVal];
}
