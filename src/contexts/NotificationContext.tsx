import { Alert, AlertColor, Snackbar } from '@mui/material';
import { ReactNode, createContext, useContext, useState } from 'react';

interface INotificationContext {
  showNotification: (message: ReactNode, severity?: AlertColor) => void;
}

const NotificationContext = createContext<INotificationContext | undefined>(
  undefined
);

export const NotificationContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [message, setMessage] = useState<ReactNode>('');
  const [severity, setSeverity] = useState<AlertColor>('success');
  const [open, isOpen] = useState(false);

  const showNotification = (
    message: ReactNode,
    severity: AlertColor = 'success'
  ) => {
    isOpen(true);
    setMessage(message);
    setSeverity(severity);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {open && (
        <Snackbar
          open={open}
          autoHideDuration={3000}
          onClose={() => isOpen(false)}>
          <Alert variant='filled' severity={severity}>
            {message}
          </Alert>
        </Snackbar>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = (): INotificationContext => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotificationContext must be used within a NotificationContextProvider'
    );
  }
  return context;
};
