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
  RawCustomerMeter,
  RawMeter
} from './types';


/**
 * Basic parsing function for converting a RawMeter into a Meter
 *
 * @param {RawMeter} meter - The raw meter object obtained from the back-end.
 */
export function parseMeter (meter: RawMeter): Meter {
  const meterInfo = isCustomerMeter(meter) ? meter.customermeter : meter.referencemeter;
  return {
    data: { ...meter.data, computedValues: {} },
    id: meter.id,
    metaData: {
      meterGroupIds: meter.meter_groups,
      saId: meterInfo.sa_id,
      ratePlan: meterInfo.rate_plan_name,
      type: meter.meter_type
    }
  };
}

/**
 * Type guard for the RawCustomerMeter type
 *
 * @param {Meter} meter - The meter to type check
 */
export function isCustomerMeter (meter: RawMeter): meter is RawCustomerMeter {
  return (meter as RawCustomerMeter).customermeter !== null;
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
  return {
    created: rawMeterGroup.created_at,
    data: rawMeterGroup.data,
    groupType: rawMeterGroup.meter_group_type,
    id: rawMeterGroup.id,
    meterIds: rawMeterGroup.meters,
    numMeters: rawMeterGroup.meter_count,
  };
}
