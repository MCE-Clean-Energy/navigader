import _ from 'lodash';
import * as React from 'react';

import { Button, Card, CardProps, DERCard, Flex, Select } from 'navigader/components';
import { makeStylesHook } from 'navigader/styles';
import { DERConfiguration, DERStrategy, DERType } from 'navigader/types';
import { ProgramOptions } from './ProgramOptions';
import { DERSelection } from './types';

/** ============================ Types ===================================== */
type DerSelectionCardReadOnlyProps = {
  CardProps?: CardProps;
  configurations?: DERConfiguration[];
  der: Partial<DERSelection>;
  numDers: number;
  strategies?: DERStrategy[];
};

type DerSelectionCardProps = DerSelectionCardReadOnlyProps & {
  delete: () => void;
  update: (der: Partial<DERSelection>) => void;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook<DerSelectionCardReadOnlyProps>(
  (theme) => ({
    derCard: {
      '&:not(:last-of-type)': {
        marginBottom: theme.spacing(2),
      },
    },
    flexContainer: {
      '& > *': {
        marginRight: theme.spacing(2),
      },
    },
    deleteIcon: (props) => ({
      // When there is only 1 DER in the list, don't make the icon invisible and un-clickable
      cursor: props.numDers > 1 ? 'pointer' : 'default',
      ...theme.mixins.transition('opacity', props.numDers > 1, [1, 0]),
    }),
    deleteIconContainer: {
      marginRight: 0,
      marginLeft: 'auto',
    },
    typeSelect: {
      width: 200,
    },
  }),
  'CreatedScenario/DerCard'
);

/** ============================ Components ================================ */
export const DerSelectionCard: React.FC<DerSelectionCardProps> = (props) => {
  const classes = useStyles(props);

  return (
    <Card className={classes.derCard} raised>
      <Flex.Container className={classes.flexContainer}>
        <Flex.Item>
          <Select
            className={classes.typeSelect}
            label="DER Type"
            onChange={updateType}
            options={['Battery', 'EVSE', 'SolarPV']}
            renderOption={renderDEROption}
            value={props.der.type}
          />
        </Flex.Item>

        <ProgramOptions {...props} />

        <Flex.Item className={classes.deleteIconContainer}>
          <Button className={classes.deleteIcon} icon="trash" onClick={deleteDer} />
        </Flex.Item>
      </Flex.Container>
    </Card>
  );

  /** ========================== Callbacks ================================= */
  function renderDEROption(option: DERType) {
    switch (option) {
      case 'EVSE':
        return 'EV Supply Equipment';
      case 'SolarPV':
        return 'Solar';
      default:
        return option;
    }
  }

  /**
   * Updates the DER's type. Additionally resets the configuration and strategy when the type
   * changes
   *
   * @param {DERType} type: the DER's new type
   */
  function updateType(type: DERType) {
    props.update({
      configurationId: undefined,
      strategyId: undefined,
      type,
    });
  }

  /**
   * Removes the DER configuration from the list of selected DERs. Doesn't allow deleting the
   * last DER selection
   */
  function deleteDer() {
    if (props.numDers === 1) return;
    props.delete();
  }
};

export const DerCardReadOnly: React.FC<DerSelectionCardReadOnlyProps> = (props) => {
  const { CardProps, configurations, der, strategies } = props;
  const classes = useStyles();

  // Get selected configuration and strategy
  const configuration = _.find(configurations, { id: der.configurationId });
  const strategy = _.find(strategies, { id: der.strategyId });

  if (!configuration || !strategy) return null;
  return (
    <DERCard
      CardProps={CardProps}
      className={classes.derCard}
      configuration={configuration}
      strategy={strategy}
    />
  );
};
