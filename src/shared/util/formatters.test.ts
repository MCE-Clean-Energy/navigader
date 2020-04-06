import { maxDecimals, standardDate } from './formatters';


const janOne2020 = '2020-01-01T10:00:00';

/** ============================ Tests ===================================== */
describe('`standardDate` formatter method', () => {
  it('Formats ISO times correctly', () => {
    const formatted = standardDate(janOne2020);
    expect(formatted).toEqual('Jan 1, 2020');
  });
});

describe('`maxDecimals` formatter method', () => {
  it('Rounds at the proper number of digits', () => {
    expect(maxDecimals(1.558, 2)).toEqual(1.56);
    expect(maxDecimals(22.22227, 2)).toEqual(22.22);
    expect(maxDecimals(42.00304, 3)).toEqual(42.003);
    expect(maxDecimals(10, 2)).toEqual(10);
    expect(maxDecimals(10, 50)).toEqual(10);
  });
});
