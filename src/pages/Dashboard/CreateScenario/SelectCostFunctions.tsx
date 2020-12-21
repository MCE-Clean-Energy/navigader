import _ from 'lodash';
import { DateTime } from 'luxon';
import * as React from 'react';

import { Alert, Card, Grid, List, Popover, Radio, Typography } from 'navigader/components';
import { makeStylesHook } from 'navigader/styles';
import {
  CAISORate,
  GHGRate,
  Loader,
  Maybe,
  Nullable,
  RatePlan,
  SystemProfile,
} from 'navigader/types';
import { formatters, interval } from 'navigader/util';

import { CreateScenarioScreenProps, CreateScenarioState } from './common';

/** ============================ Types ===================================== */
type CostFunction = GHGRate | RatePlan | CAISORate | SystemProfile;
type CostFunctionCardProps = {
  allowAutoAssignment?: boolean;
  costFunctions: Loader<CostFunction[]>;
  onChange: (id: string) => void;
  title: string;
  value: Maybe<number | 'auto'>;
  startDate: Nullable<DateTime>;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(
  (theme) => ({
    cardTitle: { padding: theme.spacing(2, 2, 0) },
    hover: { maxWidth: 500, padding: 0 },
    radioList: { maxHeight: 500, overflowY: 'auto' },
  }),
  'CostFunctionCard'
);

/** ============================ Components ================================ */
function CostFunctionCard(props: CostFunctionCardProps) {
  const { allowAutoAssignment, costFunctions, onChange, startDate, title, value } = props;
  const classes = useStyles();
  return (
    <Card padding={0} raised>
      <Typography className={classes.cardTitle} useDiv variant="h6">
        {title}
      </Typography>
      <Radio.Group
        className={classes.radioList}
        onChange={onChange}
        value={value?.toString() || ''}
      >
        <List dense>
          {allowAutoAssignment && (
            <List.Item button={false}>
              <Radio
                label={<Typography variant="body2">Assign automatically</Typography>}
                value="auto"
              />
            </List.Item>
          )}

          {costFunctions.map((costFunction) => {
            // If the cost function's date is incompatible, render a popover to explain why
            const error = getDateIncompatibilityErrors(costFunction);
            const radio = (
              <Radio
                disabled={Boolean(error)}
                label={<Typography variant="body2">{costFunction.name}</Typography>}
                value={costFunction.id.toString()}
              />
            );

            let content = radio;
            if (error) {
              content = (
                <Popover
                  anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  className={classes.hover}
                  HoverComponent={<Alert type="info">{error}</Alert>}
                >
                  {radio}
                </Popover>
              );
            }

            return (
              <List.Item button={false} key={costFunction.id}>
                {content}
              </List.Item>
            );
          })}
        </List>
      </Radio.Group>
    </Card>
  );

  /** ========================== Helpers =================================== */
  function getDateIncompatibilityErrors(costFn: CostFunction): Maybe<string> {
    // If the year is null, no date is incompatible
    if (_.isNull(startDate)) return;

    switch (costFn.object_type) {
      case 'GHGRate':
        // GHG rates can always be used
        return;
      case 'CAISORate':
      case 'SystemProfile':
        // If the years match, no error
        if (interval.hasYear(costFn, startDate)) return;

        const objName = costFn.object_type === 'CAISORate' ? 'procurement rate' : 'system profile';
        const costFnStartDate = interval.getStartDate(costFn);

        // Unclear what circumstance would leave the procurement rate/system profile without a date
        // range, but just in case...
        if (_.isNull(costFnStartDate))
          return `
            ${_.capitalize(objName)}'s start date could not be determined. Please refresh the page
            and try again, or contact support.
          `;

        // The years don't match
        return `
          This ${objName}'s interval data is for the year ${costFnStartDate.year}, which differs
          from the year of the selected customer segments (${startDate.year}). All cost functions
          must have the same calendar year as the customer segments or the scenarios will not be
          able to run properly.
        `;
      case 'RatePlan':
        const { start_date: rateDataStartDate } = costFn;
        if (_.isNull(rateDataStartDate))
          return 'This rate plan has no rate data. Add rate data to use it in a scenario.';

        if (startDate < rateDataStartDate) {
          const rateDataStartFormatted = formatters.date.standard(rateDataStartDate);
          const startDateFormatted = formatters.date.standard(startDate);
          return `
            This rate plan's rate data begins on ${rateDataStartFormatted}, which is after the
            earliest date of the selected customer segment(s), ${startDateFormatted}. In order to
            use a rate plan with a scenario, the rate plan must be able to cover all dates included
            in the customer meter intervals.
          `;
        }
    }
  }
}

export const SelectCostFunctions: React.FC<CreateScenarioScreenProps> = (props) => {
  const { costFunctions, state, updateState } = props;
  return (
    <Grid>
      <Grid.Item span={3}>
        <CostFunctionCard
          title="GHG Rates"
          costFunctions={costFunctions.ghgRate}
          onChange={makeOnChangeCallback('ghgRate')}
          startDate={state.startDate}
          value={state.costFunctionSelections.ghgRate}
        />
      </Grid.Item>

      <Grid.Item span={3}>
        <CostFunctionCard
          title="Procurement Rates"
          costFunctions={costFunctions.caisoRate}
          onChange={makeOnChangeCallback('caisoRate')}
          startDate={state.startDate}
          value={state.costFunctionSelections.caisoRate}
        />
      </Grid.Item>

      <Grid.Item span={3}>
        <CostFunctionCard
          title="Rate Plans"
          allowAutoAssignment
          costFunctions={costFunctions.ratePlan}
          onChange={makeOnChangeCallback('ratePlan')}
          startDate={state.startDate}
          value={state.costFunctionSelections.ratePlan}
        />
      </Grid.Item>

      <Grid.Item span={3}>
        <CostFunctionCard
          title="Resource Adequacy Costs"
          costFunctions={costFunctions.systemProfile}
          onChange={makeOnChangeCallback('systemProfile')}
          startDate={state.startDate}
          value={state.costFunctionSelections.systemProfile}
        />
      </Grid.Item>
    </Grid>
  );

  /** ========================== Helpers =================================== */
  function makeOnChangeCallback(key: keyof CreateScenarioState['costFunctionSelections']) {
    return (value: string) => {
      updateState({
        costFunctionSelections: {
          ...state.costFunctionSelections,
          [key]: value === 'auto' ? value : +value,
        },
      });
    };
  }
};
