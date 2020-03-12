import every from 'lodash/every';
import isArray from 'lodash/isArray';
import {
  ComputedValueTypes,
  LoadType,
  LoadTypeMap,
  Meter,
  MeterDataField,
  MeterGroup,
  RawMeterGroup,
  RawMeter
} from './types';


/**
 * Basic parsing function for converting a RawMeter into a Meter
 *
 * @param {RawMeter} meter - The raw meter object obtained from the back-end.
 */
export function parseMeter (meter: RawMeter): Meter {
  return {
    data: { ...meter.data, computedValues: {} },
    id: meter.id,
    metaData: {
      meterGroupIds: meter.meter_groups,
      saId: meter.metadata.sa_id,
      ratePlan: meter.metadata.rate_plan_name,
      type: meter.object_type
    }
  };
}

/**
 * Produces a computed value using meter data. If the value has been computed before, the value will
 * be reused. If it hasn't been computed yet, it is computed and returned.
 *
 * @param {Meter} meter - The meter to compute the value on
 * @param {key of ComputedValueTypes} computedValue - The computed value to get
 */
export function getComputedValue <
  K extends keyof ComputedValueTypes
  >(meter: Meter, computedValue: K) {
  const { computedValues } = meter.data;
  
  // If the value has been computed already, return it
  if (computedValues.hasOwnProperty(computedValue)) {
    return computedValues[computedValue];
  }
  
  // Don't have it-- compute it
  switch (computedValue) {
    case 'maxKw': {
      if (hasDataField(meter.data, 'default')) {
        return setComputedValue(meter, 'maxKw', Math.max(...meter.data.default.kw));
      }
      return null;
    }
    default: return null;
  }
}

/**
 * Sets and returns a computed value on a meter
 *
 * @param {Meter} meter - The meter to set the computed value on
 * @param {key of ComputedValueTypes} valueName - The name of the computed value being set
 * @param {ComputedValueTypes[valueName]} value - The value to set
 */
function setComputedValue <
  K extends keyof ComputedValueTypes
  >(meter: Meter, valueName: K, value: ComputedValueTypes[K])
{
  meter.data.computedValues[valueName] = value;
  return value;
}

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
    created: rawMeterGroup.created_at,
    data: rawMeterGroup.data,
    id: rawMeterGroup.id,
    meterIds: rawMeterGroup.meters,
    name: rawMeterGroup.name || null,
    numMeters: rawMeterGroup.meter_count,
  };
  
  switch (rawMeterGroup.object_type) {
    case 'OriginFile':
      return {
        ...commonFields,
        groupType: 'OriginFile',
        fileName: rawMeterGroup.metadata.filename.replace(/origin_files\//, ''),
        numMetersExpected: rawMeterGroup.metadata.expected_meter_count
      };
    case 'CustomerCluster':
      return {
        ...commonFields,
        groupType: 'CustomerCluster'
      };
  }
}

/**
 * Returns a display name for the given meter group
 *
 * @param {MeterGroup} meterGroup: the meter group object to display
 */
export function getMeterGroupDisplayName (meterGroup: MeterGroup): string {
  switch (meterGroup.groupType) {
    case 'OriginFile':
      return meterGroup.name || meterGroup.fileName;
    case 'CustomerCluster':
      // TODO: How do we represent a customer cluster without a name?
      return meterGroup.name || '';
  }
}
