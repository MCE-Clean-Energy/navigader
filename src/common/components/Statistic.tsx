import * as React from 'react';

import { Typography } from './Typography';

/** ============================ Types ===================================== */
type ValueType = number | string | React.ReactElement;
type StatisticProps = {
  className?: string;
  title?: React.ReactNode;
  value: ValueType;
};

/** ============================ Components ===================================== */
export const Statistic: React.FC<StatisticProps> = (props) => {
  const { className, title, value } = props;

  return (
    <div className={className}>
      <Typography emphasis="bold" useDiv variant="body2">
        {title}
      </Typography>
      <Typography useDiv variant="body2">
        {value}
      </Typography>
    </div>
  );
};
