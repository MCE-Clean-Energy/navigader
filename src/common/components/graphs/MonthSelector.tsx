import * as React from 'react';

import { MonthIndex, MonthsOption } from 'navigader/types';
import _ from 'navigader/util/lodash';
import { Toggle } from '../ToggleButton';


/** ============================ Types ===================================== */
type MonthSelectorProps = {
  selected: MonthsOption;
  onChange: (months: MonthsOption) => void;
};

type MonthSelectorExclusiveProps = {
  selected: MonthIndex | undefined;
  onChange: (newMonth: MonthIndex) => void;
};

/** ============================ Components ================================ */
export const MonthSelectorExclusive: React.FC<MonthSelectorExclusiveProps> = (props) => {
  const { onChange, selected } = props;
  return(
    <Toggle.Group
      exclusive
      onChange={onChange}
      size="small"
      value={selected}
    >
      <Toggle.Button value={1} aria-label="January">Jan</Toggle.Button>
      <Toggle.Button value={2} aria-label="February">Feb</Toggle.Button>
      <Toggle.Button value={3} aria-label="March">Mar</Toggle.Button>
      <Toggle.Button value={4} aria-label="April">Apr</Toggle.Button>
      <Toggle.Button value={5} aria-label="May">May</Toggle.Button>
      <Toggle.Button value={6} aria-label="June">Jun</Toggle.Button>
      <Toggle.Button value={7} aria-label="July">Jul</Toggle.Button>
      <Toggle.Button value={8} aria-label="August">Aug</Toggle.Button>
      <Toggle.Button value={9} aria-label="September">Sep</Toggle.Button>
      <Toggle.Button value={10} aria-label="October">Oct</Toggle.Button>
      <Toggle.Button value={11} aria-label="November">Nov</Toggle.Button>
      <Toggle.Button value={12} aria-label="December">Dec</Toggle.Button>
    </Toggle.Group>
  );
};

export const MonthSelector: React.FC<MonthSelectorProps> = (props) => {
  const { onChange, selected } = props;
  return(
    <Toggle.Group
      onChange={toggleMonth}
      size="small"
      value={selected}
    >
      <Toggle.Button value={1} aria-label="January">Jan</Toggle.Button>
      <Toggle.Button value={2} aria-label="February">Feb</Toggle.Button>
      <Toggle.Button value={3} aria-label="March">Mar</Toggle.Button>
      <Toggle.Button value={4} aria-label="April">Apr</Toggle.Button>
      <Toggle.Button value={5} aria-label="May">May</Toggle.Button>
      <Toggle.Button value={6} aria-label="June">Jun</Toggle.Button>
      <Toggle.Button value={7} aria-label="July">Jul</Toggle.Button>
      <Toggle.Button value={8} aria-label="August">Aug</Toggle.Button>
      <Toggle.Button value={9} aria-label="September">Sep</Toggle.Button>
      <Toggle.Button value={10} aria-label="October">Oct</Toggle.Button>
      <Toggle.Button value={11} aria-label="November">Nov</Toggle.Button>
      <Toggle.Button value={12} aria-label="December">Dec</Toggle.Button>
      <Toggle.Button value="all" aria-label="All">All</Toggle.Button>
    </Toggle.Group>
  );
  
  function toggleMonth (month: MonthIndex | 'all') {
    if (month === 'all') {
      onChange(month);
      return;
    }

    if (selected === 'all') {
      onChange([month]);
      return;
    }
    
    if (selected.includes(month)) {
      // Remove the month from the selected list
      onChange(_.without(selected, month));
    } else {
      // Add to the list
      onChange([...selected, month]);
    }
  }
};
