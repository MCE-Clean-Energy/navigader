import { BatteryConfiguration, BatteryStrategy } from '@nav/common/models/der';


/** ============================ Fixture creators ========================== */
export function makeDerConfiguration (configurationProps?: Partial<BatteryConfiguration>): BatteryConfiguration {
  return Object.assign({}, defaultDerConfiguration, configurationProps);
}

export function makeDerStrategy (strategyProps?: Partial<BatteryStrategy>): BatteryStrategy {
  return Object.assign({}, defaultDerStrategy, strategyProps);
}

/** ============================ Fixture data ============================== */
const defaultDerConfiguration: BatteryConfiguration = {
  id: '5a263b58-3dda-4b2d-95d4-eae17fd5d6bc',
  der_type: 'Battery',
  name: 'Basic battery',
  created_at: '2020-03-19T23:03:17.158568',
  object_type: 'BatteryConfiguration',
  data: {
    'rating': 200,
    'discharge_duration_hours': 4,
    'efficiency': 0.9
  }
};

const defaultDerStrategy: BatteryStrategy = {
  id: '7b517b5c-b22e-4586-9fbf-84146db76219',
  der_type: 'Battery',
  name: 'Flatten Evening Load Using NEM Exports',
  created_at: '2020-03-19T23:02:10.664629',
  object_type: 'BatteryStrategy',
  data: {
    'charge_schedule_frame': {
      '1':  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      '2':  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      '3':  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      '4':  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      '5':  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      '6':  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      '7':  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      '8':  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      '9':  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      '10': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      '11': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      '12': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    'discharge_schedule_frame': {
      '1':  ['inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 0, 0, 0, 0, 0, 0, 'inf', 'inf'],
      '2':  ['inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 0, 0, 0, 0, 0, 0, 'inf', 'inf'],
      '3':  ['inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 0, 0, 0, 0, 0, 0, 'inf', 'inf'],
      '4':  ['inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 0, 0, 0, 0, 0, 0, 'inf', 'inf'],
      '5':  ['inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 0, 0, 0, 0, 0, 0, 'inf', 'inf'],
      '6':  ['inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 0, 0, 0, 0, 0, 0, 'inf', 'inf'],
      '7':  ['inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 0, 0, 0, 0, 0, 0, 'inf', 'inf'],
      '8':  ['inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 0, 0, 0, 0, 0, 0, 'inf', 'inf'],
      '9':  ['inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 0, 0, 0, 0, 0, 0, 'inf', 'inf'],
      '10': ['inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 0, 0, 0, 0, 0, 0, 'inf', 'inf'],
      '11': ['inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 0, 0, 0, 0, 0, 0, 'inf', 'inf'],
      '12': ['inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 'inf', 0, 0, 0, 0, 0, 0, 'inf', 'inf']
    }
  }
};
