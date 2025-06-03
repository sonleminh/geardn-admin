import {
  Box,
  CircularProgress,
  MenuItem,
  Select,
  SelectProps,
  Typography,
} from '@mui/material';
import { ReactNode } from 'react';

interface LoadingSelectProps extends Omit<SelectProps, 'children'> {
  loading?: boolean;
  options?: Array<{
    value: string | number;
    label: ReactNode;
  }>;
  emptyText?: string;
  loadingText?: string;
}

const LoadingSelect = ({
  loading = false,
  options = [],
  emptyText = 'Không có dữ liệu',
  loadingText = 'Loading...',
  ...props
}: LoadingSelectProps) => {
  return (
    <Select
      {...props}
      MenuProps={{
        PaperProps: {
          sx: {
            maxHeight: 300,
          },
        },
      }}>
      {loading ? (
        <MenuItem disabled>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              py: 1,
            }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography>{loadingText}</Typography>
          </Box>
        </MenuItem>
      ) : options.length > 0 ? (
        options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>
          <Typography>{emptyText}</Typography>
        </MenuItem>
      )}
    </Select>
  );
};

export default LoadingSelect;
