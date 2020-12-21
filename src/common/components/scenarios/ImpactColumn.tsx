import * as React from 'react';

import { makeStylesHook } from 'navigader/styles';
import { AlertType, CostFunctionShort, Maybe, Nullable } from 'navigader/types';
import { omitFalsey } from 'navigader/util';

import * as Flex from '../Flex';
import { HoverText } from '../HoverText';
import { InfoIcon } from '../Icon';
import { Table, TableCellProps } from '../Table';
import { Typography } from '../Typography';

/** ============================ Types ===================================== */
type ImpactColumnProps = React.PropsWithChildren<{
  children: (n: Maybe<number>) => React.ReactNode;
  costFn: Nullable<CostFunctionShort>;
  costCalculation: Maybe<number>;
}>;

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
const useImpactColumnHeaderStyles = makeStylesHook(
  (theme) => ({
    header: {
      whiteSpace: 'nowrap',
    },
    // This is needed to compensate for the subscript 2 in CO2 for the GHG column
    units: {
      height: `calc(${theme.typography.body2.lineHeight}rem + 3px)`,
    },
  }),
  'ImpactColumnHeader'
);

/** ============================ Components ================================ */
const ImpactColumnHeader: React.FC<ImpactColumnHeaderProps> = (props) => {
  const { averaged = false, column, info, units, ...rest } = props;
  const classes = useImpactColumnHeaderStyles();
  const infoString = omitFalsey([
    `Measures net impact ${info.measuresImpact}`,
    `A negative value indicates ${info.negativeMeans}`,
    `A positive value indicates ${info.positiveMeans}.`,
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

export const ImpactColumn = Object.assign(
  function ImpactColumn(props: ImpactColumnProps) {
    const { children, costCalculation, costFn } = props;

    // Determine the text to show in the popover. If there's a cost calculation but no cost
    // function, that implies the cost function was deleted.
    const [hoverText, alertType] = (() => {
      if (costCalculation === undefined) return [undefined, undefined];
      if (costFn) return [`Calculated with ${costFn.name}`, undefined];
      return ['Cost function has been deleted', 'warning'];
    })() as [Maybe<string>, Maybe<AlertType>];

    return (
      <Table.Cell align="right">
        <HoverText text={hoverText} type={alertType}>
          {children(costCalculation)}
        </HoverText>
      </Table.Cell>
    );
  },
  { Header: ImpactColumnHeader }
);
