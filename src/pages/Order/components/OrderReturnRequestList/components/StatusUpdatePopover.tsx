import React from 'react';
import {
  Popover,
  Box,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import { IEnum } from '@/interfaces/IEnum';
import { IOrderReturnRequest } from '@/interfaces/IOrderReturnRequest';

interface StatusUpdatePopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  selectedRequest: IOrderReturnRequest | null;
  newStatus: string;
  setNewStatus: (status: string) => void;
  isUpdatingStatus: boolean;
  getAvailableStatuses: (currentStatus: string) => IEnum[];
  returnRequestStatusEnumData?: { data: IEnum[] };
  onConfirm: () => void;
}

const StatusUpdatePopover: React.FC<StatusUpdatePopoverProps> = ({
  open,
  anchorEl,
  onClose,
  selectedRequest,
  newStatus,
  setNewStatus,
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
        {selectedRequest &&
        getAvailableStatuses(selectedRequest.status)?.length > 0 ? (
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            style={{ width: '100%', padding: 8, fontSize: 14 }}
            disabled={isUpdatingStatus}>
            {getAvailableStatuses(selectedRequest.status)?.map(
              (status: IEnum) => {
                return (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                );
              }
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
            !selectedRequest ||
            !newStatus ||
            selectedRequest?.status === newStatus ||
            getAvailableStatuses(selectedRequest.status)?.length === 0
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
