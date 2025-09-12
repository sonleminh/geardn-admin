import { useRoutes } from 'react-router-dom';
import routes from './routers';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AuthContextProvider } from './contexts/AuthContext';
import { AlertContextProvider } from './contexts/AlertContext';
import { theme } from './themes/theme';
import { useAdminSSE } from './hooks/useSSE';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

function App() {
  const content = useRoutes(routes);
  useAdminSSE();
  return (
    <ThemeProvider theme={theme()}>
      <AuthContextProvider>
        <AlertContextProvider>
          <CssBaseline />
          {content}
        </AlertContextProvider>
      </AuthContextProvider>
    </ThemeProvider>
  );
}

export default App;
