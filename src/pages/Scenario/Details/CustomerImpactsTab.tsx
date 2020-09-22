import * as React from 'react';

import {
  Card, CustomersTable, ScenarioComparisonChartAxes, ScenarioComparison,
  ScenarioComparisonChartTitle
} from 'navigader/components';
import { makeStylesHook } from 'navigader/styles';
import { Scenario } from 'navigader/types';
import { useColorMap } from 'navigader/util/hooks';


/** ============================ Types ===================================== */
type CustomerImpactsTabProps = {
  scenario: Scenario;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  table: {
    maxHeight: 500
  },
  tableContainer: {
    marginTop: theme.spacing(2)
  },
}), 'CustomerImpactsTab');

/** ============================ Components ================================ */
export const CustomerImpactsTab: React.FC<CustomerImpactsTabProps> = ({ scenario }) => {
  const colorMap = useColorMap([scenario]);
  const classes = useStyles();
  const [chartAxes, setChartAxes] = React.useState<ScenarioComparisonChartAxes>(['Revenue', 'GHG']);

  return (
    <>
      <ScenarioComparisonChartTitle axes={chartAxes} updateAxes={setChartAxes} />
      <Card raised>
        <ScenarioComparison
          aggregated={false}
          axes={chartAxes}
          colorMap={colorMap}
          scenarios={[scenario]}
        />
      </Card>

      <div className={classes.tableContainer}>
        <CustomersTable
          className={classes.table}
          scenarios={[scenario]}
          simulations={Object.values(scenario.report!)}
        />
      </div>
    </>
  );
};
