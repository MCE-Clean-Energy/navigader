import * as React from 'react';

import { Checkbox, List, Menu } from 'navigader/components';
import { Frame288LoadType } from 'navigader/models/meter';
import { formatters } from 'navigader/util';


/** ============================ Types ===================================== */
type LoadTypeMenuProps = {
  changeType: (newType: Frame288LoadType) => void;
  className?: string;
  selectedType: Frame288LoadType;
};

/** ============================ Components ================================ */
export const LoadTypeMenu: React.FC<LoadTypeMenuProps> = (props) => {
  const { changeType, className, selectedType } = props;
  const loadTypeOptions: Frame288LoadType[] = ['total', 'average', 'maximum', 'minimum', 'count'];
  return (
    <div className={className}>
      <Menu label="Load Type">
        <List dense>
          {loadTypeOptions.map(loadType =>
            <List.Item
              key={loadType}
              onClick={() => selectType(loadType)}
              selected={isSelected(loadType)}
            >
              <List.Item.Icon>
                <Checkbox checked={isSelected(loadType)} />
              </List.Item.Icon>
              <List.Item.Text>{formatters.capitalize(loadType)}</List.Item.Text>
            </List.Item>
          )}
        </List>
      </Menu>
    </div>
  );
  
  /** ============================ Callbacks =============================== */
  function isSelected (loadType: Frame288LoadType) {
    return selectedType === loadType;
  }
  
  function selectType (loadType: Frame288LoadType) {
    if (selectedType === loadType) {
      // Don't update if they click the same load type again
      return;
    } else {
      // Switch it up
      changeType(loadType);
    }
  }
};
