import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { DERCard, Flex, MeterGroupChip, PageHeader, Progress, Tabs } from 'navigader/components';
import * as routes from 'navigader/routes';
import { makeStylesHook } from 'navigader/styles';
import { Scenario } from 'navigader/types';
import { useScenario } from 'navigader/util/hooks';
import { AggregateImpactsTab } from './AggregateImpacts';
import { CustomerImpactsTab } from './CustomerImpactsTab';


/** ============================ Styles ==================================== */
const useScenarioContextStyles = makeStylesHook(theme => ({
  meterGroup: {
    marginLeft: theme.spacing(3)
  },
  container: {
    marginBottom: theme.spacing(3)
  }
}), 'ScenarioContext');

/** ============================ Components ================================ */
const ScenarioContext: React.FC<{ scenario: Scenario }> = ({ scenario }) => {
  const history = useHistory();
  const classes = useScenarioContextStyles();

  return (
    <Flex.Container alignItems="center" className={classes.container}>
      <Flex.Item>
        {scenario &&
          <DERCard
            configuration={scenario.der?.der_configuration}
            strategy={scenario.der?.der_strategy}
          />
        }
      </Flex.Item>
      <Flex.Item className={classes.meterGroup}>
        <MeterGroupChip
          meterGroup={scenario?.meter_group}
          onClick={goToMeterGroup}
          showCount
        />
      </Flex.Item>
    </Flex.Container>
  );

  /** ========================== Callbacks ================================= */
  function goToMeterGroup () {
    if (!scenario || !scenario.meter_group) return;
    history.push(routes.load.meterGroup(scenario.meter_group.id));
  }
};

export const ScenarioResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { loading, scenario } = useScenario(id as string, {
    data_types: 'default',
    include: ['ders', 'meter_group.*', 'report', 'report_summary'],
    period: 60
  });

  return (
    <>
      <PageHeader
        breadcrumbs={[
          ['Dashboard', routes.dashboard.base],
          'Scenario Details'
        ]}
        title="Scenario Details"
      />

      {loading && <Progress circular />}
      {scenario && (
        <>
          <ScenarioContext scenario={scenario} />
          <Tabs>
            <Tabs.Tab title="Aggregate Impacts">
              <AggregateImpactsTab scenario={scenario} />
            </Tabs.Tab>

            <Tabs.Tab title="Customer Impacts">
              <CustomerImpactsTab scenario={scenario} />
            </Tabs.Tab>
          </Tabs>
        </>
      )}
    </>
  );
};
