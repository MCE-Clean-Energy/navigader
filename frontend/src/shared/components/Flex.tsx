import React from 'react';
import { createUseStyles } from 'react-jss';
import omit from 'lodash/omit';
import classNames from 'classnames';
import { Theme } from '../styles';


/** ============================ Types ===================================== */
type AlignItemsValue = 'center';
type JustifyContentValue = 'space-between' | 'space-around';
type FlexBoxProps = {
  alignItems?: AlignItemsValue;
  className?: string;
  justifyContent?: JustifyContentValue;
};

/** ============================ Styles ==================================== */
const useStyles = createUseStyles((theme: Theme) => ({
  container: (props: FlexBoxProps) => ({
    alignItems: props.alignItems,
    display: 'flex',
    justifyContent: props.justifyContent,
    
    // Provides the proper height for the
    ...theme.mixins.toolbar
  })
}));

/** ============================ Components ================================ */
export const FlexBox: React.FC<FlexBoxProps> = (props) => {
  const { className, ...rest } = props;
  const classes = useStyles(props);
  const containerClasses = classNames(classes.container, className);
  const childProps = omit(rest, 'alignItems', 'justifyContent');
  return <div className={containerClasses} {...childProps} />;
};

FlexBox.defaultProps = {
  alignItems: 'center',
  justifyContent: 'space-between'
};
