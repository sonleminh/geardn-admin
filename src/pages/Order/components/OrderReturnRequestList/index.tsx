// React and React Router
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
  InputAdornment,
  Link,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchIcon from '@mui/icons-material/Search';

import { addDays } from 'date-fns';
import moment from 'moment';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';

import { TableSkeleton } from '@/components/TableSkeleton';

import { useGetEnumByContext } from '@/services/enum';

import { ROUTES } from '@/constants/route';
import { ColumnAlign, TableColumn } from '@/interfaces/ITableColumn';

import { OrderItem } from '../OrderList/components/OrderItem';
import { formatPrice } from '@/utils/format-price';
import ActionButton from '@/components/ActionButton';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import { IOrderReturnRequest } from '@/interfaces/IOrderReturnRequest';
import { useNotificationContext } from '@/contexts/NotificationContext';
import StatusUpdatePopover from './components/StatusUpdatePopover';
import { getAvailableStatuses } from './utils/orderStatusUtils';
import {
  useGetOrderReturnRequestList,
  useUpdateOrderReturnRequestStatus,
} from '@/services/order-return-request';
import { useGetProductList } from '@/services/product';
import TableFilter from '@/components/TableFilter';
import { IProduct } from '@/interfaces/IProduct';
import { IEnum } from '@/interfaces/IEnum';

interface Data {
  stt: number;
  type: string;
  info: string;
  items: string;
  status: string;
  totalPrice: string;
  reasonCode: string;
  createdAt: Date;
  action: string;
}

interface HeadCell {
  align?: ColumnAlign;
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  isFilter?: boolean;
  width?: string;
}
interface ColumnFilters {
  type: string[];
  items: string[];
  status: string[];
  date: { fromDate: string; toDate: string };
}

// Constants
const INITIAL_COLUMN_FILTERS: ColumnFilters = {
  type: [],
  items: [],
  status: [],
  date: { fromDate: '', toDate: '' },
};

const INITIAL_DATE_STATE = [
  {
    startDate: new Date(),
    endDate: addDays(new Date(), 7),
    key: 'selection',
  },
];

const headCells: readonly HeadCell[] = [
  {
    align: 'center',
    id: 'stt',
    disablePadding: false,
    label: 'STT',
    isFilter: false,
    width: '3%',
  },
  {
    align: 'center',
    id: 'type',
    disablePadding: false,
    label: 'Loại',
    isFilter: true,
    width: '10%',
  },
  {
    id: 'info',
    disablePadding: false,
    label: 'Thông tin',
    width: '13%',
  },
  {
    align: 'center',
    id: 'items',
    disablePadding: false,
    label: 'Sản phẩm',
    isFilter: true,
    width: '25%',
  },
  {
    align: 'center',
    id: 'totalPrice',
    disablePadding: false,
    label: 'Tổng tiền',
    width: '10%',
  },
  {
    align: 'center',
    id: 'status',
    disablePadding: false,
    label: 'Trạng thái',
    isFilter: true,
    width: '8%',
  },
  {
    align: 'center',
    id: 'reasonCode',
    disablePadding: false,
    label: 'Lý do',
    width: '11%',
  },
  {
    align: 'center',
    id: 'createdAt',
    disablePadding: false,
    label: 'Ngày tạo',
    width: '10%',
  },
  {
    align: 'center',
    id: 'action',
    disablePadding: false,
    label: 'Hành động',
    width: '10%',
  },
];

const columns: TableColumn[] = [
  { width: '60px', align: 'center', type: 'text' },
  { width: '100px', type: 'text' },
  { width: '120px', align: 'center', type: 'text' },
  { width: '300px', align: 'center', type: 'complex' },
  { width: '100px', align: 'center', type: 'text' },
  { width: '100px', align: 'center', type: 'text' },
  { width: '120px', align: 'center', type: 'text' },
  { width: '100px', align: 'center', type: 'text' },
  { width: '100px', align: 'center', type: 'text' },
];

// Custom hooks
const useFilterState = () => {
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [activeFilterColumn, setActiveFilterColumn] = useState<string>('');
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>(
    INITIAL_COLUMN_FILTERS
  );
  const [dateState, setDateState] = useState(INITIAL_DATE_STATE);
  const [dateFilterAnchorEl, setDateFilterAnchorEl] =
    useState<null | HTMLElement>(null);

  const handleFilterClick = useCallback(
    (event: React.MouseEvent<HTMLElement>, column: string) => {
      setFilterAnchorEl(event.currentTarget);
      setActiveFilterColumn(column);
    },
    []
  );

  const handleFilterClose = useCallback(() => {
    setFilterAnchorEl(null);
  }, []);

  const handleColumnFilterChange = useCallback(
    (column: string, value: string[]) => {
      setColumnFilters((prev) => ({
        ...prev,
        [column]: value,
      }));
    },
    []
  );

  const handleDateRangeChange = useCallback((rangesByKey: RangeKeyDict) => {
    const selection = rangesByKey.selection;
    if (!selection?.startDate || !selection?.endDate) return;

    setDateState([
      {
        startDate: selection.startDate,
        endDate: selection.endDate,
        key: 'selection',
      },
    ]);

    const fromDate = new Date(
      Date.UTC(
        selection.startDate.getFullYear(),
        selection.startDate.getMonth(),
        selection.startDate.getDate(),
        0,
        0,
        0,
        0
      )
    );

    const toDate = new Date(
      Date.UTC(
        selection.endDate.getFullYear(),
        selection.endDate.getMonth(),
        selection.endDate.getDate(),
        23,
        59,
        59,
        999
      )
    );

    setColumnFilters((prev) => ({
      ...prev,
      date: {
        fromDate: fromDate.toISOString().split('T')[0],
        toDate: toDate.toISOString().split('T')[0],
      },
    }));
  }, []);

  const handleDateFilterClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setDateFilterAnchorEl(event.currentTarget);
    },
    []
  );

  const handleDateFilterClose = useCallback(() => {
    setDateFilterAnchorEl(null);
  }, []);

  return {
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
  };
};

const usePagination = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    []
  );

  return {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
  };
};

// Main component
const OrderReturnRequestList = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotificationContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [selectedRequest, setSelectedRequest] =
    useState<IOrderReturnRequest | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  const {
    filterAnchorEl,
    activeFilterColumn,
    columnFilters,
    dateState,
    dateFilterAnchorEl,
    handleFilterClick,
    handleFilterClose,
    handleDateRangeChange,
    handleDateFilterClick,
    handleDateFilterClose,
    handleColumnFilterChange,
  } = useFilterState();

  const { data: productsData } = useGetProductList();
  const { data: orderReturnTypeEnumData } = useGetEnumByContext('return-type');
  const { data: orderReturnStatusEnumData } =
    useGetEnumByContext('return-status');
  const { data: orderReasonCodeEnumData } =
    useGetEnumByContext('order-reason-code');

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } =
    usePagination();

  const {
    data: orderReturnRequestsData,
    refetch: refetchOrderReturnRequests,
    isLoading: isLoadingOrderReturnRequests,
  } = useGetOrderReturnRequestList({
    types: columnFilters.type,
    productIds: columnFilters.items,
    statuses: columnFilters.status,
    fromDate: columnFilters.date.fromDate,
    toDate: columnFilters.date.toDate,
    search: searchQuery,
    page: page + 1,
    limit: rowsPerPage,
  });

  const {
    mutate: updateOrderReturnRequestStatus,
    isPending: isUpdatingStatus,
  } = useUpdateOrderReturnRequestStatus();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    refetchOrderReturnRequests();
  }, [columnFilters, refetchOrderReturnRequests]);

  const typeMap = useMemo(
    () =>
      Object.fromEntries(
        orderReturnTypeEnumData?.data?.map((item) => [
          item.value,
          item.label,
        ]) ?? []
      ),
    [orderReturnTypeEnumData?.data]
  );

  const statusMap = useMemo(
    () =>
      Object.fromEntries(
        orderReturnStatusEnumData?.data?.map((item) => [
          item.value,
          item.label,
        ]) ?? []
      ),
    [orderReturnStatusEnumData?.data]
  );

  const reasonMap = useMemo(
    () =>
      Object.fromEntries(
        orderReasonCodeEnumData?.data?.map((item) => [
          item.value,
          item.label,
        ]) ?? []
      ),
    [orderReasonCodeEnumData?.data]
  );

  const renderFilterContent = useCallback(() => {
    switch (activeFilterColumn) {
      case 'type':
        return (
          <TableFilter
            title='Lọc theo loại'
            options={
              orderReturnTypeEnumData?.data?.map((type: IEnum) => ({
                id: type.value,
                label: type.label,
              })) ?? []
            }
            selectedValues={columnFilters.type}
            onFilterChange={(newValues) =>
              handleColumnFilterChange('type', newValues)
            }
            onClose={handleFilterClose}
          />
        );
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
              orderReturnStatusEnumData?.data?.map((status: IEnum) => ({
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
    orderReasonCodeEnumData,
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
        <Link
          underline='hover'
          color='inherit'
          onClick={() => navigate(ROUTES.ORDER)}
          sx={{ cursor: 'pointer' }}>
          Đơn hàng
        </Link>
        <Typography color='text.primary'>Danh sách đơn hoàn</Typography>
      </Breadcrumbs>
      <Card>
        <CardHeader
          title={
            <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
              Danh sách yêu cầu hoàn hàng
            </Typography>
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
                        alignItems: 'center',
                      }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'end',
                          width: '100%',
                          mb: 2,
                        }}>
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
                        placeholder='Tìm kiếm yêu cầu hoàn hàng...'
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
                {isLoadingOrderReturnRequests ? (
                  <TableSkeleton rowsPerPage={rowsPerPage} columns={columns} />
                ) : orderReturnRequestsData?.data?.length ? (
                  orderReturnRequestsData?.data?.map(
                    (orderReturnRequest, index) => (
                      <TableRow key={orderReturnRequest?.id || index}>
                        <TableCell align='center'>
                          {page * rowsPerPage + index + 1}
                        </TableCell>
                        <TableCell align='center'>
                          {typeMap?.[orderReturnRequest?.type] ||
                            'Không xác định'}
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                            {orderReturnRequest?.order?.fullName}
                          </Typography>
                          <Typography sx={{ fontSize: 14 }}>
                            {orderReturnRequest?.order?.phoneNumber}
                          </Typography>
                          <Typography
                            sx={{
                              maxWidth: 100,
                              fontSize: 14,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                            {orderReturnRequest?.order?.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            {orderReturnRequest?.order?.orderItems?.map(
                              (orderItem) => (
                                <OrderItem
                                  key={orderItem?.id}
                                  item={orderItem}
                                />
                              )
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align='center'>
                          {formatPrice(orderReturnRequest?.order?.totalPrice)}
                        </TableCell>

                        <TableCell align='center'>
                          {orderReturnRequest?.status === 'APPROVED' &&
                          orderReturnRequest ? (
                            <Link
                              href={`${ROUTES.ORDER}/return-request/confirm/${orderReturnRequest?.id}`}
                              sx={{
                                textDecoration: 'none',
                                color: 'primary.main',
                                button: {
                                  textTransform: 'none',
                                },
                              }}>
                              <Button variant='outlined' color='warning'>
                                Đã duyệt
                              </Button>
                            </Link>
                          ) : (
                            <Tooltip title='Cập nhật trạng thái'>
                              <Button
                                variant='outlined'
                                color={
                                  orderReturnRequest?.status === 'PENDING'
                                    ? 'warning'
                                    : orderReturnRequest?.status === 'APPROVED'
                                    ? 'info'
                                    : orderReturnRequest?.status === 'COMPLETED'
                                    ? 'success'
                                    : orderReturnRequest?.status === 'REJECTED'
                                    ? 'error'
                                    : orderReturnRequest?.status === 'CANCELED'
                                    ? 'error'
                                    : 'error'
                                }
                                onClick={(e) => {
                                  if (
                                    orderReturnRequest?.status !==
                                      'COMPLETED' &&
                                    orderReturnRequest?.status !== 'CANCELED'
                                  ) {
                                    setStatusAnchorEl(e.currentTarget);
                                    setSelectedRequest(orderReturnRequest);
                                    setNewStatus(orderReturnRequest.status);
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
                                {statusMap?.[orderReturnRequest?.status] ||
                                  'Không xác định'}
                              </Button>
                            </Tooltip>
                          )}
                        </TableCell>

                        <TableCell align='center'>
                          {reasonMap?.[orderReturnRequest?.reasonCode] ||
                            'Không xác định'}
                        </TableCell>
                        <TableCell align='center'>
                          {moment(orderReturnRequest?.createdAt).format(
                            'DD/MM/YYYY'
                          )}
                        </TableCell>
                        <TableCell align='center'>
                          <ActionButton>
                            {orderReturnRequest?.status === 'PENDING' && (
                              <Box mb={1}>
                                <ButtonWithTooltip
                                  color='primary'
                                  variant='outlined'
                                  title='Xác nhận'
                                  placement='left'
                                  onClick={() =>
                                    navigate(
                                      `${ROUTES.ORDER}/confirm/${orderReturnRequest?.id}`
                                    )
                                  }>
                                  <DoneOutlinedIcon />
                                </ButtonWithTooltip>
                              </Box>
                            )}
                            <Box>
                              <ButtonWithTooltip
                                color='primary'
                                variant='outlined'
                                title='Chi tiết'
                                placement='left'
                                onClick={() =>
                                  navigate(
                                    `${ROUTES.ORDER}/return-request/${orderReturnRequest?.id}`
                                  )
                                }>
                                <InfoOutlinedIcon />
                              </ButtonWithTooltip>
                            </Box>
                          </ActionButton>
                        </TableCell>
                      </TableRow>
                    )
                  )
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
            count={orderReturnRequestsData?.meta?.total || 0}
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

        <StatusUpdatePopover
          open={Boolean(statusAnchorEl)}
          anchorEl={statusAnchorEl}
          onClose={() => {
            setStatusAnchorEl(null);
            setSelectedRequest(null);
            setNewStatus('');
          }}
          selectedRequest={selectedRequest}
          newStatus={newStatus}
          setNewStatus={setNewStatus}
          isUpdatingStatus={isUpdatingStatus}
          getAvailableStatuses={(status) =>
            getAvailableStatuses(status, orderReturnStatusEnumData)
          }
          returnRequestStatusEnumData={orderReturnStatusEnumData}
          onConfirm={() => {
            if (selectedRequest && newStatus) {
              updateOrderReturnRequestStatus(
                {
                  id: selectedRequest.id,
                  oldStatus: selectedRequest.status,
                  newStatus,
                },
                {
                  onSuccess: () => {
                    showNotification(
                      'Cập nhật trạng thái thành công',
                      'success'
                    );
                    setStatusAnchorEl(null);
                    setSelectedRequest(null);
                    setNewStatus('');
                    refetchOrderReturnRequests();
                  },
                  onError: () => {
                    showNotification('Cập nhật trạng thái thất bại', 'error');
                  },
                }
              );
            }
          }}
        />
      </Card>
    </>
  );
};

export default OrderReturnRequestList;
