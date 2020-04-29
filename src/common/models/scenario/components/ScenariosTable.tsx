import * as React from 'react';
import { useDispatch } from 'react-redux';

import * as api from '@nav/common/api';
import {
  Flex, Link, PaginationState, PrefetchedTable, Progress, Table, Tooltip, Typography
} from '@nav/common/components';
import { Components } from '@nav/common/models/der';
import { Scenario } from '@nav/common/models/scenario';
import * as routes from '@nav/common/routes';
import { selectModels, updateModels } from '@nav/common/store/slices/models';
import { formatters, kwToMw } from '@nav/common/util';


/** ============================ Types ===================================== */
type ScenariosTableProps = {
  actionsMenu?: (scenario: Scenario) => React.ReactElement;
  onSelect?: (selections: Scenario[]) => void;
  NoScenariosRow?: React.ReactElement;
  scenarios?: Scenario[];
};

type ScenarioStatusProps = {
  scenario: Scenario;
};

/** ============================ Components ================================ */
const ScenarioStatus: React.FC<ScenarioStatusProps> = ({ scenario }) => {
  const { is_complete, percent_complete } = scenario.progress;
  if (is_complete) return <Typography variant="body1">Done</Typography>;
  return (
    <Tooltip title={`${Math.floor(percent_complete)}%`}>
      <Progress circular value={Math.max(percent_complete, 3)} showBackground />
    </Tooltip>
  );
};

export const ScenariosTable: React.FC<ScenariosTableProps> = (props) => {
  const { actionsMenu, NoScenariosRow, onSelect, scenarios } = props;
  const dispatch = useDispatch();
  
  const getScenarios = React.useCallback(
    async (state: PaginationState) => {
      const response = await api.getScenarios({
        include: ['ders', 'meter_groups', 'report_summary'],
        page: state.currentPage + 1,
        page_size: state.rowsPerPage
      });
      
      // Add the models to the store and yield the pagination results
      dispatch(updateModels(response.data));
      return response
    },
    [dispatch]
  );
  
  const TableComponent: React.ElementType = scenarios ? PrefetchedTable : Table;
  const tableProps = scenarios
    ? { data: scenarios }
    : { dataFn: getScenarios, dataSelector: selectModels('scenarios') };
  
  return (
    <TableComponent
      {...tableProps}
      aria-label="scenarios table"
      disableSelect={(scenario: Scenario) => !scenario.progress.is_complete}
      onSelect={onSelect}
      raised
      stickyHeader
      title="Scenarios"
    >
      {(scenarios: Scenario[], EmptyRow: React.ElementType) =>
        <>
          <Table.Head>
            <Table.Row>
              <Table.Cell>Name</Table.Cell>
              <Table.Cell>Created</Table.Cell>
              <Table.Cell>Customer Segment (#)</Table.Cell>
              <Table.Cell>DER</Table.Cell>
              <Table.Cell>Program Strategy</Table.Cell>
              <Table.Cell align="right">CCA Bill ($/year)</Table.Cell>
              <Table.Cell align="right">CNS 2022 Delta (tCO<sub>2</sub>/year)</Table.Cell>
              <Table.Cell align="right">RA (MW/year)</Table.Cell>
              <Table.Cell>Status</Table.Cell>
              {actionsMenu && <Table.Cell>Menu</Table.Cell>}
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {/** Only renders if there's no data */}
            <EmptyRow colSpan={10}>
              {NoScenariosRow}
            </EmptyRow>
            
            {scenarios.map(scenario =>
              <Table.Row key={scenario.id}>
                <Table.Cell>
                  {scenario.progress.is_complete
                    ? (
                      <Link to={routes.scenario(scenario.id)}>
                        {scenario.name}
                      </Link>
                    )
                    : scenario.name
                  }
                </Table.Cell>
                <Table.Cell>{formatters.standardDate(scenario.created_at)}</Table.Cell>
                <Table.Cell>
                  {scenario.meter_group &&
                    <span>{scenario.meter_group.name} ({scenario.meter_group.meter_count})</span>
                  }
                </Table.Cell>
                <Table.Cell>
                  {scenario.der &&
                    <Flex.Container alignItems="center">
                      <Flex.Item>
                        <Components.DERIcon type={scenario.der.der_configuration.der_type} />
                      </Flex.Item>
                      <Flex.Item>
                        {scenario.der.der_configuration.name}
                      </Flex.Item>
                    </Flex.Container>
                  }
                </Table.Cell>
                <Table.Cell>
                  {scenario.der && scenario.der.der_strategy.name}
                </Table.Cell>
                <Table.Cell align="right">
                  {formatters.maxDecimals(scenario.report_summary?.BillDelta, 2)}
                </Table.Cell>
                <Table.Cell align="right">
                  {formatters.maxDecimals(scenario.report_summary?.CleanNetShort2022Delta, 2)}
                </Table.Cell>
                <Table.Cell align="right">
                  {formatters.maxDecimals(kwToMw(scenario.report_summary?.RADelta), 2)}
                </Table.Cell>
                <Table.Cell>
                  <ScenarioStatus scenario={scenario} />
                </Table.Cell>
                {actionsMenu && <Table.Cell>{actionsMenu(scenario)}</Table.Cell>}
              </Table.Row>
            )}
          </Table.Body>
        </>
      }
    </TableComponent>
  );
};
