import * as React from 'react';
import { useDispatch } from 'react-redux';

import { Button, Dialog, StandardDate, TableFactory, Typography } from 'navigader/components';
import { slices } from 'navigader/store';
import { makeStylesHook } from 'navigader/styles';
import { DataSelector, DERStrategy, TableProps } from 'navigader/types';
import { hooks } from 'navigader/util';

import { deleteDERStrategy, DialogProps } from './util';

/** ============================ Types ===================================== */
type StrategiesTableProps<T extends DERStrategy> = Pick<TableProps<T>, 'dataFn'> & {
  strategyData?: (strategy: T) => React.ReactNode;
  strategyHeaders?: React.ReactNode;
  Dialog: React.FC<DialogProps<T>>;
  width: number;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook<{ width: number }>(
  () => ({ description: ({ width }) => ({ maxWidth: width }) }),
  'StrategiesTable'
);

/** ============================ Components ================================ */
const { Delete: DeleteDialog } = Dialog;
export function StrategiesTable<T extends DERStrategy>(props: StrategiesTableProps<T>) {
  const { dataFn, strategyData, strategyHeaders, Dialog, width } = props;
  const dispatch = useDispatch();
  const classes = useStyles({ width });
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const tableRef = hooks.useTableRef<T>();
  const [strategyToDelete, setStrategyToDelete] = React.useState<DERStrategy>();

  // Memoize the table component so we're not rendering a different component with every render
  const Table = React.useMemo(() => TableFactory<T>(), []);

  // The `selectDERStrategies` selector technically returns `DERStrategy` objects. Filtering down to
  // only the strategies of the proper type is a responsibility handled by the `Table`.
  const dataSelector = slices.models.selectDERStrategies as DataSelector<T>;

  return (
    <>
      <Table
        aria-label="battery strategies table"
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
        title="Strategies"
      >
        {(strategies, EmptyRow) => (
          <>
            <Table.Head>
              <Table.Row>
                <Table.Cell sortBy="name">Name</Table.Cell>
                <Table.Cell sortBy="created_at">Created</Table.Cell>
                {strategyHeaders}
                <Table.Cell>Description</Table.Cell>
                <Table.Cell>Delete</Table.Cell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {/** Only renders if there's no data */}
              <EmptyRow>
                None created.{' '}
                <Button.Text
                  color="primary"
                  icon="plus"
                  onClick={() => setDialogOpen(true)}
                  size="small"
                >
                  Create Strategy
                </Button.Text>
              </EmptyRow>

              {strategies.map((strategy) => (
                <Table.Row key={strategy.id}>
                  <Table.Cell>{strategy.name}</Table.Cell>
                  <Table.Cell>
                    <StandardDate date={strategy.created_at} />
                  </Table.Cell>
                  {strategyData && strategyData(strategy)}
                  <Table.Cell>
                    <Typography.LineLimit className={classes.description} limit={2}>
                      {strategy.description || '-'}
                    </Typography.LineLimit>
                  </Table.Cell>
                  <Table.Cell>
                    <Button icon="trash" onClick={() => onDelete(strategy)} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </>
        )}
      </Table>

      <Dialog closeDialog={() => setDialogOpen(false)} open={dialogOpen} tableRef={tableRef} />
      <DeleteDialog
        onClose={() => setStrategyToDelete(undefined)}
        onClickDelete={deleteStrategy}
        title={`Delete ${strategyToDelete?.name}`}
        message="This will permanently delete the object and cannot be undone."
        open={strategyToDelete !== undefined}
      />
    </>
  );
  /** ========================== Callbacks ================================= */
  function onDelete(strategy: DERStrategy) {
    setStrategyToDelete(strategy);
  }

  async function deleteStrategy() {
    if (strategyToDelete) {
      const success = await deleteDERStrategy(strategyToDelete, dispatch);
      if (success) setStrategyToDelete(undefined);
    }
  }
}
