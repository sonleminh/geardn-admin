import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  CircularProgress,
} from '@mui/material';
import { IEnum } from '@/interfaces/IEnum';

interface OrderActionConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  reasonOptions: IEnum[];
  reasonValue: string;
  onReasonChange: (value: string) => void;
  noteValue: string;
  onNoteChange: (value: string) => void;
  loading?: boolean;
  confirmText?: string;
}

const OrderActionConfirmModal: React.FC<OrderActionConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  reasonOptions,
  reasonValue,
  onReasonChange,
  noteValue,
  onNoteChange,
  loading = false,
  confirmText = 'Xác nhận',
}) => (
  <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Typography gutterBottom>Lý do</Typography>
      <FormControl fullWidth size='small' sx={{ mb: 2 }}>
        <InputLabel id='reason-label'>Chọn lý do</InputLabel>
        <Select
          labelId='reason-label'
          value={reasonValue}
          label='Chọn lý do'
          onChange={(e) => onReasonChange(e.target.value as string)}
          disabled={loading}>
          {reasonOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography gutterBottom>Ghi chú</Typography>
      <TextField
        value={noteValue}
        onChange={(e) => onNoteChange(e.target.value)}
        fullWidth
        size='small'
        placeholder='Nhập ghi chú'
        multiline
        minRows={3}
        disabled={loading}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={loading}>
        Hủy
      </Button>
      <Button
        onClick={onConfirm}
        variant='contained'
        color='error'
        disabled={loading || !reasonValue}>
        {loading ? <CircularProgress size={20} /> : confirmText}
      </Button>
    </DialogActions>
  </Dialog>
);

export default OrderActionConfirmModal;
