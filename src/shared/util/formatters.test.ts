import { capitalize, maxDecimals, pluralize, standardDate } from './formatters';


describe('`standardDate` formatter method', () => {
  it('formats ISO times correctly', () => {
    const formatted = standardDate(janOne2020);
    expect(formatted).toEqual('Jan 1, 2020');
  });
});

describe('`maxDecimals` formatter method', () => {
  it('rounds at the proper number of digits', () => {
    expect(maxDecimals(1.558, 2)).toEqual(1.56);
    expect(maxDecimals(22.22227, 2)).toEqual(22.22);
    expect(maxDecimals(42.00304, 3)).toEqual(42.003);
    expect(maxDecimals(10, 2)).toEqual(10);
    expect(maxDecimals(10, 50)).toEqual(10);
  });
});

describe('`pluralize` formatter method', () => {
  it('handles words that do not end in -y', () => {
    expect(pluralize('dog', 0)).toEqual('dogs');
    expect(pluralize('dog', 1)).toEqual('dog');
    expect(pluralize('dog', 2)).toEqual('dogs');
  });
  
  it('handles words that do end in -y', () => {
    expect(pluralize('pony', 0)).toEqual('ponies');
    expect(pluralize('pony', 1)).toEqual('pony');
    expect(pluralize('pony', 2)).toEqual('ponies');
  });
  
  it('handles a manually provided `pluralForm`', () => {
    expect(pluralize('octopus', 0, 'octopi')).toEqual('octopi');
    expect(pluralize('octopus', 1, 'octopi')).toEqual('octopus');
    expect(pluralize('octopus', 2, 'octopi')).toEqual('octopi');
  });
});

describe('`capitalize` formatter method', () => {
  it('handles the empty string', () => {
    expect(capitalize('')).toEqual('');
  });
  
  it('capitalizes strings correctly', () => {
    expect(capitalize('abcd')).toEqual('Abcd');
    expect(capitalize('THE DOG JUMPED OVER THE FOX')).toEqual('The dog jumped over the fox');
    expect(capitalize('InTeRnEt SaRcAsM fOnT')).toEqual('Internet sarcasm font');
  });
});

/** ============================ Fixtures ================================== */
const janOne2020 = '2020-01-01T10:00:00';
