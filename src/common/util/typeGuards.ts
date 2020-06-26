import {
  MeterGroup, NavigaderObject, RawScenario, RawScenarioReport, RawScenarioReportSummary
} from 'navigader/types';
import _ from 'navigader/util/lodash';


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
