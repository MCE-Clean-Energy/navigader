import { fixtures } from '@nav/shared/util/testing';
import * as util from './util';


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
      meters: ['def']
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
        },
        
        // TODO: test `parseReport` method
        report: undefined
      });
    });
    
    it('computes the `progress` object properly', () => {
      type TestValue = [number, number, boolean, number];
      const testValues: TestValue[] = [
        [3, 8, false, 37.5],
        [0, 0, false, Infinity],
        [73, 74, false, 98.6],
        [99, 99, true, 100]
      ];
      
      testValues.forEach((testValue) => {
        const [
          der_simulation_count,
          expected_der_simulation_count,
          is_complete,
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
            is_complete,
            percent_complete
          }
        });
      });
    });
  })
});
