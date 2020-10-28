import * as React from 'react';

import { makeStylesHook } from 'navigader/styles';
import { DERConfiguration, DERStrategy } from 'navigader/types';
import { models } from 'navigader/util';
import { Card, CardProps } from '../Card';
import * as Flex from '../Flex';
import { Statistic } from '../Statistic';
import { Tooltip } from '../Tooltip';
import { DERIcon } from './DERIcon';

/** ============================ Types ===================================== */
type DERCardProps = {
  CardProps?: CardProps;
  className?: string;
  configuration?: DERConfiguration;
  strategy?: DERStrategy;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook<DERCardProps>(
  (theme) => ({
    flexContainer: {
      '& > *': {
        marginRight: theme.spacing(2),
      },
    },
  }),
  'DERCard'
);

/** ============================ Components ================================ */
export const DERCard: React.FC<DERCardProps> = (props) => {
  const { CardProps, className, configuration, strategy } = props;
  const classes = useStyles(props);
  const derType = configuration?.der_type || strategy?.der_type;

  return (
    <Card {...CardProps} className={className}>
      <Flex.Container className={classes.flexContainer}>
        <Flex.Item>
          <Statistic
            title="Type"
            value={
              derType ? (
                <Flex.Container>
                  <DERIcon type={derType} />
                  {derType}
                </Flex.Container>
              ) : (
                'None'
              )
            }
          />
        </Flex.Item>

        <Flex.Item>
          <Statistic title="Configuration" value={configuration?.name || 'None'} />
        </Flex.Item>

        <Flex.Item>
          <Statistic
            title="Strategy"
            value={
              strategy ? (
                <Tooltip title={models.der.getStrategyDescription(strategy)}>
                  <div>{strategy.name}</div>
                </Tooltip>
              ) : (
                'None'
              )
            }
          />
        </Flex.Item>
      </Flex.Container>
    </Card>
  );
};
