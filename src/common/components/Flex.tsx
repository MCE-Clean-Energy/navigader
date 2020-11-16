import _ from 'lodash';
import * as React from 'react';
import { CreateCSSProperties } from '@material-ui/styles/withStyles';
import classNames from 'classnames';

import { makeStylesHook } from 'navigader/styles';
import { AlignItemsValue, FlexDirection, JustifyContentValue } from 'navigader/types';

/** ============================ Types ===================================== */
type FlexItemProps = React.HTMLAttributes<HTMLDivElement> & {
  basis?: number;
  grow?: boolean | number;
  textAlign?: 'right' | 'left';
};

type FlexContainerProps = React.HTMLAttributes<HTMLDivElement> &
  FlexItemProps & {
    alignItems?: AlignItemsValue;
    className?: string;
    direction?: FlexDirection;
    justifyContent?: JustifyContentValue;
    wrap?: boolean;
  };

/** ============================ Styles ==================================== */
const useContainerStyles = makeStylesHook<FlexContainerProps>(
  (theme) => ({
    flexContainer: (props) =>
      theme.mixins.flex({
        direction: props.direction,
        wrap: props.wrap ? 'wrap' : 'nowrap',
        justify: props.justifyContent,
        align: props.alignItems,
      }),
  }),
  'FlexContainer'
);

const useItemStyles = makeStylesHook<FlexItemProps>(() => ({ flexItem: itemStyles }), 'FlexItem');

/** ============================ Components ================================ */
export const Container = React.forwardRef<HTMLDivElement, FlexContainerProps>((props, ref) => {
  const { className, ...rest } = props;

  // Compile all classes for the container
  const classes = classNames(
    useContainerStyles(props).flexContainer,
    useItemStyles(props).flexItem,
    className
  );

  const childProps = _.omit(
    rest,
    'alignItems',
    'basis',
    'grow',
    'justifyContent',
    'textAlign',
    'wrap'
  );

  return <div {...childProps} className={classes} ref={ref} />;
});

Container.displayName = 'FlexContainer';
Container.defaultProps = {
  direction: 'row',
  wrap: false,
};

export const Item = React.forwardRef<HTMLDivElement, FlexItemProps>((props, ref) => {
  const { className, ...rest } = props;
  const classes = classNames(useItemStyles(props).flexItem, className);
  const childProps = _.omit(
    rest,
    'alignItems',
    'basis',
    'grow',
    'justifyContent',
    'textAlign',
    'wrap'
  );
  return <div {...childProps} className={classes} ref={ref} />;
});

Item.displayName = 'FlexItem';

/** ============================ Helpers =================================== */
function itemStyles(props: FlexItemProps): CreateCSSProperties {
  return {
    flexBasis: props.basis ? `${props.basis}%` : undefined,
    flexGrow: props.grow ? (props.grow === true ? 1 : props.grow) : undefined,
    textAlign:
      props.textAlign === 'left' ? 'left' : props.textAlign === 'right' ? 'right' : undefined,
  };
}
