import * as React from 'react';
import { useDispatch } from 'react-redux';

import { Button, ContactSupport, Dialog, StandardDate, TableFactory } from 'navigader/components';
import { slices } from 'navigader/store';
import { DataSelector, DERConfiguration, TableProps } from 'navigader/types';
import { hooks } from 'navigader/util';

import { DialogProps, deleteDERConfiguration } from './util';

/** ============================ Types ===================================== */
type ConfigurationsTableProps<T extends DERConfiguration> = Pick<TableProps<T>, 'dataFn'> & {
  configurationData: (configuration: T) => React.ReactNode;
  configurationHeaders: React.ReactNode;
  Dialog?: React.FC<DialogProps<T>>;
};

/** ============================ Components ================================ */
const { Delete: DeleteDialog } = Dialog;
export function ConfigurationsTable<T extends DERConfiguration>({
  configurationData,
  configurationHeaders,
  dataFn,
  Dialog,
}: ConfigurationsTableProps<T>) {
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [configurationToDelete, setConfigurationToDelete] = React.useState<DERConfiguration>();
  const tableRef = hooks.useTableRef<T>();

  // Memoize the table component so we're not rendering a different component with every render
  const Table = React.useMemo(() => TableFactory<T>(), []);

  // The `selectDERConfigurations` selector technically returns `DERConfiguration` objects.
  // Filtering down to only the configurations of the proper type is a responsibility handled by
  // the `Table`.
  const dataSelector = slices.models.selectDERConfigurations as DataSelector<T>;

  // If no `Dialog` component is provided, the user cannot create/delete configurations
  const canEdit = !!Dialog;

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
        onFabClick={canEdit ? () => setDialogOpen(true) : undefined}
        raised
        ref={tableRef}
        title="Configurations"
      >
        {(configurations, EmptyRow) => (
          <>
            <Table.Head>
              <Table.Row>
                <Table.Cell sortBy="name">Name</Table.Cell>
                <Table.Cell sortBy="created_at">Created</Table.Cell>
                {configurationHeaders}
                {canEdit && <Table.Cell>Delete</Table.Cell>}
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {/** Only renders if there's no data */}
              <EmptyRow>
                None created.{' '}
                {canEdit ? (
                  <Button.Text
                    color="primary"
                    icon="plus"
                    onClick={() => setDialogOpen(true)}
                    size="small"
                  >
                    Create configuration
                  </Button.Text>
                ) : (
                  <span>
                    To create one, please <ContactSupport />.
                  </span>
                )}
              </EmptyRow>

              {configurations.map((configuration) => (
                <Table.Row key={configuration.id}>
                  <Table.Cell>{configuration.name}</Table.Cell>
                  <Table.Cell>
                    <StandardDate date={configuration.created_at} />
                  </Table.Cell>
                  {configurationData(configuration)}
                  {canEdit && (
                    <Table.Cell>
                      <Button icon="trash" onClick={() => onDelete(configuration)} />
                    </Table.Cell>
                  )}
                </Table.Row>
              ))}
            </Table.Body>
          </>
        )}
      </Table>

      {Dialog && (
        <>
          <Dialog closeDialog={() => setDialogOpen(false)} tableRef={tableRef} open={dialogOpen} />
          <DeleteDialog
            onClose={() => setConfigurationToDelete(undefined)}
            onClickDelete={deleteConfiguration}
            title={`Delete ${configurationToDelete?.name}`}
            message="This will permanently delete the object and cannot be undone."
            open={configurationToDelete !== undefined}
          />
        </>
      )}
    </>
  );

  /** ========================== Callbacks ================================= */
  function onDelete(configuration: DERConfiguration) {
    setConfigurationToDelete(configuration);
  }

  async function deleteConfiguration() {
    if (configurationToDelete) {
      const success = await deleteDERConfiguration(configurationToDelete, dispatch);
      if (success) setConfigurationToDelete(undefined);
    }
  }
}
