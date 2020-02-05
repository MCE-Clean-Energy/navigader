import React from 'react';

import { ThemeProvider } from '@tv/shared/wrappers';
import Login from './pages/Login';


/** ============================ Components ================================ */
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Login />
    </ThemeProvider>
  );
};

/** ============================ Exports =================================== */
export default App;
