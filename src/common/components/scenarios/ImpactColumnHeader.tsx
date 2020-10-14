import * as React from 'react';

import { makeStylesHook } from 'navigader/styles';
import { omitFalsey } from 'navigader/util';
import * as Flex from '../Flex';
import { InfoIcon } from '../Icon';
import { Table, TableCellProps } from '../Table';
import { Typography } from '../Typography';


/** ============================ Types ===================================== */
type ImpactColumnHeaderProps = TableCellProps & {
  averaged?: boolean;
  column: string;
  info: {
    measuresImpact: string;
    negativeMeans: string;
    positiveMeans: string;
  };
  units: React.ReactNode;
};

/** ============================ Styles ==================================== */
const useImpactColumnHeaderStyles = makeStylesHook(theme => ({
  header: {
    whiteSpace: 'nowrap'
  },
  // This is needed to compensate for the subscript 2 in CO2 for the GHG column
  units: {
    height: `calc(${theme.typography.body2.lineHeight}rem + 3px)`
  }
}), 'ImpactColumnHeader');

/** ============================ Components ================================ */
export const ImpactColumnHeader: React.FC<ImpactColumnHeaderProps> = (props) => {
  const { averaged = false, column, info, units, ...rest } = props;
  const classes = useImpactColumnHeaderStyles();
  const infoString = omitFalsey([
    `Measures net impact ${info.measuresImpact}`,
    `A negative value indicates ${info.negativeMeans}`,
    `A positive value indicates ${info.positiveMeans}.`
  ]).join('. ');

  return (
    <Table.Cell align="right" {...rest}>
      <div>
        <Flex.Container alignItems="center" justifyContent="flex-end" wrap={false}>
          <div className={classes.header}>{column}</div>
          <InfoIcon text={infoString} />
        </Flex.Container>
        <Typography className={classes.units} color="textSecondary" useDiv variant="body2">
          ({units}/year{averaged && '/SAID'})
        </Typography>
      </div>
    </Table.Cell>
  );
};
