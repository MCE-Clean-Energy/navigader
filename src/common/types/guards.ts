import _ from 'navigader/util/lodash';
import { Falsey, NavigaderObject } from './common';
import { MeterGroup } from './meter';
import { RawScenario, RawScenarioReport, RawScenarioReportSummary } from './scenario';


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

/** ============================ Miscellaneous ============================= */
export function isTruthy <T>(x: T | Falsey): x is T {
  return Boolean(x);
}
