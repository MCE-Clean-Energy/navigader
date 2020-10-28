import {
  capitalize,
  commas,
  date,
  dollars,
  maxDecimals,
  percentage,
  pluralize,
  truncateAtLength,
} from './formatters';

describe('formatting methods', () => {
  describe('date formatters', () => {
    const janOne2020 = '2020-01-01T10:00:00';

    it('`date.standard` formats ISO times correctly', () => {
      expect(date.standard(janOne2020)).toEqual('Jan 1, 2020');
    });

    it('`date.` formats ISO times correctly', () => {
      expect(date.monthDayHourMinute(janOne2020)).toEqual('Jan 1, 10:00 AM');
    });
  });

  describe('`maxDecimals`', () => {
    it('rounds at the proper number of digits', () => {
      expect(maxDecimals(1.558, 2)).toEqual(1.56);
      expect(maxDecimals(22.22227, 2)).toEqual(22.22);
      expect(maxDecimals(42.00304, 3)).toEqual(42.003);
      expect(maxDecimals(10, 2)).toEqual(10);
      expect(maxDecimals(10, 50)).toEqual(10);
    });

    it('handles `undefined` and `null`', () => {
      expect(maxDecimals(undefined, 50)).toBeNull();
      expect(maxDecimals(null, 50)).toBeNull();
    });
  });

  describe('`pluralize`', () => {
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

  describe('`capitalize`', () => {
    it('handles the empty string', () => {
      expect(capitalize('')).toEqual('');
    });

    it('capitalizes strings correctly', () => {
      expect(capitalize('abcd')).toEqual('Abcd');
      expect(capitalize('THE DOG JUMPED OVER THE FOX')).toEqual('The dog jumped over the fox');
      expect(capitalize('InTeRnEt SaRcAsM fOnT')).toEqual('Internet sarcasm font');
    });
  });

  describe('`percentage`', () => {
    it('handles when the denominator is 0', () => {
      expect(percentage(0, 0)).toEqual('Infinity');
      expect(percentage(1, 0)).toEqual('Infinity');
      expect(percentage(0, 0, 2)).toEqual('Infinity');
    });

    it('returns percents properly', () => {
      expect(percentage(0, 1)).toEqual('0%');
      expect(percentage(0, 1, 3)).toEqual('0%');
      expect(percentage(1, 2)).toEqual('50%');
      expect(percentage(50.1, 100)).toEqual('50%');
      expect(percentage(50.1, 100, 1)).toEqual('50.1%');
      expect(percentage(3.5, 2)).toEqual('175%');
    });
  });

  describe('`dollars`', () => {
    it('adds commas', () => {
      expect(dollars(1000)).toEqual('$1,000');
      expect(dollars(987654321)).toEqual('$987,654,321');
      expect(dollars(3456.2, { cents: true })).toEqual('$3,456.20');
      expect(dollars(1234.5678, { cents: true })).toEqual('$1,234.57');
      expect(dollars(1234.5678)).toEqual('$1,235');
      expect(dollars(1234.5678, {})).toEqual('$1,235');
    });

    it('handles dollar amounts between -1 and 1', () => {
      expect(dollars(-0.1)).toEqual('-$0.10');
      expect(dollars(0.1)).toEqual('$0.10');
      expect(dollars(0.999)).toEqual('$1');
      expect(dollars(0.999, { cents: true })).toEqual('$1.00');

      // Negatives
      expect(dollars(-0.999)).toEqual('-$1');
      expect(dollars(-0.999, { cents: true })).toEqual('-$1.00');
    });

    it('handles `undefined` and `null`', () => {
      expect(dollars(undefined)).toBeUndefined();
      expect(dollars(null)).toBeUndefined();
    });
  });

  describe('`truncateAtLength`', () => {
    it('Does not truncate when given a sufficiently large length', () => {
      const str = 'the brown dog jumps over the lazy fox';
      expect(truncateAtLength(str, str.length)).toEqual(str);
    });

    it('Truncates when not given a sufficiently large length', () => {
      const str = 'the brown dog jumps over the lazy fox';
      expect(truncateAtLength(str, 10)).toEqual('the brown ...');
      expect(truncateAtLength(str, 20)).toEqual('the brown dog jumps ...');
      expect(truncateAtLength(str, 30)).toEqual('the brown dog jumps over the l...');
      expect(truncateAtLength(str, 40)).toEqual('the brown dog jumps over the lazy fox');
    });
  });

  describe('`commas`', () => {
    it('adds commas', () => {
      expect(commas(1000)).toEqual('1,000');
      expect(commas(987654321)).toEqual('987,654,321');
      expect(commas(3456.2)).toEqual('3,456.2');
      expect(commas(1234.5678)).toEqual('1,234.5678');
    });

    it('does not add commas for values less than 1000', () => {
      expect(commas(999)).toEqual('999');
      expect(commas(-999)).toEqual('-999');
      expect(commas(0)).toEqual('0');
    });
  });
});
