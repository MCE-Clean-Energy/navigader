import _ from 'lodash';

import { Falsey, NavigaderObject } from './common';
import { OriginFile, RawOriginFile } from './meter';
import { RawScenario, RawScenarioReport, RawScenarioReportSummary, Scenario } from './scenario';
import {
  BatteryConfiguration,
  BatteryStrategy,
  DERConfiguration,
  DERStrategy,
  DERType,
} from './der';

/** ============================ Navigader Objects ========================= */
function navigaderObjectGuardFactory<T extends NavigaderObject<any>>(objectType: string) {
  return function (obj?: NavigaderObject<any>): obj is T {
    return obj?.object_type === objectType;
  };
}

/** ============================ Meter Groups ============================== */
export const isScenario = navigaderObjectGuardFactory<Scenario & RawScenario>('Scenario');
export const isOriginFile = navigaderObjectGuardFactory<OriginFile & RawOriginFile>('OriginFile');

/** ============================ Scenarios ================================= */
export function isRawScenarioReportSummary(
  summary: RawScenario['report_summary']
): summary is RawScenarioReportSummary {
  return Boolean(summary && !_.isEmpty(summary));
}

export function isRawScenarioReport(report: RawScenario['report']): report is RawScenarioReport {
  return Boolean(report && !report.hasOwnProperty('index'));
}

/** ============================ DER Objects =============================== */
function configurationGuardFactory<T extends DERConfiguration>(derType: DERType) {
  return function (configuration: DERConfiguration): configuration is T {
    return configuration.der_type === derType;
  };
}

function strategyGuardFactory<T extends DERStrategy>(derType: DERType) {
  return function (configuration: DERStrategy): configuration is T {
    return configuration.der_type === derType;
  };
}

export const isBatteryConfiguration = configurationGuardFactory<BatteryConfiguration>('Battery');
export const isBatteryStrategy = strategyGuardFactory<BatteryStrategy>('Battery');

/** ============================ Miscellaneous ============================= */
export function isTruthy<T>(x: T | Falsey): x is T {
  return Boolean(x);
}
