import * as React from 'react';
import range from 'lodash/range';
import without from 'lodash/without';

import { Checkbox, Divider, List, Menu } from '@nav/shared/components';
import { Frame288MonthsOption } from '@nav/shared/components/graphs/Frame288Graph';
import { MonthIndex } from '@nav/shared/types';
import { getMonthName } from '@nav/shared/util';


/** ============================ Types ===================================== */
type MonthsMenuProps = {
  selectedMonths: Frame288MonthsOption;
  changeMonths: (newMonths: Frame288MonthsOption) => void;
};

/** ============================ Components ================================ */
const MonthsMenu: React.FC<MonthsMenuProps> = ({ selectedMonths, changeMonths }) => {
  const monthOptions = range(1, 13) as MonthIndex[];
  return (
    <div>
      <Menu label="Months">
        <List dense>
          <List.Item onClick={() => toggleAll()}>
            <List.Item.Icon>
              <Checkbox checked={selectedMonths === 'all'} />
            </List.Item.Icon>
            <List.Item.Text>All</List.Item.Text>
          </List.Item>
          
          <Divider />
          
          {monthOptions.map(monthIndex =>
            <List.Item
              key={monthIndex}
              onClick={() => toggleMonth(monthIndex)}
              selected={isSelected(monthIndex)}
            >
              <List.Item.Icon>
                <Checkbox checked={isSelected(monthIndex)} />
              </List.Item.Icon>
              <List.Item.Text>{getMonthName(monthIndex)}</List.Item.Text>
            </List.Item>
          )}
        </List>
      </Menu>
    </div>
  );
  
  function isSelected (monthIndex: MonthIndex) {
    if (selectedMonths === 'all') return false;
    return selectedMonths.indexOf(monthIndex) !== -1
  }
  
  function toggleMonth (month: MonthIndex) {
    if (selectedMonths === 'all') {
      changeMonths([month]);
      return;
    }
    
    if (selectedMonths.includes(month)) {
      // Remove the month from the selected list
      changeMonths(without(selectedMonths, month));
    } else {
      // Add to the list
      changeMonths([...selectedMonths, month]);
    }
  }
  
  function toggleAll () {
    changeMonths(selectedMonths === 'all' ? [] : 'all');
  }
};

/** ============================ Exports =================================== */
export default MonthsMenu;

