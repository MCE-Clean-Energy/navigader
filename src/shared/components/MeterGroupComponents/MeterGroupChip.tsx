import * as React from 'react';

import { Chip, ChipProps, Flex, Typography } from '@nav/shared/components';
import { getMeterGroupDisplayName, MeterGroup } from '@nav/shared/models/meter';
import { makeStylesHook } from '@nav/shared/styles';
import { formatters } from '@nav/shared/util';


/** ============================ Types ===================================== */
type MeterGroupChipProps = Omit<ChipProps, 'label'> & {
  className?: string;
  meterGroup?: MeterGroup;
  showCount?: boolean;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  numMeters: {
    marginLeft: theme.spacing(2)
  }
}), 'SelectedCustomers');

/** ============================ Components ================================ */
export const MeterGroupChip = React.forwardRef<HTMLDivElement, MeterGroupChipProps>(
  (props, ref) => {
    const {
      color = 'secondary',
      disabled,
      icon,
      meterGroup,
      onClick,
      showCount = false,
      ...rest
    } = props;
    const classes = useStyles();
    
    if (!meterGroup) return null;
    return (
      <Flex.Container
        alignItems="center"
        key={meterGroup.id}
        ref={ref}
        {...rest}
      >
        <Flex.Item>
          <Chip
            color={color}
            disabled={disabled}
            icon={icon}
            label={getMeterGroupDisplayName(meterGroup)}
            onClick={onClick}
          />
        </Flex.Item>
        
        {showCount &&
          <Flex.Item className={classes.numMeters}>
            <Typography variant="body2">
              {meterGroup.meter_count} {formatters.pluralize('meter', meterGroup.meter_count)}
            </Typography>
          </Flex.Item>
        }
      </Flex.Container>
    );
  }
);
