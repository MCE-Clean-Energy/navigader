import * as React from 'react';

import { Card, Flex, Statistic, Tooltip } from 'navigader/components';
import { makeStylesHook } from 'navigader/styles';
import { BatteryConfiguration, BatteryStrategy } from 'navigader/types';
import { getStrategyDescription } from '../util';
import { DERIcon } from './DERIcon';


/** ============================ Types ===================================== */
type DerCardProps = {
  className?: string;
  configuration?: BatteryConfiguration;
  strategy?: BatteryStrategy;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook<DerCardProps>(theme => ({
  flexContainer: {
    '& > *': {
      marginRight: theme.spacing(2)
    }
  },
}), 'DERCard');

/** ============================ Components ================================ */
export const DERCard: React.FC<DerCardProps> = (props) => {
  const { className, configuration, strategy } = props;
  const classes = useStyles(props);
  const derType = configuration?.der_type || strategy?.der_type;
  
  return (
    <Card className={className} raised>
      <Flex.Container className={classes.flexContainer}>
        <Flex.Item>
          <Statistic
            title="Type"
            value={
              derType
                ? (
                  <Flex.Container>
                    <DERIcon type={derType}/>
                    {derType}
                  </Flex.Container>
                )
                : 'None'
            }
            variant="subtitle2"
          />
        </Flex.Item>
        
        <Flex.Item>
          <Statistic title="Configuration" value={configuration?.name || 'None'} variant="subtitle2" />
        </Flex.Item>
        
        <Flex.Item>
          <Statistic
            title="Strategy"
            value={
              strategy
                ? (
                  <Tooltip title={getStrategyDescription(strategy)}>
                    <div>{strategy.name}</div>
                  </Tooltip>
                )
                : 'None'
            }
            variant="subtitle2"
          />
        </Flex.Item>
      </Flex.Container>
    </Card>
  );
};
