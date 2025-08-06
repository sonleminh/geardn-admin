import React from 'react';
import {
  Popover,
  Box,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import { IOrder } from '@/interfaces/IOrder';
import { IEnum } from '@/interfaces/IEnum';

interface StatusUpdatePopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  selectedOrder: IOrder | null;
  newStatus: string;
  setNewStatus: (status: string) => void;
  updateStatusNote: string;
  setUpdateStatusNote: (note: string) => void;
  isUpdatingStatus: boolean;
  getAvailableStatuses: (currentStatus: string) => IEnum[];
  orderStatusEnumData?: { data: IEnum[] };
  onConfirm: () => void;
}

const StatusUpdatePopover: React.FC<StatusUpdatePopoverProps> = ({
  open,
  anchorEl,
  onClose,
  selectedOrder,
  newStatus,
  setNewStatus,
  updateStatusNote,
  setUpdateStatusNote,
  isUpdatingStatus,
  getAvailableStatuses,
  onConfirm,
}) => (
  <Popover
    open={open}
    anchorEl={anchorEl}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    transformOrigin={{ vertical: 'top', horizontal: 'left' }}>
    <Box sx={{ p: 2, minWidth: 220 }}>
      <Typography sx={{ mb: 1 }}>Cập nhật trạng thái</Typography>
      <Box sx={{ mb: 2 }}>
        {selectedOrder &&
        getAvailableStatuses(selectedOrder.status)?.length > 0 ? (
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            style={{ width: '100%', padding: 8, fontSize: 14 }}
            disabled={isUpdatingStatus}>
            {getAvailableStatuses(selectedOrder.status)?.map(
              (status: IEnum) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              )
            )}
          </select>
        ) : (
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: 14,
              fontStyle: 'italic',
            }}>
            Không có trạng thái nào khả dụng để chuyển đổi
          </Typography>
        )}
      </Box>
      <textarea
        placeholder='Ghi chú:'
        name='note'
        rows={4}
        onChange={(e) => setUpdateStatusNote(e.target.value)}
        value={updateStatusNote ?? ''}
        style={{
          width: '100%',
          padding: '8.5px 14px',
          border: '1px solid rgba(0, 0, 0, 0.23)',
          borderRadius: '4px',
          fontSize: 14,
        }}
        onFocus={(e) => (e.target.style.outline = '1px solid #000')}
        onBlur={(e) => (e.target.style.outline = 'none')}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button size='small' onClick={onClose} disabled={isUpdatingStatus}>
          Hủy
        </Button>
        <Button
          size='small'
          variant='contained'
          onClick={onConfirm}
          disabled={
            isUpdatingStatus ||
            !selectedOrder ||
            !newStatus ||
            selectedOrder?.status === newStatus ||
            getAvailableStatuses(selectedOrder.status)?.length === 0
          }>
          {isUpdatingStatus ? (
            <CircularProgress size={20} disableShrink thickness={3} />
          ) : (
            'Xác nhận'
          )}
        </Button>
      </Box>
    </Box>
  </Popover>
);

export default StatusUpdatePopover;
