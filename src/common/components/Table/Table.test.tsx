import _ from 'lodash';
import * as React from 'react';
import { cleanup, fireEvent, waitFor } from '@testing-library/react';

import { ObjectWithId, TableProps } from 'navigader/types';
import { asyncForEach, renderContextDependentComponent } from 'navigader/util/testing';

import { Table } from './Table';

describe('`Table` component', () => {
  function renderTable(data: ObjectWithId[], tableProps?: Partial<TableProps<ObjectWithId>>) {
    const results = renderContextDependentComponent(
      <Table
        dataFn={({ page, pageSize }) =>
          Promise.resolve({
            count: data.length,
            data: data.slice(page * pageSize, (page + 1) * pageSize),
          })
        }
        dataSelector={() => data}
        {...tableProps}
      >
        {(data) => (
          <Table.Body>
            {data.map((datum) => (
              <Table.Row key={datum.id}>
                <Table.Cell>{datum.id}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        )}
      </Table>
    );

    return {
      ...results,

      // Useful helper methods
      waitForProgressBarToRender: async () => {
        await waitFor(() => {
          expect(results.queryByRole('progressbar')).toBeInTheDocument();
        });
      },

      waitForProgressBarToVanish: async () => {
        await waitFor(() => {
          expect(results.queryByRole('progressbar')).toBeNull();
        });
      },
    };
  }

  describe('`TablePagination` component', () => {
    it('should show pagination if there are more than 20 records', async () => {
      const data = _.range(25).map((id) => ({ id }));
      const results = renderTable(data, { title: 'Test Table' });
      await results.waitForProgressBarToVanish();

      // Pagination should be present
      expect(results.getByTestId('table-pagination')).toBeInTheDocument();

      // Change to the next page
      fireEvent.click(results.getByTitle('Next page'));

      // Wait for the data to re-render
      await results.waitForProgressBarToRender();
      await results.waitForProgressBarToVanish();

      // Pagination should still be there, even though there are less than 10 records on the page
      expect(results.getByTestId('table-pagination')).toBeInTheDocument();
    });

    it('should not show pagination if there are 20 or fewer records', async () => {
      await asyncForEach(_.range(20), async (n) => {
        const data = _.range(n + 1).map((id) => ({ id }));
        const results = renderTable(data, { title: 'Test Table' });
        await results.waitForProgressBarToVanish();

        // Pagination should not be present
        expect(results.queryByTestId('table-pagination')).toBeNull();
        await cleanup();
      });
    });
  });

  describe('table toolbar', () => {
    it('should render the toolbar if there is a title', async () => {
      const results = renderTable([], { title: 'Test Table' });
      await results.waitForProgressBarToVanish();
      expect(results.getByTestId('table-toolbar')).toBeInTheDocument();
    });

    it('should render the toolbar if there is more than 20 records', async () => {
      const data = _.range(25).map((id) => ({ id }));
      const results = renderTable(data);
      await results.waitForProgressBarToVanish();
      expect(results.getByTestId('table-toolbar')).toBeInTheDocument();
    });

    it('should render the toolbar if there are any header actions', async () => {
      const results = renderTable([], { headerActions: <span /> });
      await results.waitForProgressBarToVanish();
      expect(results.getByTestId('table-toolbar')).toBeInTheDocument();
    });

    it('should not render the toolbar if there is no title, header actions and less than 20 records', async () => {
      await asyncForEach(_.range(20), async (n) => {
        const data = _.range(n).map((id) => ({ id }));
        const results = renderTable(data);
        await results.waitForProgressBarToVanish();

        // Pagination should not be present
        expect(results.queryByTestId('table-toolbar')).toBeNull();
        await cleanup();
      });
    });
  });
});
