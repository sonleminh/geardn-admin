import { Alert, AlertColor, Snackbar } from '@mui/material';
import { ReactNode, createContext, useContext, useState } from 'react';

interface IAlertContext {
  showAlert: (message: ReactNode, severity?: AlertColor) => void;
}

const AlertContext = createContext<IAlertContext | undefined>(undefined);

export const AlertContextProvider = ({ children }: { children: ReactNode }) => {
  const [message, setMessage] = useState<ReactNode>('');
  const [severity, setSeverity] = useState<AlertColor>('success');
  const [open, isOpen] = useState(false);

  const showAlert = (message: ReactNode, severity: AlertColor = 'success') => {
    isOpen(true);
    setMessage(message);
    setSeverity(severity);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
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
    </AlertContext.Provider>
  );
};

export const useAlertContext = (): IAlertContext => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error(
      'useAlertContext must be used within a AlertContextProvider'
    );
  }
  return context;
};
