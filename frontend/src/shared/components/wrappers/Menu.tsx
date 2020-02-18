import React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import { Button } from '@nav/shared/components';
import { randomString } from '@nav/shared/util';


/** ============================ Types ===================================== */
type NavigaderMenuProps = {
  label: string;
};
type NavigaderMenuItemProps = {
  className?: string;
};

type NavigaderMenuItem = React.FC<NavigaderMenuItemProps>;
type NavigaderMenuExport = React.FC<NavigaderMenuProps> & {
  Item: NavigaderMenuItem;
};

/** ============================ Components ================================ */
const NavigaderMenu: NavigaderMenuExport = ({ label, ...rest }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuId = randomString();
  
  return (
    <div>
      <Button
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={handleClick}
      >
        {label}
      </Button>
      
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleClose}
        {...rest}
      />
    </div>
  );
  
  function handleClick (event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose () {
    setAnchorEl(null);
  }
};

const NavigaderMenuItem: NavigaderMenuItem = props => <MenuItem {...props}  />;

/** ============================ Exports =================================== */
NavigaderMenu.Item = NavigaderMenuItem;
export default NavigaderMenu;
