import React from 'react';
import { createUseStyles } from 'react-jss';
import omit from 'lodash/omit';
import classNames from 'classnames';
import { Theme } from '../styles';


/** ============================ Types ===================================== */
type AlignItemsValue = 'center' | 'stretch';
type JustifyContentValue = 'center' | 'space-between' | 'space-around';
type FlexDirection = 'row' | 'column';
type FlexContainerProps = {
  alignItems?: AlignItemsValue;
  className?: string;
  direction?: FlexDirection;
  justifyContent?: JustifyContentValue;
};

type FlexItemProps = React.HTMLAttributes<HTMLDivElement> & {
  grow?: boolean | number;
}

/** ============================ Styles ==================================== */
const useContainerStyles = createUseStyles((theme: Theme) => ({
  container: (props: FlexContainerProps) => ({
    alignItems: props.alignItems,
    flexDirection: props.direction,
    display: 'flex',
    justifyContent: props.justifyContent
  })
}));

const useItemStyles = createUseStyles({
  item: (props: FlexItemProps) => ({
    flexGrow: props.grow
      ? props.grow === true
        ? 1
        : props.grow
      : 0
  })
});

/** ============================ Components ================================ */
export const Container: React.FC<FlexContainerProps> = (props) => {
  const { className, ...rest } = props;
  const classes = useContainerStyles(props);
  const containerClasses = classNames(classes.container, className);
  const childProps = omit(rest, 'alignItems', 'justifyContent');
  return <div className={containerClasses} {...childProps} />;
};

export const Item: React.FC<FlexItemProps> = (props) => {
  const { className, ...rest } = props;
  const classes = useItemStyles(props);
  const itemClasses = classNames(classes.item, className);
  const childProps = omit(rest, 'grow');
  return <div className={itemClasses} {...childProps} />
};

Container.defaultProps = {
  alignItems: 'center',
  direction: 'row',
  justifyContent: 'space-between'
};
