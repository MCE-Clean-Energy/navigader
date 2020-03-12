import * as React from 'react';
import MuiMenu from '@material-ui/core/Menu';
import MuiMenuItem from '@material-ui/core/MenuItem';

import { Button } from '@nav/shared/components';
import { randomString } from '@nav/shared/util';


/** ============================ Types ===================================== */
type MenuProps = {
  label: string;
};
type MenuItemProps = {
  className?: string;
};

type MenuItem = React.FC<MenuItemProps>;
type MenuExport = React.FC<MenuProps> & {
  Item: MenuItem;
};

/** ============================ Components ================================ */
export const Menu: MenuExport = ({ label, ...rest }) => {
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
      
      <MuiMenu
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

const MenuItem: MenuItem = props => <MuiMenuItem {...props}  />;
Menu.Item = MenuItem;
