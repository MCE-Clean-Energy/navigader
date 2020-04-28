import some from 'lodash/some';

import { NavigaderObject } from '@nav/common/models';
import { MeterGroup } from '@nav/common/models/meter';


/** ============================ Navigader Objects ========================= */
function isNavigaderObject <T extends string>(obj: any, type: T): obj is NavigaderObject<T> {
  return obj ? obj.object_type === type : false;
}

export function isMeterGroup (obj: any): obj is MeterGroup {
  return some(['CustomerCluster', 'OriginFile'].map(type => isNavigaderObject(obj, type)));
}
