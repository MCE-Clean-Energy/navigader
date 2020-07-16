import { IdType } from './common';
import { DataTypeMap, RawDataTypeMap } from './data';


type CAISORateFilters = Partial<{
  DATA_ITEM: 'LMP_PRC'
}>;

type CAISORateCommon = {
  filters: CAISORateFilters;
  id: IdType;
  name: string;
  year: number;
  
  object_type: 'CAISORate';
};

export type RawCAISORate = CAISORateCommon & { data: RawDataTypeMap<'$/kwh', 'start'>; };
export type CAISORate = CAISORateCommon & { data: DataTypeMap; };
