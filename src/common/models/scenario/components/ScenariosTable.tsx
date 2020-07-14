import * as React from 'react';
import { useDispatch } from 'react-redux';

import * as api from 'navigader/api';
import {
  Avatar, Flex, Icon, Link, PaginationState, PrefetchedTable, Progress, Switch, Table, Tooltip
} from 'navigader/components';
import { poller } from 'navigader/models/common';
import { Components, getStrategyDescription } from 'navigader/models/der';
import * as routes from 'navigader/routes';
import { selectModels, updateModels } from 'navigader/store/slices/models';
import { ColorMap } from 'navigader/styles';
import { Scenario, ScenarioReportSummary } from 'navigader/types';
import { kwToMw, printWarning } from 'navigader/util';
import { commas, date, dollars, maxDecimals } from 'navigader/util/formatters';
import _ from 'navigader/util/lodash';


/** ============================ Types ===================================== */
type ScenariosTableProps = {
  actionsMenu?: (scenario: Scenario) => React.ReactElement;
  averaged?: boolean;
  className?: string;
  colorMap?: ColorMap;
  NoScenariosRow?: React.ReactElement;
  onSelect?: (selections: Scenario[]) => void;
  scenarios?: Scenario[];
  updateAveraged?: (averaged: boolean) => void;
};

type ScenarioStatusProps = {
  scenario: Scenario;
};

/** ============================ Components ================================ */
const ScenarioStatus: React.FC<ScenarioStatusProps> = ({ scenario }) => {
  const { has_run, is_complete, percent_complete } = scenario.progress;

  // Show the checkmark if the report has completed and aggregated
  if (is_complete) {
    return (
      <Tooltip title="Done">
        <Icon color="green" name="checkMark" />
      </Tooltip>
    );
  } else if (has_run) {
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

export const ScenariosTable: React.FC<ScenariosTableProps> = (props) => {
  const {
    actionsMenu,
    averaged = false,
    className,
    colorMap,
    NoScenariosRow,
    onSelect,
    scenarios,
    updateAveraged
  } = props;
  const dispatch = useDispatch();
  
  // The averaged state can be either maintained by the `ScenariosTable` component itself, or by a
  // parent component
  const hasAveragedProp = props.hasOwnProperty('averaged') && props.averaged !== undefined;
  const hasUpdateAveragedProp = Boolean(updateAveraged);
  
  if ((hasAveragedProp && !hasUpdateAveragedProp) || (hasUpdateAveragedProp && !hasAveragedProp)) {
    printWarning(
      '`ScenariosTable` component expects both or neither of the `averaged` and ' +
      '`updateAveraged` props.'
    );
  }
  
  const [innerAveraged, setAveraged] = React.useState(averaged);
  React.useEffect(() => {
    if (hasAveragedProp) {
      // If the `props` object has the `averaged` prop provided by a parent component, update state
      setAveraged(averaged);
    }
  }, [averaged, hasAveragedProp]);
  
  const getScenarios = React.useCallback(
    async (state: PaginationState) => {
      const response = await api.getScenarios({
        include: ['ders', 'meter_groups', 'report_summary'],
        page: state.currentPage + 1,
        page_size: state.rowsPerPage
      });

      // Unfinished scenarios should be polled for
      const scenarios = response.data;
      const unfinished = _.filter(scenarios, s => !s.progress.is_complete);
      poller.pollFor(unfinished);

      // Add the models to the store and yield the pagination results
      dispatch(updateModels(scenarios));
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
      containerClassName={className}
      disableSelect={(scenario: Scenario) => !scenario.progress.is_complete}
      headerActions={
        <Tooltip title="Shows the scenario's impacts averaged across all customers">
          <div>
            <Switch
              label="Impact per customer"
              onChange={handleSwitchToggle}
              checked={innerAveraged}
            />
          </div>
        </Tooltip>
      }
      onSelect={onSelect}
      raised
      stickyHeader
      title="Scenarios"
    >
      {(scenarios: Scenario[], EmptyRow: React.ElementType) =>
        <>
          <Table.Head>
            <Table.Row>
              {colorMap && <Table.Cell />}
              <Table.Cell>Name</Table.Cell>
              <Table.Cell>Created</Table.Cell>
              <Table.Cell>Customer Segment</Table.Cell>
              <Table.Cell>DER</Table.Cell>
              <Table.Cell>Program Strategy</Table.Cell>
              <Table.Cell align="right">
                Usage Impact (kWh/year{innerAveraged && '/SAID'})
              </Table.Cell>
              <Table.Cell align="right">
                Revenue Impact ($/year{innerAveraged && '/SAID'})
              </Table.Cell>
              <Table.Cell align="right">
                <Tooltip title="Calculated using CNS 2022 tables">
                  <div>GHG Impact (tCO<sub>2</sub>/year{innerAveraged && '/SAID'})</div>
                </Tooltip>
              </Table.Cell>
              <Table.Cell align="right">RA Impact (MW/year{innerAveraged && '/SAID'})</Table.Cell>
              <Table.Cell align="right">Procurement Cost ($/year{innerAveraged && '/SAID'})</Table.Cell>
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
                {colorMap &&
                  <Table.Cell>
                    <Avatar color={colorMap?.getColor(scenario.id)} size="small">&nbsp;</Avatar>
                  </Table.Cell>
                }
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
                <Table.Cell>{date.standard(scenario.created_at)}</Table.Cell>
                <Table.Cell>
                  {scenario.meter_group &&
                    <Tooltip title={`${scenario.meter_group.meter_count} meters`}>
                      <Link to={routes.meterGroup(scenario.meter_group.id)}>
                        {scenario.meter_group.name}
                      </Link>
                    </Tooltip>
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
                  {scenario.der &&
                    <Tooltip title={getStrategyDescription(scenario.der.der_strategy)}>
                      <div>{scenario.der.der_strategy.name}</div>
                    </Tooltip>
                  }
                </Table.Cell>
                <Table.Cell align="right">
                  {
                    scenario.progress.is_complete
                      ? commas(maxDecimals(getField(scenario, 'UsageDelta', innerAveraged), 2))
                      : '-'
                  }
                </Table.Cell>
                <Table.Cell align="right">
                  {
                    scenario.progress.is_complete
                      ? dollars(getField(scenario, 'BillDelta', innerAveraged))
                      : '-'
                  }
                </Table.Cell>
                <Table.Cell align="right">
                  {
                    scenario.progress.is_complete
                      ? commas(maxDecimals(getField(scenario, 'CleanNetShort2022Delta', innerAveraged), 2))
                      : '-'
                  }
                </Table.Cell>
                <Table.Cell align="right">
                  {
                    scenario.progress.is_complete
                      ? commas(maxDecimals(kwToMw(getField(scenario, 'RADelta', innerAveraged)), 2))
                      : '-'
                  }
                </Table.Cell>
                <Table.Cell align="right">
                  {
                    // IIFE to render the procurement cost, if present
                    (() => {
                      if (!scenario.progress.is_complete) return '-';
                      const procurementValue = getField(scenario, 'PRC_LMPDelta', innerAveraged);
                      return typeof procurementValue === 'number'
                        ? dollars(procurementValue)
                        : '-';
                    })()
                  }
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
  
  /** ============================ Callbacks =============================== */
  /**
   * Updates the `averaged` state. If the state is managed by a parent component, this will call the
   * `updateAveraged` prop; otherwise the component state itself is updated
   *
   * @param {boolean} checked: whether the switch is checked, i.e. `true` if values should be
   *   averaged
   */
  function handleSwitchToggle (checked: boolean) {
    if (hasAveragedProp && updateAveraged) {
      updateAveraged(checked);
    } else {
      setAveraged(checked);
    }
  }
  
  /** ============================ Helpers ================================= */
  function getField (scenario: Scenario, field: keyof ScenarioReportSummary, averaged: boolean) {
    const value = scenario.report_summary?.[field];
    if (typeof value !== 'number') return;
    return averaged ? value / scenario.meter_count : value;
  }
};
