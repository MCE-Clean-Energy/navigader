import { RawScenario } from 'navigader/types';
import { fixtures } from 'navigader/util/testing';
import {
  parseMeterGroup, parsePandasFrame, parseReport, parseScenario, serializePandasFrame,
  serializeReport
} from './serializers';


describe('API parsing methods', () => {
  describe('`parseMeterGroup` method', () => {
    const customerCluster = fixtures.makeCustomerCluster();
    const originFile = fixtures.makeOriginFile({
      metadata: {
        expected_meter_count: 0,
        filename: 'origin_files/myFile.csv'
      }
    });
    
    function parseOriginFile (meterCount: number, expectedCount: number | null) {
      return parseMeterGroup({
        ...originFile,
        meter_count: meterCount,
        metadata: {
          expected_meter_count: expectedCount,
          filename: 'origin_files/myFile.csv'
        }
      });
    }
    
    it('should strip the `origin_files/` prefix from origin filenames', () => {
      expect(parseMeterGroup(originFile)).toMatchObject({
        metadata: {
          filename: 'myFile.csv',
        }
      });
    });
    
    it('parses the `progress` key properly', () => {
      const parsedCustomerCluster = parseMeterGroup(customerCluster);
      expect(parsedCustomerCluster.progress.is_complete).toEqual(true);
      expect(parsedCustomerCluster.progress.percent_complete).toEqual(100);
      
      // Expected meter count is 0
      let parsedOriginFile = parseMeterGroup(originFile);
      expect(parsedOriginFile.progress.is_complete).toEqual(false);
      expect(parsedOriginFile.progress.percent_complete).toEqual(Infinity);
      
      // Set meter count to 0, expected count to `null`
      parsedOriginFile = parseOriginFile(0, null);
      expect(parsedOriginFile.progress.is_complete).toEqual(false);
      expect(parsedOriginFile.progress.percent_complete).toEqual(0);
      
      // Set meter count to 1, expected count to 7. Percent complete rounds to 1 digit
      parsedOriginFile = parseOriginFile(1, 7);
      expect(parsedOriginFile.progress.is_complete).toEqual(false);
      expect(parsedOriginFile.progress.percent_complete).toEqual(14.3);
      
      // Set meter count to 100, expected count to 100. `is_complete` should be true
      parsedOriginFile = parseOriginFile(100, 100);
      expect(parsedOriginFile.progress.is_complete).toEqual(true);
      expect(parsedOriginFile.progress.percent_complete).toEqual(100);
    });
  });
  
  describe('`parseScenario` method', () => {
    const derConfiguration = fixtures.makeDerConfiguration();
    const derStrategy = fixtures.makeDerStrategy();
    const rawScenario = fixtures.makeRawScenario({
      ders: [{
        der_configuration: derConfiguration,
        der_strategy: derStrategy
      }],
      der_simulation_count: 1,
      der_simulations: ['abc'],
      expected_der_simulation_count: 1,
      metadata: undefined,
      meter_count: 1,
      meters: ['def'],
      report: fixtures.scenarioReport
    });
    
    it('parses a scenario as expected', () => {
      const parsed = parseScenario(rawScenario);
      expect(parsed).toMatchObject({
        der: {
          der_configuration: derConfiguration,
          der_strategy: derStrategy
        },
        der_simulation_count: 1,
        der_simulations: ['abc'],
        expected_der_simulation_count: 1,
        metadata: undefined,
        meter_count: 1,
        meters: ['def'],
        progress: {
          is_complete: true,
          percent_complete: 100
        }
      });
    });
    
    it('handles when `expected_der_simulation_count` is 0', () => {
      const parsed = parseScenario({
        ...rawScenario,
        der_simulation_count: 0,
        expected_der_simulation_count: 0
      });
      
      expect(parsed.progress.percent_complete).toEqual(0);
    });
    
    it('computes `has_run` correctly', () => {
      type TestValue = [number, number, boolean, number];
      const testValues: TestValue[] = [
        [3, 8, false, 37.5],
        [0, 10, false, 0],
        [73, 74, false, 98.6],
        [99, 99, true, 100]
      ];
      
      testValues.forEach((testValue) => {
        const [
          der_simulation_count,
          expected_der_simulation_count,
          has_run,
          percent_complete
        ] = testValue;
        
        const parsed = parseScenario(
          fixtures.makeRawScenario({
            der_simulation_count,
            expected_der_simulation_count
          })
        );
        
        expect(parsed).toMatchObject({
          progress: {
            has_run,
            percent_complete
          }
        });
      });
    });

    it('computes `is_complete` correctly', () => {
      const emptyReport = { index: {} };
      const emptySummary = {};
      const fullReport = fixtures.scenarioReport;
      const fullSummary = fixtures.scenarioReportSummary;

      type TestCase = [RawScenario['report'], RawScenario['report_summary'], boolean | undefined];
      const testCases: TestCase[] = [
        [undefined, undefined, false],
        [undefined, emptySummary, false],
        [undefined, fullSummary, true],
        [emptyReport, undefined, false],
        [emptyReport, emptySummary, false],
        [emptyReport, fullSummary, true],
        [fullReport, undefined, true],
        [fullReport, emptySummary, true],
        [fullReport, fullSummary, true],
      ];

      testCases.forEach(([report, summary, hasAggregated]) => {
        const hasntRunParsed = parseScenario(
          fixtures.makeRawScenario({
            der_simulation_count: 0,
            expected_der_simulation_count: 10,
            report,
            report_summary: summary
          })
        );
        
        const hasRunParsed = parseScenario(
          fixtures.makeRawScenario({
            der_simulation_count: 10,
            expected_der_simulation_count: 10,
            report,
            report_summary: summary
          })
        );

        expect(hasntRunParsed.progress.is_complete).toEqual(false);
        expect(hasRunParsed.progress.is_complete).toEqual(hasAggregated);
      });
    });

    it('combines procurement values in the report summary', () => {
      const parsed = parseScenario(
        fixtures.makeRawScenario({
          report_summary: {
            0: {
              ...fixtures.scenarioReportSummary[0],
              PRC_LMP2018Delta: 1,
              PRC_LMP2018PostDER: 2,
              PRC_LMP2018PreDER: 3,
              PRC_LMP2019Delta: 4,
              PRC_LMP2019PostDER: 5,
              PRC_LMP2019PreDER: 6,
            },
          }
        })
      );
      
      expect(parsed.report_summary).toMatchObject({
        PRC_LMPDelta: 5,
        PRC_LMPPostDER: 7,
        PRC_LMPPreDER: 9
      });
    });
    
    it('combines procurement values in the report', () => {
      const parsed = parseScenario(
        fixtures.makeRawScenario({
          report: {
            ...fixtures.scenarioReport,
            ID: ['a', 'b'],
            PRC_LMP2018Delta: [1, 2],
            PRC_LMP2018PostDER: [3, 4],
            PRC_LMP2018PreDER: [5, 6],
            PRC_LMP2019Delta: [7, 8],
            PRC_LMP2019PostDER: [9, 10],
            PRC_LMP2019PreDER: [11, 12],
          }
        })
      );
      
      expect(parsed.report).toMatchObject({
        a: {
          PRC_LMPDelta: 8,
          PRC_LMPPostDER: 12,
          PRC_LMPPreDER: 16,
        },
        b: {
          PRC_LMPDelta: 10,
          PRC_LMPPostDER: 14,
          PRC_LMPPreDER: 18
        }
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
          propB: { 0: 'a', 1: 'b', 2: 'c' }
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
            '2': null
          }
        });

        expect(parsed.propA).toEqual(['b', 1, null, 3]);
      });
    });
    
    describe('`serializePandasFrame` method', () => {
      it('serializes correctly', () => {
        const rawFrame = serializePandasFrame({
          propA: [0, 1, 2],
          propB: ['a', 'b', 'c']
        });
        
        expect(rawFrame.propA).toEqual({ 0: 0, 1: 1, 2: 2 });
        expect(rawFrame.propB).toEqual({ 0: 'a', 1: 'b', 2: 'c' });
      });
    });
  });
});
