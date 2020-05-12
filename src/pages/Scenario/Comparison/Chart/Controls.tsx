import * as React from 'react';

import { Card, Switch } from 'navigader/components';


/** ============================ Types ===================================== */
type ControlsProps = {
  aggregated: boolean;
  updateAggregated: (aggregate: boolean) => void;
};

/** ============================ Components ================================ */
export const Controls: React.FC<ControlsProps> = (props) => {
  const { aggregated, updateAggregated } = props;

  return (
    <Card raised>
      <Switch
        checked={aggregated}
        label="Aggregate Customers"
        onChange={handleSwitchChange}
      />
    </Card>
  );
  
  /** ============================ Callbacks =============================== */
  function handleSwitchChange (checked: boolean) {
    updateAggregated(checked);
  }
};
