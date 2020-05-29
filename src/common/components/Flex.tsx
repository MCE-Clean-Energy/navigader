import * as React from 'react';
import { CreateCSSProperties } from '@material-ui/styles/withStyles';
import classNames from 'classnames';

import { makeStylesHook } from 'navigader/styles';
import { _ } from 'navigader/util';


/** ============================ Types ===================================== */
type FlexItemProps = React.HTMLAttributes<HTMLDivElement> & {
  basis?: number;
  grow?: boolean | number;
  textAlign?: 'right' | 'left';
}

type AlignItemsValue = 'center' | 'stretch';
type JustifyContentValue = 'center' | 'flex-start' | 'space-between' | 'space-around';
type FlexDirection = 'row' | 'column';
type FlexContainerProps = React.HTMLAttributes<HTMLDivElement> & FlexItemProps & {
  alignItems?: AlignItemsValue;
  className?: string;
  direction?: FlexDirection;
  justifyContent?: JustifyContentValue;
  wrap?: boolean;
};

/** ============================ Styles ==================================== */
const useContainerStyles = makeStylesHook<FlexContainerProps>(() => ({
  flexContainer: containerStyles
}), 'FlexContainer');

const useItemStyles = makeStylesHook<FlexItemProps>(() => ({
  flexItem: itemStyles
}), 'FlexItem');

/** ============================ Components ================================ */
export const Container = React.forwardRef<HTMLDivElement, FlexContainerProps>(
  (props, ref) => {
    const { className, ...rest } = props;
    
    // Compile all classes for the container
    const classes = classNames(
      useContainerStyles(props).flexContainer,
      useItemStyles(props).flexItem,
      className
    );
    
    const childProps = _.omit(rest, 'alignItems', 'basis', 'grow', 'justifyContent', 'textAlign', 'wrap');
    
    return <div {...childProps} className={classes} ref={ref} />;
  }
);

Container.displayName = 'FlexContainer';
Container.defaultProps = {
  direction: 'row',
  wrap: false
};

export const Item = React.forwardRef<HTMLDivElement, FlexItemProps>(
  (props, ref) => {
    const { className, ...rest } = props;
    const classes = classNames(useItemStyles(props).flexItem, className);
    const childProps = _.omit(rest, 'alignItems', 'basis', 'grow', 'justifyContent', 'textAlign', 'wrap');
    return <div {...childProps} className={classes} ref={ref} />
  }
);

Item.displayName = 'FlexItem';

/** ============================ Helpers =================================== */
export function containerStyles (props: FlexContainerProps): CreateCSSProperties {
  return {
    alignItems: props.alignItems,
    display: 'flex',
    flexDirection: props.direction,
    flexWrap: props.wrap ? 'wrap' : 'nowrap',
    justifyContent: props.justifyContent
  };
}

function itemStyles (props: FlexItemProps): CreateCSSProperties {
  return {
    flexBasis: props.basis
      ? `${props.basis}%`
      : undefined,
    flexGrow: props.grow
      ? props.grow === true
        ? 1
        : props.grow
      : undefined,
    textAlign: props.textAlign === 'left'
      ? 'left'
      : props.textAlign === 'right'
        ? 'right'
        : undefined
  };
}
