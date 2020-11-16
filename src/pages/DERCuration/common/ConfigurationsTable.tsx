import * as React from 'react';
import { useDispatch } from 'react-redux';

import { Button, StandardDate, TableFactory } from 'navigader/components';
import { slices } from 'navigader/store';
import { DataSelector, DERConfiguration, TableProps } from 'navigader/types';
import { hooks } from 'navigader/util';

import { DialogProps } from './util';

/** ============================ Types ===================================== */
type ConfigurationsTableProps<T extends DERConfiguration> = Pick<TableProps<T>, 'dataFn'> & {
  configurationData: (configuration: T) => React.ReactNode;
  configurationHeaders: React.ReactNode;
  Dialog: React.FC<DialogProps<T>>;
};

/** ============================ Components ================================ */
export function ConfigurationsTable<T extends DERConfiguration>({
  configurationData,
  configurationHeaders,
  dataFn,
  Dialog,
}: ConfigurationsTableProps<T>) {
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const tableRef = hooks.useTableRef<T>();

  // Memoize the table component so we're not rendering a different component with every render
  const Table = React.useMemo(() => TableFactory<T>(), []);

  // The `selectDERConfigurations` selector technically returns `DERConfiguration` objects.
  // Filtering down to only the configurations of the proper type is a responsibility handled by
  // the `Table`.
  const dataSelector = slices.models.selectDERConfigurations as DataSelector<T>;

  return (
    <>
      <Table
        aria-label="configurations table"
        dataFn={async (params) => {
          const response = await dataFn(params);
          dispatch(slices.models.updateModels(response.data));
          return response;
        }}
        dataSelector={dataSelector}
        initialSorting={{ key: 'created_at', dir: 'desc' }}
        onFabClick={() => setDialogOpen(true)}
        raised
        ref={tableRef}
        stickyHeader
        title="Configurations"
      >
        {(configurations, EmptyRow) => (
          <>
            <Table.Head>
              <Table.Row>
                <Table.Cell sortBy="name">Name</Table.Cell>
                <Table.Cell sortBy="created_at">Created</Table.Cell>
                {configurationHeaders}
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {/** Only renders if there's no data */}
              <EmptyRow colSpan={10}>
                None created.{' '}
                <Button.Text
                  color="primary"
                  icon="plus"
                  onClick={() => setDialogOpen(true)}
                  size="small"
                >
                  Create configuration
                </Button.Text>
              </EmptyRow>

              {configurations.map((configuration) => (
                <Table.Row key={configuration.id}>
                  <Table.Cell>{configuration.name}</Table.Cell>
                  <Table.Cell>
                    <StandardDate date={configuration.created_at} />
                  </Table.Cell>
                  {configurationData(configuration)}
                </Table.Row>
              ))}
            </Table.Body>
          </>
        )}
      </Table>

      <Dialog closeDialog={() => setDialogOpen(false)} tableRef={tableRef} open={dialogOpen} />
    </>
  );
}
