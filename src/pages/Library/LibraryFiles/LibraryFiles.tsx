import * as React from 'react';
import { useDispatch } from 'react-redux';

import * as api from 'navigader/api';
import {
  Button,
  Divider,
  Link,
  List,
  Menu,
  PageHeader,
  StandardDate,
  StatusIndicator,
  TableFactory,
} from 'navigader/components';
import { routes, usePushRouter } from 'navigader/routes';
import { slices } from 'navigader/store';
import { makeStylesHook } from 'navigader/styles';
import { OriginFile, PaginationQueryParams, PaginationSet } from 'navigader/types';
import { formatters, models } from 'navigader/util';

import { DeleteDialog } from './DeleteDialog';

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(
  (theme) => ({
    uploadButton: {
      marginRight: theme.spacing(2),
    },
  }),
  'LoadPage'
);

/** ============================ Components ================================ */
const Table = TableFactory<OriginFile>();

export const LibraryFiles = () => {
  const routeTo = usePushRouter();
  const classes = useStyles();
  const dispatch = useDispatch();
  const [deleteOriginFile, setDeleteOriginFile] = React.useState<OriginFile>();

  const getOriginFiles = React.useCallback(
    async (state: PaginationQueryParams) => {
      const response = (await api.getMeterGroups({
        object_type: 'OriginFile',
        ...state,
      })) as PaginationSet<OriginFile>;

      // Add the models to the store and yield the pagination results
      models.polling.addMeterGroups(response.data);
      dispatch(slices.models.updateModels(response.data));
      return response;
    },
    [dispatch]
  );

  return (
    <>
      <PageHeader
        actions={
          <>
            <Button className={classes.uploadButton} color="secondary" onClick={routeTo.upload}>
              Upload New File
            </Button>
            <Button color="secondary" onClick={routeTo.dashboard.createScenario.base}>
              Create New Scenario
            </Button>
          </>
        }
        title="Customer Data Library"
      />

      <Table
        aria-label="meter table"
        dataFn={getOriginFiles}
        dataSelector={slices.models.selectOriginFiles}
        initialSorting={{
          dir: 'desc',
          key: 'created_at',
        }}
        raised
      >
        {(originFiles, EmptyRow) => (
          <>
            <Table.Head>
              <Table.Row>
                <Table.Cell sortBy="name">Name</Table.Cell>
                <Table.Cell sortBy="created_at" sortDir="desc">
                  Uploaded
                </Table.Cell>
                <Table.Cell>Status</Table.Cell>
                <Table.Cell align="right">Meter Count</Table.Cell>
                <Table.Cell align="right" sortBy="max_monthly_demand" sortDir="desc">
                  Maximum Monthly Demand (kW)
                </Table.Cell>
                <Table.Cell align="right" sortBy="total_kwh" sortDir="desc">
                  Total kWh
                </Table.Cell>
                <Table.Cell align="right">Menu</Table.Cell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {/** Only renders if there's no data */}
              <EmptyRow>
                <span>No customer data has been uploaded.</span>
                &nbsp;
                <Link to={routes.upload}>Visit the upload page?</Link>
              </EmptyRow>

              {originFiles.map((originFile) => (
                <Table.Row key={originFile.id}>
                  <Table.Cell>
                    {models.meterGroup.isSufficientlyIngested(originFile) ? (
                      <Link to={routes.library.meterGroup(originFile.id)}>{originFile.name}</Link>
                    ) : (
                      originFile.name
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <StandardDate date={originFile.created_at} />
                  </Table.Cell>
                  <Table.Cell>
                    <StatusIndicator meterGroup={originFile} />
                  </Table.Cell>
                  <Table.Cell align="right">{originFile.meter_count}</Table.Cell>
                  <Table.Cell align="right">
                    {formatters.commas(formatters.maxDecimals(originFile.max_monthly_demand, 2))}
                  </Table.Cell>
                  <Table.Cell align="right">
                    {formatters.commas(formatters.maxDecimals(originFile.total_kwh, 2))}
                  </Table.Cell>
                  <Table.Cell align="right">
                    <Menu
                      anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
                      icon="verticalDots"
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                      <List.Item
                        disabled={!models.meterGroup.isSufficientlyIngested(originFile)}
                        onClick={routeTo.originFile(originFile)}
                      >
                        <List.Item.Icon icon="launch" />
                        <List.Item.Text>View</List.Item.Text>
                      </List.Item>

                      <Divider />

                      <List.Item onClick={() => openDeleteDialog(originFile)}>
                        <List.Item.Icon icon="trash" />
                        <List.Item.Text>Delete</List.Item.Text>
                      </List.Item>
                    </Menu>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </>
        )}
      </Table>

      {deleteOriginFile && (
        <DeleteDialog
          onClose={() => setDeleteOriginFile(undefined)}
          originFile={deleteOriginFile}
        />
      )}
    </>
  );

  /** ========================== Callbacks ================================= */
  function openDeleteDialog(originFile: OriginFile) {
    setDeleteOriginFile(originFile);
  }
};
