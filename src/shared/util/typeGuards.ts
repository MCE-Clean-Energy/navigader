import some from 'lodash/some';

import { MeterGroup } from '@nav/shared/models/meter';
import { NavigaderObject } from '@nav/shared/types';


/** ============================ Navigader Objects ========================= */
function isNavigaderObject <T extends string>(obj: any, type: T): obj is NavigaderObject<T> {
  return obj ? obj.object_type === type : false;
}

export function isMeterGroup (obj: any): obj is MeterGroup {
  return some(['CustomerCluster', 'OriginFile'].map(type => isNavigaderObject(obj, type)));
}
