import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, fireEvent } from '@testing-library/react'

import { AppRoutes } from '../../App';


describe('Back button', () => {
  test('Clicking the back button returns you to the load page', () => {
    const { getByRole, getByText } = render(
      <MemoryRouter initialEntries={["/meter_group/2"]}>
        <AppRoutes />
      </MemoryRouter>
    );
    
    // Click on the back button
    expect(getByRole('button')).toBeInTheDocument();
    fireEvent.click(getByRole('button'));
  
    // check that the content changed to the new page
    expect(getByText('Uploaded Files')).toBeInTheDocument();
  });
});
