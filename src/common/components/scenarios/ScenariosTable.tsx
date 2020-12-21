import _ from 'lodash';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import * as api from 'navigader/api';
import { routes } from 'navigader/routes';
import { slices } from 'navigader/store';
import { ColorMap } from 'navigader/styles';
import {
  DisabledSelectComponent,
  PaginationQueryParams,
  Scenario,
  ScenarioReportSummary,
} from 'navigader/types';
import { formatters, models, omitFalsey, printWarning } from 'navigader/util';
import { Avatar } from '../Avatar';
import { StandardDate } from '../Date';
import { DERIcon } from '../ders';
import * as Flex from '../Flex';
import { Link } from '../Link';
import { MeterGroupChip, StatusIndicator } from '../MeterGroupComponents';
import { Switch } from '../Switch';
import { PrefetchedTable, TableFactory } from '../Table';
import { Tooltip } from '../Tooltip';
import { ImpactColumn } from './ImpactColumn';

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

/** ============================ Components ================================ */
const Table = TableFactory<Scenario>();
const ScenarioStatus: DisabledSelectComponent<Scenario> = ({ datum }) => (
  <StatusIndicator meterGroup={datum} />
);

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
    updateAveraged,
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
    async (params: PaginationQueryParams) => {
      const response = await api.getScenarios({
        include: ['ders', 'meter_group.*', 'report_summary'],
        ...params,
      });

      // Unfinished scenarios should be polled for
      const scenarios = response.data;
      const meterGroups = omitFalsey(_.map(scenarios, 'meter_group'));
      models.polling.addScenarios(scenarios);
      models.polling.addMeterGroups(meterGroups);

      // Add the models to the store and yield the pagination results
      dispatch(slices.models.updateModels([...meterGroups, ...scenarios]));
      return response;
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
      initialSorting={{
        dir: 'desc',
        key: 'created_at',
      }}
      onSelect={onSelect}
      raised
      title={title}
    >
      {(scenarios: Scenario[], EmptyRow: React.ElementType) => (
        <>
          <Table.Head>
            <Table.Row>
              {colorMap && <Table.Cell />}
              <Table.Cell sortBy="name">Name</Table.Cell>
              <Table.Cell sortBy="created_at" sortDir="desc">
                Created
              </Table.Cell>
              <Table.Cell sortBy="meter_group.name">Customer Segment</Table.Cell>
              <Table.Cell sortBy="der_configuration.name">DER</Table.Cell>
              <Table.Cell sortBy="der_strategy.name">Program Strategy</Table.Cell>
              <ImpactColumn.Header
                averaged={innerAveraged}
                column="Usage Impact"
                info={{
                  measuresImpact: 'in customer electricity usage',
                  negativeMeans: 'electricity consumption from the grid has gone down',
                  positiveMeans: 'electricity consumption from the grid has gone up',
                }}
                units="kWh"
              />
              <ImpactColumn.Header
                averaged={innerAveraged}
                column="GHG Impact"
                info={{
                  measuresImpact: 'in GHG emissions',
                  negativeMeans: 'GHG emissions have gone down',
                  positiveMeans: 'GHG emissions have gone up',
                }}
                units={
                  <>
                    tCO<sub>2</sub>
                  </>
                }
              />
              <ImpactColumn.Header
                averaged={innerAveraged}
                column="RA Impact"
                info={{
                  measuresImpact: 'to resource adequacy requirements',
                  negativeMeans: 'resource adequacy requirements have gone down',
                  positiveMeans: 'resource adequacy requirements have gone up',
                }}
                units="kW"
              />
              <ImpactColumn.Header
                averaged={innerAveraged}
                column="Procurement Cost"
                info={{
                  measuresImpact: 'to expenses incurred procuring electricity',
                  negativeMeans: 'CCA procurement expenses have gone down',
                  positiveMeans: 'CCA procurement expenses have gone up',
                }}
                units="$"
              />
              <ImpactColumn.Header
                averaged={innerAveraged}
                column="Revenue Impact"
                info={{
                  measuresImpact: "to CCA's electricity sales",
                  negativeMeans: 'revenues from electricity sales have gone down',
                  positiveMeans: 'revenues from electricity sales have gone up',
                }}
                units="$"
              />
              <ImpactColumn.Header
                averaged={innerAveraged}
                column="Expenses Impact"
                info={{
                  measuresImpact:
                    'to overall expenses. Calculated as procurement expenses plus $/kW RA' +
                    'impacts',
                  negativeMeans: 'overall expenses have gone down',
                  positiveMeans: 'overall expenses have gone up',
                }}
                units="$"
              />
              <ImpactColumn.Header
                averaged={innerAveraged}
                column="Profits Impact"
                info={{
                  measuresImpact: 'to overall profits. Calculated as revenues minus expenses',
                  negativeMeans: 'overall profits have gone down',
                  positiveMeans: 'overall profits have gone up',
                }}
                units="$"
              />
              {actionsMenu && <Table.Cell>Menu</Table.Cell>}
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {/** Only renders if there's no data */}
            <EmptyRow colSpan={10}>{NoScenariosRow}</EmptyRow>

            {scenarios.map((scenario) => (
              <Table.Row key={scenario.id}>
                {colorMap && (
                  <Table.Cell>
                    <Avatar color={colorMap?.getColor(scenario.id)} size="small">
                      &nbsp;
                    </Avatar>
                  </Table.Cell>
                )}
                <Table.Cell>
                  {scenario.progress.is_complete ? (
                    <Link to={routes.scenario(scenario.id)}>{scenario.name}</Link>
                  ) : (
                    scenario.name
                  )}
                </Table.Cell>
                <Table.Cell>
                  <StandardDate date={scenario.created_at} />
                </Table.Cell>
                <Table.Cell>
                  <MeterGroupChip link meterGroup={scenario.meter_group} />
                </Table.Cell>
                <Table.Cell>
                  {scenario.der && (
                    <Flex.Container alignItems="center">
                      <Flex.Item>
                        <DERIcon type={scenario.der.der_configuration.der_type} />
                      </Flex.Item>
                      <Flex.Item>{scenario.der.der_configuration.name}</Flex.Item>
                    </Flex.Container>
                  )}
                </Table.Cell>
                <Table.Cell>
                  {scenario.der && (
                    <Tooltip title={models.der.getStrategyDescription(scenario.der.der_strategy)}>
                      <div>{scenario.der.der_strategy.name}</div>
                    </Tooltip>
                  )}
                </Table.Cell>
                <Table.Cell align="right">
                  {formatters.commas(
                    formatters.maxDecimals(getField(scenario, 'UsageDelta', innerAveraged), 2)
                  ) ?? '--'}
                </Table.Cell>
                <ImpactColumn
                  costCalculation={getField(scenario, 'GHGDelta', innerAveraged)}
                  costFnClass="ghg_rate"
                  scenario={scenario}
                >
                  {(n) => formatters.commas(formatters.maxDecimals(n, 2)) ?? '--'}
                </ImpactColumn>
                <ImpactColumn
                  costCalculation={getField(scenario, 'RADelta', innerAveraged)}
                  costFnClass="system_profile"
                  scenario={scenario}
                >
                  {(n) => formatters.commas(formatters.maxDecimals(n, 2)) ?? '--'}
                </ImpactColumn>
                <ImpactColumn
                  costCalculation={getField(scenario, 'ProcurementCostDelta', innerAveraged)}
                  costFnClass="procurement_rate"
                  scenario={scenario}
                >
                  {(n) => formatters.dollars(n) ?? '--'}
                </ImpactColumn>
                <ImpactColumn
                  costCalculation={getField(scenario, 'BillRevenueDelta', innerAveraged)}
                  costFnClass="rate_plan"
                  scenario={scenario}
                >
                  {(n) => formatters.dollars(n) ?? '--'}
                </ImpactColumn>
                <Table.Cell align="right">
                  {formatters.dollars(getField(scenario, 'ExpenseDelta', innerAveraged)) ?? '--'}
                </Table.Cell>
                <Table.Cell align="right">
                  {formatters.dollars(getField(scenario, 'ProfitDelta', innerAveraged)) ?? '--'}
                </Table.Cell>
                {actionsMenu && <Table.Cell>{actionsMenu(scenario)}</Table.Cell>}
              </Table.Row>
            ))}
          </Table.Body>
        </>
      )}
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
  function handleSwitchToggle(checked: boolean) {
    if (hasAveragedProp && updateAveraged) {
      updateAveraged(checked);
    } else {
      setAveraged(checked);
    }
  }

  /** ========================== Helpers =================================== */
  function getField(scenario: Scenario, field: keyof ScenarioReportSummary, averaged: boolean) {
    const value = scenario.report_summary?.[field];
    if (typeof value !== 'number') return;
    return averaged ? value / scenario.meter_count : value;
  }
};
