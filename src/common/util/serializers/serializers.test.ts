import { DateTime } from 'luxon';

import { Tuple } from 'navigader/types';
import { fixtures } from 'navigader/util/testing';
import {
  parseOriginFile,
  parsePandasFrame,
  parseReport,
  parseScenario,
  serializePandasFrame,
  serializeReport,
} from './serializers';

describe('API parsing methods', () => {
  describe('`parseOriginFile` method', () => {
    function makeOriginFile(meterCount: number, expectedCount: number | null) {
      return fixtures.makeRawOriginFile({
        meter_count: meterCount,
        metadata: {
          expected_meter_count: expectedCount,
          filename: 'origin_files/myFile.csv',
        },
      });
    }

    it('parses the `progress` key properly', () => {
      // Expected meter count is 0
      let parsedOriginFile = parseOriginFile(makeOriginFile(0, 0));
      expect(parsedOriginFile.progress.is_complete).toEqual(false);
      expect(parsedOriginFile.progress.percent_complete).toEqual(Infinity);

      // Set meter count to 0, expected count to `null`
      parsedOriginFile = parseOriginFile(makeOriginFile(0, null));
      expect(parsedOriginFile.progress.is_complete).toEqual(false);
      expect(parsedOriginFile.progress.percent_complete).toEqual(0);

      // Set meter count to 1, expected count to 7. Percent complete rounds to 1 digit
      parsedOriginFile = parseOriginFile(makeOriginFile(1, 7));
      expect(parsedOriginFile.progress.is_complete).toEqual(false);
      expect(parsedOriginFile.progress.percent_complete).toEqual(14.3);

      // Set meter count to 100, expected count to 100. `is_complete` should be true
      parsedOriginFile = parseOriginFile(makeOriginFile(100, 100));
      expect(parsedOriginFile.progress.is_complete).toEqual(true);
      expect(parsedOriginFile.progress.percent_complete).toEqual(100);
    });

    it('parses the `date_range` key properly', () => {
      // Valid date ranges
      const validDateRange: Tuple<string> = ['2019-01-01T00:00:00', '2020-01-01T00:00:00'];

      expect(
        parseOriginFile(fixtures.makeRawOriginFile({ date_range: validDateRange })).date_range
      ).toEqual([
        DateTime.fromISO(validDateRange[0]).toJSDate(),
        DateTime.fromISO(validDateRange[1]).toJSDate(),
      ]);

      // Invalid date ranges
      const invalidRange1: Tuple<string> = ['NaT', validDateRange[1]];
      const invalidRange2: Tuple<string> = [validDateRange[0], 'NaT'];
      const invalidRange3: Tuple<string> = ['NaT', 'NaT'];

      [invalidRange1, invalidRange2, invalidRange3].forEach((invalidRange) => {
        expect(
          parseOriginFile(fixtures.makeRawOriginFile({ date_range: invalidRange })).date_range
        ).toBeNull();
      });
    });
  });

  describe('`parseScenario` method', () => {
    const derConfiguration = fixtures.makeDerConfiguration();
    const derStrategy = fixtures.makeDerStrategy();
    const rawScenario = fixtures.makeRawScenario({
      ders: [
        {
          der_configuration: derConfiguration,
          der_strategy: derStrategy,
        },
      ],
      der_simulation_count: 1,
      der_simulations: ['abc'],
      expected_der_simulation_count: 1,
      meter_count: 1,
      meters: ['def'],
      report: fixtures.scenarioReport,
    });

    it('parses a scenario as expected', () => {
      expect(parseScenario(rawScenario)).toMatchObject({
        der: {
          der_configuration: derConfiguration,
          der_strategy: derStrategy,
        },
        der_simulation_count: 1,
        der_simulations: ['abc'],
        expected_der_simulation_count: 1,
        meter_count: 1,
        meters: ['def'],
        progress: {
          percent_complete: 100,
        },
      });
    });

    it('handles when `expected_der_simulation_count` is 0', () => {
      const parsed = parseScenario({
        ...rawScenario,
        der_simulation_count: 0,
        expected_der_simulation_count: 0,
      });

      expect(parsed.progress.percent_complete).toEqual(0);
    });

    it('computes `percent_complete` correctly', () => {
      type TestValue = [number, number, number];
      const testValues: TestValue[] = [
        [3, 8, 37.5],
        [0, 10, 0],
        [73, 74, 98.6],
        [99, 99, 100],
      ];

      testValues.forEach((testValue) => {
        const [der_simulation_count, expected_der_simulation_count, percent_complete] = testValue;

        const parsed = parseScenario(
          fixtures.makeRawScenario({
            der_simulation_count,
            expected_der_simulation_count,
          })
        );

        expect(parsed).toMatchObject({
          progress: {
            percent_complete,
          },
        });
      });
    });
  });

  describe('Report methods', () => {
    describe('`parseReport` method', () => {
      it('renames certain fields', () => {
        const parsed = parseReport(fixtures.scenarioReport);

        // Check that rows are renamed
        Object.values(parsed!).forEach((simulation, i) => {
          expect(simulation.SA_ID).toEqual(fixtures.scenarioReport['SA ID'][i]);
        });
      });
    });

    describe('`serializeReport` method', () => {
      it('renames certain fields', () => {
        const rawReport = serializeReport(parseReport(fixtures.scenarioReport));
        expect(rawReport).toEqual(fixtures.scenarioReport);
      });
    });
  });

  describe('Pandas methods', () => {
    describe('`parsePandasFrame` method', () => {
      it('parses values', () => {
        const parsed = parsePandasFrame({
          propA: { 0: 0, 1: 1, 2: 2 },
          propB: { 0: 'a', 1: 'b', 2: 'c' },
        });

        expect(parsed.propA.length).toEqual(3);
        expect(parsed.propB.length).toEqual(3);
        expect(parsed.propA).toEqual([0, 1, 2]);
        expect(parsed.propB).toEqual(['a', 'b', 'c']);
      });

      it('should maintain alphanumeric order', () => {
        const parsed = parsePandasFrame({
          propA: {
            '1': 1,
            '3': 3,
            '0': 'b',
            '2': null,
          },
        });

        expect(parsed.propA).toEqual(['b', 1, null, 3]);
      });
    });

    describe('`serializePandasFrame` method', () => {
      it('serializes correctly', () => {
        const rawFrame = serializePandasFrame({
          propA: [0, 1, 2],
          propB: ['a', 'b', 'c'],
        });

        expect(rawFrame.propA).toEqual({ 0: 0, 1: 1, 2: 2 });
        expect(rawFrame.propB).toEqual({ 0: 'a', 1: 'b', 2: 'c' });
      });
    });
  });
});
