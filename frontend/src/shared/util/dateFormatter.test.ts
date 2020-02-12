import dateFormatter from './dateFormatter';


const janOne2020 = '2020-01-01T10:00:00';

/** ============================ Tests ===================================== */
test('Formats ISO times correctly', () => {
  const formatted = dateFormatter(janOne2020);
  expect(formatted).toEqual('Jan 1, 2020');
});
