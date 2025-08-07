import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Link,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material';

import { AddCircleOutlined } from '@mui/icons-material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';

import moment from 'moment';
import { DateRangePicker } from 'react-date-range';

import ActionButton from '@/components/ActionButton';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import TableFilter from '@/components/TableFilter';
import { TableSkeleton } from '@/components/TableSkeleton';

import { useGetEnumByContext } from '@/services/enum';
import { useGetProductList } from '@/services/product';

import { IEnum } from '@/interfaces/IEnum';

import { formatPrice } from '@/utils/format-price';

import { ROUTES } from '@/constants/route';
import {
  useCancelOrder,
  useGetOrderList,
  useUpdateDeliveryFailed,
  useUpdateOrderStatus,
} from '@/services/order';
import { IOrder } from '@/interfaces/IOrder';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { IProduct } from '@/interfaces/IProduct';
import useConfirmModal from '@/hooks/useModalConfirm';
import { OrderItem } from './components/OrderItem';
import { FilterChips } from './components/FilterChips';
import useOrderListFilter from '@/hooks/useOrderListFilter';
import usePagination from '@/hooks/usePagination';
import { headCells, columns } from './constants';
import { getAvailableStatuses } from './utils/orderStatusUtils';
import StatusUpdatePopover from './components/StatusUpdatePopover';
import OrderActionConfirmModal from './components/OrderActionConfirmModal';
import { TbTruckOff } from 'react-icons/tb';

const OrderList = () => {
  const navigate = useNavigate();
  const { confirmModal, showConfirmModal } = useConfirmModal();

  const [searchQuery, setSearchQuery] = useState('');
  const [updateStatusNote, setUpdateStatusNote] = useState('');
  const [orderReasonCode, setOrderReasonCode] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const {
    filterAnchorEl,
    activeFilterColumn,
    columnFilters,
    dateState,
    dateFilterAnchorEl,
    handleFilterClick,
    handleFilterClose,
    handleColumnFilterChange,
    handleDateRangeChange,
    handleDateFilterClick,
    handleDateFilterClose,
  } = useOrderListFilter();

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } =
    usePagination();

  const { data: productsData } = useGetProductList();
  const { data: orderStatusEnumData } = useGetEnumByContext('order-status');
  const { data: orderReasonCodeEnumData } =
    useGetEnumByContext('order-reason-code');

  const {
    data: ordersData,
    refetch: refetchOrders,
    isLoading: isLoadingOrders,
  } = useGetOrderList({
    productIds: columnFilters.items,
    statuses: columnFilters.status,
    page: page + 1,
    limit: rowsPerPage,
    fromDate: columnFilters.date.fromDate,
    toDate: columnFilters.date.toDate,
    search: searchQuery,
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Modal state for cancel/delivery-failed
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<
    'cancel' | 'delivery-failed' | null
  >(null);
  const [actionOrder, setActionOrder] = useState<IOrder | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionNote, setActionNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const statusMap = useMemo(
    () =>
      Object.fromEntries(
        orderStatusEnumData?.data.map((item) => [item.value, item.label]) ?? []
      ),
    [orderStatusEnumData?.data]
  );

  const { showNotification } = useNotificationContext();

  // State for status update popover
  const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  console.log('selectedOrder', selectedOrder);
  const [newStatus, setNewStatus] = useState<string>('');

  const { mutate: updateOrderStatus, isPending: isUpdatingStatus } =
    useUpdateOrderStatus();
  const { mutate: cancelOrder, isPending: isCancelingOrder } = useCancelOrder();
  const { mutate: updateDeliveryFailed, isPending: isUpdatingDeliveryFailed } =
    useUpdateDeliveryFailed();

  useEffect(() => {
    refetchOrders();
  }, [columnFilters, refetchOrders]);

  // Handler for opening modal
  const openActionModal = (
    type: 'cancel' | 'delivery-failed',
    order: IOrder
  ) => {
    setActionType(type);
    setActionOrder(order);
    setActionReason('');
    setActionNote('');
    setActionModalOpen(true);
  };

  // Handler for confirming action
  const handleActionConfirm = async () => {
    if (!actionOrder || !actionType) return;
    setActionLoading(true);
    if (actionType === 'cancel') {
      // Call cancel mutation (if you have a cancelOrder mutation, use it here)
      // For now, use updateOrderStatus with CANCELED
      cancelOrder(
        {
          id: actionOrder.id,
          oldStatus: actionOrder.status,
          cancelReasonCode: actionReason,
          cancelReason: actionNote?.trim() === '' ? null : actionNote,
        },
        {
          onSuccess: () => {
            showNotification('Đã hủy đơn hàng thành công', 'success');
            setActionModalOpen(false);
            setActionOrder(null);
            setActionType(null);
            setActionLoading(false);
            refetchOrders();
          },
          onError: () => {
            showNotification('Hủy đơn hàng thất bại', 'error');
            setActionLoading(false);
          },
        }
      );
    } else if (actionType === 'delivery-failed') {
      // Use updateOrderStatus with DELIVERY_FAILED
      updateDeliveryFailed(
        {
          id: actionOrder.id,
          oldStatus: actionOrder.status,
          reasonCode: actionReason,
          reasonNote: actionNote?.trim() === '' ? null : actionNote,
        },
        {
          onSuccess: () => {
            showNotification('Đã xác nhận giao thất bại', 'success');
            setActionModalOpen(false);
            setActionOrder(null);
            setActionType(null);
            setActionLoading(false);
            refetchOrders();
          },
          onError: () => {
            showNotification('Xác nhận giao thất bại thất bại', 'error');
            setActionLoading(false);
          },
        }
      );
    }
  };

  const renderFilterContent = useCallback(() => {
    switch (activeFilterColumn) {
      case 'items':
        return (
          <TableFilter
            title='Lọc theo sản phẩm'
            options={
              productsData?.data?.map((product: IProduct) => ({
                id: product.id,
                label: product.name,
              })) ?? []
            }
            selectedValues={columnFilters.items}
            onFilterChange={(newValues) =>
              handleColumnFilterChange('items', newValues)
            }
            onClose={handleFilterClose}
          />
        );
      case 'status':
        return (
          <TableFilter
            title='Lọc theo trạng thái'
            options={
              orderStatusEnumData?.data?.map((status: IEnum) => ({
                id: status.value,
                label: status.label,
              })) ?? []
            }
            selectedValues={columnFilters.status}
            onFilterChange={(newValues) =>
              handleColumnFilterChange('status', newValues)
            }
            onClose={handleFilterClose}
          />
        );

      default:
        return null;
    }
  }, [
    activeFilterColumn,
    productsData,
    orderStatusEnumData,
    columnFilters,
    handleColumnFilterChange,
    handleFilterClose,
  ]);

  return (
    <>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize='small' />}
        aria-label='breadcrumb'
        sx={{ mb: 3 }}>
        <Link
          underline='hover'
          color='inherit'
          onClick={() => navigate(ROUTES.DASHBOARD)}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <HomeOutlinedIcon sx={{ fontSize: 24 }} />
        </Link>
        <Typography color='text.primary'>Danh sách đơn hàng</Typography>
      </Breadcrumbs>
      <Card>
        <CardHeader
          title={
            <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
              Danh sách đơn hàng
            </Typography>
          }
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <ButtonWithTooltip
                variant='outlined'
                title='Danh sách đơn hoàn'
                onClick={() => navigate(`${ROUTES.ORDER}/return-request`)}
                sx={{ textTransform: 'none' }}>
                <Box
                  sx={{
                    height: 24,
                    img: {
                      width: 24,
                      height: 24,
                      mr: 1,
                      objectFit: 'contain',
                    },
                  }}>
                  <img
                    src={
                      'https://cdn-icons-png.flaticon.com/512/4989/4989753.png'
                    }
                    alt={''}
                  />
                </Box>
              </ButtonWithTooltip>
              <ButtonWithTooltip
                variant='outlined'
                onClick={() => navigate(`${ROUTES.ORDER}/update-history`)}
                title='Lịch sử cập nhật'
                sx={{ textTransform: 'none' }}>
                <ManageHistoryIcon />
              </ButtonWithTooltip>
              <ButtonWithTooltip
                variant='contained'
                onClick={() => navigate(`${ROUTES.ORDER}/create`)}
                title='Tạo đơn hàng'
                sx={{ textTransform: 'none' }}>
                <AddCircleOutlined />
              </ButtonWithTooltip>
            </Box>
          }
        />
        <Divider />
        <CardContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={headCells.length} sx={{ px: 0 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 2,
                      }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                        }}>
                        <FilterChips
                          columnFilters={columnFilters}
                          productsData={productsData || { data: [] }}
                          orderStatusEnumData={
                            orderStatusEnumData || { data: [] }
                          }
                          onFilterChange={handleColumnFilterChange}
                        />
                        <Button
                          variant='outlined'
                          size='small'
                          onClick={handleDateFilterClick}
                          startIcon={<DateRangeOutlinedIcon />}
                          sx={{
                            textTransform: 'none',
                            borderColor: columnFilters.date.fromDate
                              ? 'primary.main'
                              : 'inherit',
                            color: columnFilters.date.fromDate
                              ? 'primary.main'
                              : 'inherit',
                            '&:hover': {
                              borderColor: 'primary.main',
                            },
                          }}>
                          {columnFilters.date.fromDate
                            ? `${moment(columnFilters.date.fromDate).format(
                                'DD/MM/YYYY'
                              )} - ${moment(columnFilters.date.toDate).format(
                                'DD/MM/YYYY'
                              )}`
                            : 'Chọn ngày'}
                        </Button>
                      </Box>
                    </Box>
                    <Box>
                      <TextField
                        fullWidth
                        size='small'
                        placeholder='Tìm kiếm sản phẩm...'
                        value={searchQuery}
                        onChange={handleSearchChange}
                        sx={{
                          '& .MuiInputBase-root': {
                            minHeight: 40,
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
                <TableRow>
                  {headCells?.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      align={headCell.align ?? 'left'}
                      padding={headCell.disablePadding ? 'none' : 'normal'}
                      sx={{ width: headCell.width }}>
                      {headCell.label}
                      {headCell.isFilter ? (
                        <>
                          {' '}
                          {(() => {
                            const filterValue =
                              columnFilters[
                                headCell.id as keyof typeof columnFilters
                              ];
                            if (
                              Array.isArray(filterValue) &&
                              filterValue.length > 0
                            ) {
                              return (
                                <Typography
                                  component='span'
                                  sx={{ fontSize: 14 }}>
                                  ({filterValue.length})
                                </Typography>
                              );
                            }
                            return null;
                          })()}
                          <IconButton
                            size='small'
                            onClick={(e) => handleFilterClick(e, headCell.id)}
                            sx={{ ml: 1 }}>
                            <FilterAltOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </>
                      ) : null}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingOrders ? (
                  <TableSkeleton rowsPerPage={rowsPerPage} columns={columns} />
                ) : ordersData?.data?.length ? (
                  ordersData?.data?.map((order, index) => (
                    <TableRow key={order.id || index}>
                      <TableCell align='center'>
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                          {order?.fullName}
                        </Typography>
                        <Typography sx={{ fontSize: 14 }}>
                          {order?.phoneNumber}
                        </Typography>
                        <Typography
                          sx={{
                            maxWidth: 100,
                            fontSize: 14,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                          {order?.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          {order?.orderItems?.map((orderItem) => (
                            <OrderItem key={orderItem?.id} item={orderItem} />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align='center'>
                        {formatPrice(order?.totalPrice)}
                      </TableCell>
                      <TableCell align='center'>
                        {order?.status === 'PENDING' ? (
                          <Link
                            href={`${ROUTES.ORDER}/confirm/${order?.id}`}
                            sx={{
                              textDecoration: 'none',
                              color: 'primary.main',
                              button: {
                                textTransform: 'none',
                              },
                            }}>
                            <Button variant='outlined' color='warning'>
                              Chờ xác nhận
                            </Button>
                          </Link>
                        ) : (
                          <Tooltip title='Cập nhật trạng thái'>
                            <Button
                              variant='outlined'
                              color={
                                order?.status === 'PROCESSING'
                                  ? 'info'
                                  : order?.status === 'SHIPPED'
                                  ? 'success'
                                  : order?.status === 'DELIVERED'
                                  ? 'success'
                                  : order?.status === 'CANCELED'
                                  ? 'error'
                                  : 'error'
                              }
                              onClick={(e) => {
                                if (
                                  order?.status !== 'CANCELED' &&
                                  order?.status !== 'DELIVERY_FAILED'
                                ) {
                                  setStatusAnchorEl(e.currentTarget);
                                  setSelectedOrder(order);
                                  setNewStatus(order.status);
                                }
                              }}
                              sx={{
                                width: 120,
                                fontSize: 13,
                                textTransform: 'none',
                                cursor: 'pointer',
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                },
                                gap: 1,
                              }}>
                              {statusMap?.[order?.status] || 'Không xác định'}
                            </Button>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell align='center'>
                        {moment(order?.createdAt).format('DD/MM/YYYY')}
                      </TableCell>
                      <TableCell align='center'>
                        <ActionButton>
                          {order?.status === 'PENDING' && (
                            <Box mb={1}>
                              <ButtonWithTooltip
                                color='primary'
                                variant='outlined'
                                title='Xác nhận'
                                placement='left'
                                onClick={() =>
                                  navigate(
                                    `${ROUTES.ORDER}/confirm/${order?.id}`
                                  )
                                }>
                                <DoneOutlinedIcon />
                              </ButtonWithTooltip>
                            </Box>
                          )}
                          <Box mb={1}>
                            <ButtonWithTooltip
                              color='primary'
                              variant='outlined'
                              title='Chỉnh sửa'
                              placement='left'
                              onClick={() =>
                                navigate(`${ROUTES.ORDER}/update/${order?.id}`)
                              }>
                              <EditOutlinedIcon />
                            </ButtonWithTooltip>
                          </Box>
                          {order?.status !== 'PENDING' &&
                            order?.status !== 'CANCELED' &&
                            order?.status !== 'DELIVERY_FAILED' && (
                              <Box sx={{ mb: 1 }}>
                                <ButtonWithTooltip
                                  color='error'
                                  variant='outlined'
                                  title='Giao thất bại'
                                  placement='left'
                                  onClick={() =>
                                    openActionModal('delivery-failed', order)
                                  }
                                  sx={{
                                    height: 36,
                                    pt: 0,
                                  }}>
                                  <Box
                                    sx={{
                                      width: 24,
                                      height: 24,
                                      fontSize: 24,
                                    }}>
                                    <TbTruckOff />
                                  </Box>
                                </ButtonWithTooltip>
                              </Box>
                            )}
                          {order?.status !== 'CANCELED' && (
                            <Box>
                              <ButtonWithTooltip
                                color='error'
                                variant='outlined'
                                title='Hủy đơn hàng'
                                placement='left'
                                onClick={() =>
                                  openActionModal('cancel', order)
                                }>
                                <CancelOutlinedIcon />
                              </ButtonWithTooltip>
                            </Box>
                          )}
                        </ActionButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell align='center' colSpan={7}>
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component='div'
            count={ordersData?.meta?.total || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 30, 50]}
            labelRowsPerPage='Số hàng mỗi trang'
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
            }
          />
        </CardContent>

        <Popover
          open={Boolean(filterAnchorEl)}
          anchorEl={filterAnchorEl}
          onClose={handleFilterClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}>
          {renderFilterContent()}
        </Popover>

        <Popover
          open={Boolean(dateFilterAnchorEl)}
          anchorEl={dateFilterAnchorEl}
          onClose={handleDateFilterClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              p: 2,
              mt: 1,
            },
          }}>
          <DateRangePicker
            onChange={handleDateRangeChange}
            moveRangeOnFirstSelection={false}
            months={2}
            ranges={dateState}
            direction='horizontal'
          />
        </Popover>

        {/* Status update popover */}
        <StatusUpdatePopover
          open={Boolean(statusAnchorEl)}
          anchorEl={statusAnchorEl}
          onClose={() => {
            setStatusAnchorEl(null);
            setSelectedOrder(null);
            setNewStatus('');
          }}
          selectedOrder={selectedOrder}
          newStatus={newStatus}
          setNewStatus={setNewStatus}
          updateStatusNote={updateStatusNote}
          setUpdateStatusNote={setUpdateStatusNote}
          isUpdatingStatus={isUpdatingStatus}
          getAvailableStatuses={(status) =>
            getAvailableStatuses(status, orderStatusEnumData)
          }
          orderStatusEnumData={orderStatusEnumData}
          onConfirm={() => {
            if (selectedOrder && newStatus) {
              updateOrderStatus(
                {
                  id: selectedOrder.id,
                  oldStatus: selectedOrder.status,
                  newStatus,
                  note:
                    updateStatusNote?.trim() === '' ? null : updateStatusNote,
                },
                {
                  onSuccess: () => {
                    showNotification(
                      'Cập nhật trạng thái thành công',
                      'success'
                    );
                    setStatusAnchorEl(null);
                    setSelectedOrder(null);
                    setNewStatus('');
                    refetchOrders();
                  },
                  onError: () => {
                    showNotification('Cập nhật trạng thái thất bại', 'error');
                  },
                }
              );
            }
          }}
        />
        <OrderActionConfirmModal
          open={actionModalOpen}
          onClose={() => setActionModalOpen(false)}
          onConfirm={handleActionConfirm}
          title={
            actionType === 'cancel'
              ? 'Bạn có muốn hủy đơn hàng này không?'
              : 'Xác nhận giao thất bại?'
          }
          reasonOptions={orderReasonCodeEnumData?.data || []}
          reasonValue={actionReason}
          onReasonChange={setActionReason}
          noteValue={actionNote}
          onNoteChange={setActionNote}
          loading={actionLoading}
          confirmText={actionType === 'cancel' ? 'Hủy' : 'Xác nhận'}
        />
        {confirmModal()}
      </Card>
    </>
  );
};

export default OrderList;
