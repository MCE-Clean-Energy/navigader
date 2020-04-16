import every from 'lodash/every';
import isArray from 'lodash/isArray';

import { typeGuards } from '@nav/shared/util';
import { LoadType, LoadTypeMap, MeterDataField, MeterGroup } from './types';


/**
 * A type guard for checking that the meter has a particular data field or fields.
 *
 * @param {MeterDataField} data - The meter's data object
 * @param {LoadType | LoadType[]} loadType - The load type(s) to check for in the meter data
 */
export function hasDataField <T extends LoadType>(
  data: MeterDataField,
  loadType: T | T[]
): data is Pick<LoadTypeMap, T> {
  return isArray(loadType)
    ? every(loadType, t => data.hasOwnProperty(t))
    : data.hasOwnProperty(loadType);
}

/**
 * Basic parsing function for meter groups
 *
 * @param {MeterGroup} meterGroup - The raw meter group object obtained from the back-end
 */
export function parseMeterGroup (meterGroup: MeterGroup): MeterGroup {
  if (meterGroup.object_type === 'CustomerCluster') return meterGroup;
  return {
    ...meterGroup,
    metadata: {
      ...meterGroup.metadata,
      filename: meterGroup.metadata.filename.replace(/origin_files\//, '')
    }
  };
}

/**
 * Returns a display name for the given meter group
 *
 * @param {MeterGroup} meterGroup: the meter group object to display. The overload that accepts
 *   undefined is there to enable usage in situations where the meter group is optional
 */
export function getMeterGroupDisplayName (meterGroup: any) {
  if (!typeGuards.isMeterGroup(meterGroup)) return '';
  switch (meterGroup.object_type) {
    case 'OriginFile':
      return meterGroup.name || meterGroup.metadata.filename;
    case 'CustomerCluster':
      // TODO: How do we represent a customer cluster without a name?
      return meterGroup.name || '';
  }
}
