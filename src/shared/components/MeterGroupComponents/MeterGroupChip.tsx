import * as React from 'react';

import { Chip, ChipProps, Flex, Typography, ValidIcon } from '@nav/shared/components';
import { getMeterGroupDisplayName, MeterGroup } from '@nav/shared/models/meter';
import { makeStylesHook } from '@nav/shared/styles';
import { formatters } from '@nav/shared/util';


/** ============================ Types ===================================== */
type MeterGroupChipProps = {
  className?: string;
  color?: ChipProps['color'];
  icon?: ValidIcon;
  meterGroup?: MeterGroup;
  onClick?: () => void;
  showCount?: boolean;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  numMeters: {
    marginLeft: theme.spacing(2)
  }
}), 'SelectedCustomers');

/** ============================ Components ================================ */
export const MeterGroupChip: React.FC<MeterGroupChipProps> = (props) => {
  const { className, color = 'secondary', icon, meterGroup, onClick, showCount = false } = props;
  const classes = useStyles();
  if (!meterGroup) return null;
  return (
    <Flex.Container
      alignItems="center"
      className={className}
      key={meterGroup.id}
    >
      <Flex.Item>
        <Chip
          color={color}
          icon={icon}
          label={getMeterGroupDisplayName(meterGroup)}
          onClick={onClick}
        />
      </Flex.Item>
      
      {showCount &&
        <Flex.Item className={classes.numMeters}>
          <Typography variant="body2">
            {meterGroup.numMeters} {formatters.pluralize('meter', meterGroup.numMeters)}
          </Typography>
        </Flex.Item>
      }
    </Flex.Container>
  );
};
