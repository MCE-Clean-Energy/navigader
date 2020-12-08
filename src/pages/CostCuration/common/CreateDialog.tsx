import { ObjectWithId, TableRef } from 'navigader/types';

export type DialogProps<T extends ObjectWithId> = {
  open: boolean;
  onClose: () => void;
  tableRef: TableRef<T>;
};
