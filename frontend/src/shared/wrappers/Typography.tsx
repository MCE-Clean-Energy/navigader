import React from 'react';
import { Typography, TypographyProps } from '@material-ui/core';


/** ============================ Types ===================================== */
type NavigaderTypographyProps = {
  className?: string;
  variant: TypographyProps['variant'];
};

/** ============================ Components ================================ */
const NavigaderTypography: React.FC<NavigaderTypographyProps> = ({ children, className, ...rest }) => (
  <Typography {...rest}>
    <span className={className}>{children}</span>
  </Typography>
);

/** ============================ Exports =================================== */
export default NavigaderTypography;
