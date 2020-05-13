import { fixtures } from 'navigader/util/testing';
import * as util from './util';
import { RawScenario } from './types';


describe('Scenario model utilities', () => {
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
      const parsed = util.parseScenario(rawScenario);
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
      const parsed = util.parseScenario({
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
        
        const parsed = util.parseScenario(
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
        const hasntRunParsed = util.parseScenario(
          fixtures.makeRawScenario({
            der_simulation_count: 0,
            expected_der_simulation_count: 10,
            report,
            report_summary: summary
          })
        );
        
        const hasRunParsed = util.parseScenario(
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
  });
  
  describe('`parseReport` method', () => {
    it('renames certain fields', () => {
      const parsed = util.parseReport(fixtures.scenarioReport);

      // Check that rows are renamed
      Object.values(parsed!.rows).forEach((simulation, i) => {
        expect(simulation.SA_ID).toEqual(fixtures.scenarioReport['SA ID'][i]);
      });
      
      // Check that columns are renamed
      expect(parsed?.columns.SA_ID).toEqual(fixtures.scenarioReport['SA ID']);
    });
  });
});
