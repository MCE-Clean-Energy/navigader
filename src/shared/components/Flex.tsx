import * as React from 'react';
import omit from 'lodash/omit';
import { CreateCSSProperties } from '@material-ui/styles/withStyles';
import classNames from 'classnames';

import { makeStylesHook } from '@nav/shared/styles';


/** ============================ Types ===================================== */
type FlexItemProps = React.HTMLAttributes<HTMLDivElement> & {
  textAlign?: 'right' | 'left';
  grow?: boolean | number;
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
  flexContainer: getFlexContainerStyles
}));

const useItemStyles = makeStylesHook<FlexItemProps>(() => ({
  flexItem: getFlexItemStyles
}));

/** ============================ Components ================================ */
export const Container: React.FC<FlexContainerProps> = (props) => {
  const { className, ...rest } = props;
  
  // Compile all classes for the container
  const classes = classNames(
    useContainerStyles(props).flexContainer,
    useItemStyles(props).flexItem,
    className
  );
  
  const childProps = omit(rest, 'alignItems', 'grow', 'justifyContent', 'textAlign', 'wrap');
  return <div className={classes} {...childProps} />;
};

export const Item: React.FC<FlexItemProps> = (props) => {
  const { className, ...rest } = props;
  const classes = useItemStyles(props);
  const itemClasses = classNames(classes.flexItem, className);
  const childProps = omit(rest, 'textAlign', 'grow');
  return <div className={itemClasses} {...childProps} />
};

Container.defaultProps = {
  direction: 'row',
  wrap: false
};

/** ============================ Helpers =================================== */
function getFlexContainerStyles (props: FlexContainerProps): CreateCSSProperties {
  return {
    alignItems: props.alignItems,
    display: 'flex',
    flexDirection: props.direction,
    flexWrap: props.wrap ? 'wrap' : 'nowrap',
    justifyContent: props.justifyContent
  };
}

function getFlexItemStyles (props: FlexItemProps): CreateCSSProperties {
  return {
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
