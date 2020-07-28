import * as React from 'react';
import MuiMenu from '@material-ui/core/Menu';

import { printWarning, randomString } from 'navigader/util';
import { Button } from './Button';
import { List } from './List';
import { PopoverOrigin } from './Popover';
import { ValidIcon } from './Icon';


/** ============================ Types ===================================== */
type MenuProps = {
  anchorOrigin?: PopoverOrigin;
  icon?: ValidIcon;
  label?: string;
  transformOrigin?: PopoverOrigin;
};

type MenuExport = React.FC<MenuProps> & {
  Item: typeof List.Item;
};

/** ============================ Components ================================ */
export const Menu: MenuExport = (props) => {
  const {
    icon,
    label,
    anchorOrigin = { vertical: 'bottom', horizontal: 'center' } as PopoverOrigin,
    transformOrigin = { vertical: 'top', horizontal: 'center' } as PopoverOrigin,
    ...rest
  } = props;
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuId = randomString();
  
  // Only one of the `icon` and `label` props should be provided
  const hasBoth = Boolean(label && icon);
  const hasNeither = !Boolean(label || icon);
  if (hasBoth || hasNeither) {
    printWarning('`Menu` component expects one of `icon` or `label` prop');
  }
  
  const menuOpenerProps = {
    'aria-controls': menuId,
    'aria-haspopup': 'true' as React.AriaAttributes['aria-haspopup'],
    onClick: handleClick
  };
  
  const MenuOpener = icon
    ? <Button {...menuOpenerProps} icon={icon} />
    : <Button {...menuOpenerProps}>{label}</Button>;
  
  return (
    <>
      {MenuOpener}
      <MuiMenu
        anchorEl={anchorEl}
        anchorOrigin={anchorOrigin}
        getContentAnchorEl={null}
        id={menuId}
        open={!!anchorEl}
        onClose={handleClose}
        transformOrigin={transformOrigin}
        {...rest}
      />
    </>
  );
  
  function handleClick (event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose () {
    setAnchorEl(null);
  }
};

Menu.Item = List.Item;
