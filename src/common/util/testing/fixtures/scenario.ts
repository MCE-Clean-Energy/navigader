import { RawScenario, Scenario } from 'navigader/types';


/** ============================ Fixture creators ========================== */
export function makeRawScenario (scenarioProps?: Partial<RawScenario>): RawScenario {
  return Object.assign({}, defaultRawScenario, scenarioProps);
}

export function makeScenario (scenarioProps?: Partial<Scenario>): Scenario {
  return Object.assign({}, defaultScenario, scenarioProps);
}

/** ============================ Fixture data ============================== */
const defaultRawScenario: RawScenario = {
  id: '9071c48a-d5d3-48d0-83da-c06863e8682a',
  name: 'Default Scenario',
  created_at: '2020-03-26T00:13:25.451606',
  object_type: 'Scenario',
  data: {},
  ders: [
    {
      der_configuration: {
        der_type: 'Battery',
        id: '5a263b58-3dda-4b2d-95d4-eae17fd5d6bc',
        name: 'Basic battery',
        created_at: '2020-03-19T23:03:17.158568',
        object_type: 'BatteryConfiguration',
        data: {
          rating: 200,
          discharge_duration_hours: 4,
          efficiency: 0.9
        }
      },
      der_strategy: {
        created_at: '2020-03-19T23:02:10.406731',
        der_type: 'Battery',
        description: '',
        id: 'b6e80862-1483-4648-9a0a-5b9830db6715',
        name: 'Minimize Clean Net Short 2030 - charge threshold: None kw, discharge threshold: 0 kw (level: 8)',
        object_type: 'BatteryStrategy',
        objective: 'reduce_ghg'
      }
    }
  ],
  der_simulation_count: 0,
  expected_der_simulation_count: 16,
  meter_count: 16,
  meter_group: '6c3e9adc-9b42-4d36-90fa-4a95d7eddad7',
  metadata: {
    id: '9071c48a-d5d3-48d0-83da-c06863e8682a',
    start: '1677-09-21T00:12:43.145225',
    end_limit: '2262-04-11T23:47:16.000001',
    der_strategy: 'b6e80862-1483-4648-9a0a-5b9830db6715',
    der_configuration: '5a263b58-3dda-4b2d-95d4-eae17fd5d6bc',
    rate_plan_name: 'E-1 - Baseline Region Q'
  }
};

const defaultScenario: Scenario = {
  id: '9071c48a-d5d3-48d0-83da-c06863e8682a',
  name: 'Default Scenario',
  created_at: '2020-03-26T00:13:25.451606',
  object_type: 'Scenario',
  data: {},
  der: {
    der_configuration: {
      id: '5a263b58-3dda-4b2d-95d4-eae17fd5d6bc',
      der_type: 'Battery',
      name: 'Basic battery',
      created_at: '2020-03-19T23:03:17.158568',
      object_type: 'BatteryConfiguration',
      data: {
        rating: 200,
        discharge_duration_hours: 4,
        efficiency: 0.9
      }
    },
    der_strategy: {
      created_at: '2020-03-19T23:02:10.406731',
      der_type: 'Battery',
      description: '',
      id: 'b6e80862-1483-4648-9a0a-5b9830db6715',
      name: 'Minimize Clean Net Short 2030 - charge threshold: None kw, discharge threshold: 0 kw (level: 8)',
      object_type: 'BatteryStrategy',
      objective: 'reduce_ghg'
    }
  },
  der_simulation_count: 0,
  expected_der_simulation_count: 16,
  meter_count: 16,
  meter_group: undefined,
  metadata: {
    id: '9071c48a-d5d3-48d0-83da-c06863e8682a',
    start: '1677-09-21T00:12:43.145225',
    end_limit: '2262-04-11T23:47:16.000001',
    der_strategy: 'b6e80862-1483-4648-9a0a-5b9830db6715',
    der_configuration: '5a263b58-3dda-4b2d-95d4-eae17fd5d6bc',
    rate_plan_name: 'E-1 - Baseline Region Q'
  },
  progress: {
    has_run: false,
    is_complete: false,
    percent_complete: 0,
  },
  report: undefined
};

