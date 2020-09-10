import * as React from 'react';
import { useDispatch } from 'react-redux';

import * as api from 'navigader/api';
import * as routes from 'navigader/routes';
import { slices } from 'navigader/store';
import { ColorMap } from 'navigader/styles';
import { Scenario, ScenarioReportSummary } from 'navigader/types';
import { models, omitFalsey, printWarning } from 'navigader/util';
import { commas, date, dollars, maxDecimals } from 'navigader/util/formatters';
import _ from 'navigader/util/lodash';
import { Avatar } from '../Avatar';
import { DERIcon } from '../ders';
import * as Flex from '../Flex';
import { Icon } from '../Icon';
import { Link } from '../Link';
import { Progress } from '../Progress';
import { Switch } from '../Switch';
import { PaginationState, PrefetchedTable, Table } from '../Table';
import { Tooltip } from '../Tooltip';
import { Typography } from '../Typography';


/** ============================ Types ===================================== */
type ScenariosTableProps = {
  actionsMenu?: (scenario: Scenario) => React.ReactElement;
  averaged?: boolean;
  className?: string;
  colorMap?: ColorMap;
  NoScenariosRow?: React.ReactElement;
  onSelect?: (selections: Scenario[]) => void;
  scenarios?: Scenario[];
  title?: React.ReactNode;
  updateAveraged?: (averaged: boolean) => void;
};

type ScenarioStatusProps = {
  datum: Scenario;
};

/** ============================ Components ================================ */
const ScenarioStatus: React.FC<ScenarioStatusProps> = ({ datum: scenario }) => {
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
    title = 'Scenarios',
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
      const meterGroups = omitFalsey(_.map(scenarios, 'meter_group'));
      models.polling.addScenarios(scenarios);
      models.polling.addMeterGroups(meterGroups);

      // Add the models to the store and yield the pagination results
      dispatch(slices.models.updateModels([...meterGroups, ...scenarios]));
      return response
    },
    [dispatch]
  );

  const TableComponent: React.ElementType = scenarios ? PrefetchedTable : Table;
  const tableProps = scenarios
    ? { data: scenarios }
    : { dataFn: getScenarios, dataSelector: slices.models.selectScenarios };

  return (
    <TableComponent
      {...tableProps}
      aria-label="scenarios table"
      containerClassName={className}
      disableSelect={(scenario: Scenario) => !scenario.progress.is_complete}
      DisabledSelectComponent={ScenarioStatus}
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
      title={title}
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
                <Tooltip title="Calculated using CNS 2022 tables">
                  <div>GHG Impact (tCO<sub>2</sub>/year{innerAveraged && '/SAID'})</div>
                </Tooltip>
              </Table.Cell>
              <Table.Cell align="right">
                <Tooltip title="CCA’s electricity sales impact">
                  <div>
                    Revenue Impact ($/year{innerAveraged && '/SAID'})
                  </div>
                </Tooltip>
              </Table.Cell>
              <Table.Cell align="right">
                Procurement Cost ($/year{innerAveraged && '/SAID'})
              </Table.Cell>
              <Table.Cell align="right">RA Impact (kW/year{innerAveraged && '/SAID'})</Table.Cell>
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
                <Table.Cell>
                  <Typography noWrap variant="body2">{date.standard(scenario.created_at)}</Typography>
                </Table.Cell>
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
                        <DERIcon type={scenario.der.der_configuration.der_type} />
                      </Flex.Item>
                      <Flex.Item>
                        {scenario.der.der_configuration.name}
                      </Flex.Item>
                    </Flex.Container>
                  }
                </Table.Cell>
                <Table.Cell>
                  {scenario.der &&
                    <Tooltip title={models.der.getStrategyDescription(scenario.der.der_strategy)}>
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
                      ? commas(maxDecimals(getField(scenario, 'CleanNetShort2022Delta', innerAveraged), 2))
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
                <Table.Cell align="right">
                  {
                    scenario.progress.is_complete
                      ? commas(maxDecimals(getField(scenario, 'RADelta', innerAveraged), 2))
                      : '-'
                  }
                </Table.Cell>
                {actionsMenu && <Table.Cell>{actionsMenu(scenario)}</Table.Cell>}
              </Table.Row>
            )}
          </Table.Body>
        </>
      }
    </TableComponent>
  );

  /** ========================== Callbacks ================================= */
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

  /** ========================== Helpers =================================== */
  function getField (scenario: Scenario, field: keyof ScenarioReportSummary, averaged: boolean) {
    const value = scenario.report_summary?.[field];
    if (typeof value !== 'number') return;
    return averaged ? value / scenario.meter_count : value;
  }
};
