import React from 'react';
import MuiPopover from '@material-ui/core/Popover';


/** ============================ Types ===================================== */
type PopoverProps = {
  anchorEl?: null | Element;
  id?: string;
  onClose: () => void;
  open: boolean;
};

/** ============================ Components ================================ */
export const Popover: React.FC<PopoverProps> = (props) => {
  return (
    <MuiPopover
      {...props}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
    />
  );
};
