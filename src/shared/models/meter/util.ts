import every from 'lodash/every';
import isArray from 'lodash/isArray';
import pick from 'lodash/pick';

import { typeGuards } from '@nav/shared/util';
import { LoadType, LoadTypeMap, MeterDataField, MeterGroup, RawMeterGroup } from './types';


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
 * Basic parsing function for converting a RawMeterGroup into a MeterGroup
 *
 * @param {RawMeterGroup} rawMeterGroup - The raw meter group object obtained from the back-end
 */
export function parseMeterGroup (rawMeterGroup: RawMeterGroup): MeterGroup {
  const commonFields = {
    ...pick(rawMeterGroup, 'created_at', 'id', 'name'),
    data: rawMeterGroup.data,
    meterIds: rawMeterGroup.meters,
    numMeters: rawMeterGroup.meter_count,
  };
  
  switch (rawMeterGroup.object_type) {
    case 'OriginFile':
      return {
        ...commonFields,
        object_type: 'OriginFile',
        fileName: rawMeterGroup.metadata.filename.replace(/origin_files\//, ''),
        numMetersExpected: rawMeterGroup.metadata.expected_meter_count
      };
    case 'CustomerCluster':
      return {
        ...commonFields,
        object_type: 'CustomerCluster'
      };
  }
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
      return meterGroup.name || meterGroup.fileName;
    case 'CustomerCluster':
      // TODO: How do we represent a customer cluster without a name?
      return meterGroup.name || '';
  }
}
