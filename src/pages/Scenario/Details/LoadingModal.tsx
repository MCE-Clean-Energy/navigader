import * as React from 'react';

import { Flex, Progress } from 'navigader/components';
import { makeStylesHook } from 'navigader/styles';


/** ============================ Types ===================================== */
type LoadingModalProps = {
  loading: boolean;
};

/** ============================ Styles ==================================== */
const useModalStyles = makeStylesHook<LoadingModalProps>(theme => ({
  modal: props => ({
    background: 'rgba(0, 0, 0, 0.3)',
    left: 0,
    height: '100%',
    opacity: props.loading ? 1 : 0,
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    transition: theme.transitions.create('opacity', {
      duration: theme.transitions.duration.standard
    }),
    width: '100%'
  })
}), 'ScenarioResultsLoadingModal');

/** ============================ Components ================================ */
export const LoadingModal: React.FC<LoadingModalProps> = (props) => {
  const classes = useModalStyles(props);
  return (
    <Flex.Container alignItems="center" className={classes.modal} justifyContent="center">
      <Progress circular />
    </Flex.Container>
  );
};
