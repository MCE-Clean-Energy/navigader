import * as React from 'react';
import { cleanup, fireEvent, waitFor } from '@testing-library/react';
import range from 'lodash/range';

import { asyncForEach, renderContextDependentComponent } from 'navigader/util/testing';
import { Table } from './Table';


describe('`Table` component', () => {
  describe('`TablePagination` component', () => {
    it('should show pagination if there are more than 10 records', async () => {
      const data = range(25).map(n => ({ id: n }));
      const { getAllByRole, getByTestId, getByTitle } = renderContextDependentComponent(
        <Table
          dataFn={({ currentPage, rowsPerPage }) => Promise.resolve({
            count: data.length,
            data: data.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage)
          })}
          dataSelector={() => data}
        >
          {data =>
            <Table.Body>
              {data.map(datum =>
                <Table.Row key={datum.id}>
                  <Table.Cell>{datum.id}</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          }
        </Table>
      );
      
      // Wait for the data to render
      await waitFor(() => {
        expect(getAllByRole('row')[0].textContent).toEqual('0');
      });
      
      // Pagination should be present
      expect(getByTestId('table-pagination')).toBeInTheDocument();
      
      // Change to the next page
      fireEvent.click(getByTitle('Next page'));
      
      // Wait for the data to re-render
      await waitFor(() => {
        expect(getAllByRole('row')[0].textContent).toEqual('0');
      });
      
      // Pagination should still be there, even though there are less than 10 records on the page
      expect(getByTestId('table-pagination')).toBeInTheDocument();
    });
    
    it('should not show pagination if there are 10 or fewer records', () => {
      asyncForEach(range(0, 10), async (n) => {
        const data = range(n).map(m => ({ id: m }));
        const { getAllByRole, getByTestId, getByTitle } = renderContextDependentComponent(
          <Table
            dataFn={({ currentPage, rowsPerPage }) => Promise.resolve({
              count: data.length,
              data: data.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage)
            })}
            dataSelector={() => data}
          >
            {data =>
              <Table.Body>
                {data.map(datum =>
                  <Table.Row key={datum.id}>
                    <Table.Cell>{datum.id}</Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            }
          </Table>
        );
        
        // Wait for the data to render
        await waitFor(() => {
          expect(getAllByRole('row')[0].textContent).toEqual('0');
        });
        
        // Pagination should not be present
        expect(getByTestId('table-pagination')).not.toBeInTheDocument();
        await cleanup();
      });
    });
  });
});
