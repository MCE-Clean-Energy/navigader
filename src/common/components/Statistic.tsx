/**
 * Taken from the `antd` framework: https://ant.design/components/statistic/
 */
import * as React from 'react';
import padEnd from 'lodash/padEnd';

import { makeStylesHook } from '@nav/common/styles';
import { Typography, TypographyProps } from './Typography';


/** ============================ Types ===================================== */
type ValueType = number | string | React.ReactElement;
type FormatConfig = {
  decimalSeparator?: string;
  groupSeparator?: string;
  precision?: number;
};

type StatisticProps = FormatConfig & {
  className?: string;
  prefix?: React.ReactNode;
  style?: React.CSSProperties;
  suffix?: React.ReactNode;
  title?: React.ReactNode;
  value?: ValueType;
  valueRender?: (node: React.ReactNode) => React.ReactNode;
  valueStyle?: React.CSSProperties;
  variant?: TypographyProps['variant']
}

type NumberProps = FormatConfig & {
  value: ValueType;
}

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(() => ({
  prefix: {
    display: 'inline-block',
    marginRight: 4
  },
  suffix: {
    display: 'inline-block',
    marginLeft: 4
  },
  title: {
    marginBottom: 4
  }
}), 'Statistic');

/** ============================ Components ===================================== */
const StatisticNumber: React.FC<NumberProps> = props => {
  const { value, precision, decimalSeparator } = props;

  let valueNode: React.ReactNode;

  const val: string = String(value);
  const cells = val.match(/^(-?)(\d*)(\.(\d+))?$/);

  // Process if illegal number
  if (!cells) {
    valueNode = val;
  } else {
    const negative = cells[1];
    let int = cells[2] || '0';
    let decimal = cells[4] || '';

    if (typeof precision === 'number') {
      decimal = padEnd(decimal, precision, '0').slice(0, precision);
    }

    if (decimal) {
      decimal = `${decimalSeparator}${decimal}`;
    }
    
    valueNode = [
      <span key="int">{negative}{int}</span>,
      decimal && <Typography key="decimal" variant="body1">{decimal}</Typography>
    ];
  }

  return <span>{valueNode}</span>;
};

export const Statistic: React.FC<StatisticProps> = (props) => {
  const {
    className,
    style,
    valueStyle,
    value = 0,
    title,
    valueRender,
    prefix,
    suffix,
    variant = 'h5'
  } = props;

  let valueNode: React.ReactNode = typeof value === 'number'
    ? <StatisticNumber {...props} value={value} />
    : <span>{value}</span>;
  
  if (valueRender) {
    valueNode = valueRender(valueNode);
  }
  
  const classes = useStyles();
  return (
    <div className={className} style={style}>
      {title && (
        <div>
          <Typography
            className={classes.title}
            emphasis="secondary"
            variant="body2"
          >
            {title}
          </Typography>
        </div>
      )}
      <Typography style={valueStyle} variant={variant}>
        {prefix && <span className={classes.prefix}>{prefix}</span>}
        {valueNode}
        {suffix && <Typography className={classes.suffix} variant="subtitle1">{suffix}</Typography>}
      </Typography>
    </div>
  );
};

Statistic.defaultProps = {
  decimalSeparator: '.',
  groupSeparator: ',',
};
