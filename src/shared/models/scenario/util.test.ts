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
        metadata: null,
        meter_count: 1,
        meter_group: null,
        meters: ['def'],
        progress: {
          is_complete: true,
          percent_complete: 100
        },
        
        // TODO: test `parseReport` method
        report: null
      })
    });
  })
});
