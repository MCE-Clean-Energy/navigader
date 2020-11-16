import * as React from 'react';

import { formatters } from 'navigader/util';
import { Typography } from './Typography';

/** ============================ Types ===================================== */
type StandardDateProps = { date?: Date | string };

/** ============================ Components ================================ */
export const StandardDate: React.FC<StandardDateProps> = ({ date }) => {
  if (!date) return null;
  return (
    <Typography noWrap variant="body2">
      {formatters.date.standard(date)}
    </Typography>
  );
};
