import _ from 'navigader/util/lodash';
import { Falsey, NavigaderObject } from './common';
import { MeterGroup } from './meter';
import { RawScenario, RawScenarioReport, RawScenarioReportSummary } from './scenario';
import {
  BatteryConfiguration, BatteryStrategy, DERConfiguration, DERStrategy, DERType
} from './der';


/** ============================ Navigader Objects ========================= */
function isNavigaderObject <T extends string>(obj: any, type: T): obj is NavigaderObject<T> {
  return obj ? obj.object_type === type : false;
}

export function isMeterGroup (obj: any): obj is MeterGroup {
  return _.some(['CustomerCluster', 'OriginFile'].map(type => isNavigaderObject(obj, type)));
}

/** ============================ Scenarios ================================= */
export function isRawScenarioReportSummary (
  summary: RawScenario['report_summary']
): summary is RawScenarioReportSummary {
  return Boolean(summary && !_.isEmpty(summary));
}

export function isRawScenarioReport (report: RawScenario['report']): report is RawScenarioReport {
  return Boolean(report && !report.hasOwnProperty('index'));
}

/** ============================ DER Objects =============================== */
function configurationGuardFactory <T extends DERConfiguration>(derType: DERType) {
  return function (configuration: DERConfiguration): configuration is T {
    return configuration.der_type === derType;
  }
}

function strategyGuardFactory <T extends DERStrategy>(derType: DERType) {
  return function (configuration: DERStrategy): configuration is T {
    return configuration.der_type === derType;
  }
}

export const isBatteryConfiguration = configurationGuardFactory<BatteryConfiguration>('Battery');
export const isBatteryStrategy = strategyGuardFactory<BatteryStrategy>('Battery');

/** ============================ Miscellaneous ============================= */
export function isTruthy <T>(x: T | Falsey): x is T {
  return Boolean(x);
}
