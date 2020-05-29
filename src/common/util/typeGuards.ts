import { NavigaderObject } from 'navigader/models';
import { MeterGroup } from 'navigader/models/meter';
import { _ } from 'navigader/util';


/** ============================ Navigader Objects ========================= */
function isNavigaderObject <T extends string>(obj: any, type: T): obj is NavigaderObject<T> {
  return obj ? obj.object_type === type : false;
}

export function isMeterGroup (obj: any): obj is MeterGroup {
  return _.some(['CustomerCluster', 'OriginFile'].map(type => isNavigaderObject(obj, type)));
}
