import { useRoutes } from 'react-router-dom';
import routes from './routers';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AuthContextProvider } from './contexts/AuthContext';
import { NotificationContextProvider } from './contexts/NotificationContext';
import { theme } from './themes/theme';

import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

function App() {
  const content = useRoutes(routes);

  return (
    <ThemeProvider theme={theme()}>
      <AuthContextProvider>
        <NotificationContextProvider>
          <CssBaseline />
          {content}
        </NotificationContextProvider>
      </AuthContextProvider>
    </ThemeProvider>
  );
}

export default App;
