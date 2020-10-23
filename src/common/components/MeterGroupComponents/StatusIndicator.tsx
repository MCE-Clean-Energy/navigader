import * as React from 'react';

import { MeterGroup } from 'navigader/types';

import { Tooltip } from '../Tooltip';
import { Icon } from '../Icon';
import { Progress } from '../Progress';


/** ============================ Types ===================================== */
type ScenarioStatusProps = { meterGroup: MeterGroup };

/** ============================ Components ================================ */
export const StatusIndicator: React.FC<ScenarioStatusProps> = ({ meterGroup }) => {
  const { is_complete, percent_complete } = meterGroup.progress;

  // Show the checkmark if the report has completed and aggregated
  if (is_complete) {
    return (
      <Tooltip title="Done">
        <Icon color="green" name="checkMark" />
      </Tooltip>
    );
  } else if (percent_complete === 100) {
    return (
      <Tooltip title="Finalizing...">
        <Progress circular color="secondary" size={24} />
      </Tooltip>
    );
  } else if (percent_complete === 0) {
    return (
      <Tooltip title="Waiting to run...">
        <Icon color="blue" name="clock" />
      </Tooltip>
    );
  }

  return (
    <Tooltip title={`${Math.floor(percent_complete)}%`}>
      <Progress circular value={Math.max(percent_complete, 3)} showBackground size={24} />
    </Tooltip>
  );
};
