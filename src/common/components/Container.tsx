import * as React from 'react';
import MuiContainer from '@material-ui/core/Container';


/** ============================ Types ===================================== */
type ContainerProps = {
  children: NonNullable<React.ReactNode>;
};

/** ============================ Components ================================ */
export const Container: React.FC<ContainerProps> = props => <MuiContainer {...props} />;
