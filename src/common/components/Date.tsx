import * as React from 'react';

import { Nullable, Tuple } from 'navigader/types';
import { formatters } from 'navigader/util';

import { Typography } from './Typography';

/** ============================ Types ===================================== */
type StandardDateProps = { date?: Date | string };
type StandardDateRangeProps = { range?: Nullable<Tuple<Date>> };

/** ============================ Components ================================ */
const DateRange: React.FC<StandardDateRangeProps> = ({ range }) => (
  <Typography variant="body2">
    {range ? formatters.date.range(range, formatters.date.standard) : '-'}
  </Typography>
);

export const StandardDate = Object.assign(
  function StandardDate({ date }: StandardDateProps) {
    if (!date) return null;
    return (
      <Typography noWrap variant="body2">
        {formatters.date.standard(date)}
      </Typography>
    );
  },
  { Range: DateRange }
);
