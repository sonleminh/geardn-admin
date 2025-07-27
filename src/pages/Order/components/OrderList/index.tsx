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
  Chip,
  CircularProgress,
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
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import FilterListIcon from '@mui/icons-material/FilterList';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';

import { addDays } from 'date-fns';
import moment from 'moment';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';

import ActionButton from '@/components/ActionButton';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import TableFilter from '@/components/TableFilter';
import { TableSkeleton } from '@/components/TableSkeleton';

import { useGetEnumByContext } from '@/services/enum';
import { useGetImportLogList } from '@/services/inventory';
import { useGetProductList } from '@/services/product';
import { useGetWarehouseList } from '@/services/warehouse';

import { IEnum } from '@/interfaces/IEnum';
import { IImportLogItem } from '@/interfaces/IInventorytLog';

import { truncateTextByLine } from '@/utils/css-helper.util';
import { formatPrice } from '@/utils/format-price';

import { ROUTES } from '@/constants/route';
import { ColumnAlign, TableColumn } from '@/interfaces/ITableColumn';
import { useGetOrderList, useUpdateOrderStatus } from '@/services/order';
import { IOrderItem, IOrder } from '@/interfaces/IOrder';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { IProduct } from '@/interfaces/IProduct';

interface Data {
  stt: number;
  info: string;
  items: IOrderItem[];
  status: string;
  totalPrice: number;
  createdAt: Date;
  note: string;
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
  items: string[];
  status: string[];
  date: { fromDate: string; toDate: string };
}

// Constants
const INITIAL_COLUMN_FILTERS: ColumnFilters = {
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
    width: '2%',
  },
  {
    id: 'info',
    disablePadding: false,
    label: 'Thông tin',
    width: '15%',
  },
  {
    align: 'center',
    id: 'items',
    disablePadding: false,
    label: 'Sản phẩm',
    isFilter: true,
    width: '36%',
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
    width: '15%',
  },
  {
    align: 'center',
    id: 'createdAt',
    disablePadding: false,
    label: 'Ngày tạo',
    width: '12%',
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
  { width: '300px', type: 'complex' },
  { width: '120px', align: 'center', type: 'text' },
  { width: '120px', align: 'center', type: 'text' },
  { width: '120px', align: 'center', type: 'text' },
  { width: '120px', align: 'center', type: 'action' },
];

// Components
interface OrderItemProps {
  item: IOrderItem;
}

const OrderItem = ({ item }: OrderItemProps) => {
  const productName = item?.productName;
  const imageUrl = item?.imageUrl;
  const quantity = item?.quantity;
  const sellingPrice = item?.sellingPrice;
  const attributes = item?.skuAttributes;

  return (
    <Box
      my={1}
      sx={{
        display: 'flex',
        p: 1,
        bgcolor: '#fafafa',
        border: '1px solid #dadada',
        borderRadius: 1,
      }}>
      <Box
        sx={{
          height: 40,
          '.thumbnail': {
            width: 40,
            height: 40,
            mr: 1,
            objectFit: 'contain',
          },
        }}>
        <img src={imageUrl} className='thumbnail' alt={productName} />
      </Box>
      <Box>
        <Typography
          sx={{
            // width: 80,
            fontSize: 14,
            fontWeight: 500,
            ...truncateTextByLine(1),
          }}>
          {productName}
        </Typography>

        <Typography sx={{ fontSize: 13 }}>SL: {quantity}</Typography>
        <Typography sx={{ fontSize: 13 }}>
          Giá: {formatPrice(sellingPrice)}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          ml: 2,
        }}>
        {attributes?.length
          ? attributes.map((attr, index) => (
              <Typography key={index} sx={{ fontSize: 13 }}>
                {attr?.attribute}: {attr?.value}
              </Typography>
            ))
          : null}
      </Box>
    </Box>
  );
};

interface FilterChipsProps {
  columnFilters: ColumnFilters;
  productsData: {
    data?: Array<{
      id: number;
      name: string;
    }>;
  };
  orderStatusEnumData: {
    data?: Array<IEnum>;
  };
  onFilterChange: (
    column: string,
    value: string | string[] | { fromDate: string; toDate: string }
  ) => void;
}

const FilterChips = ({
  columnFilters,
  productsData,
  orderStatusEnumData,
  onFilterChange,
}: FilterChipsProps) => {
  const getFilterLabels = useCallback(
    (filterKey: string, values: string[]) => {
      if (filterKey === 'items') {
        return values.map(
          (value: string) =>
            productsData?.data?.find(
              (p: { id: number; name: string }) => p.id === +value
            )?.name || value
        );
      } else if (filterKey === 'status') {
        return values.map(
          (value: string) =>
            orderStatusEnumData?.data?.find((e: IEnum) => e.value === value)
              ?.label || value
        );
      }
      return [];
    },
    [productsData?.data, orderStatusEnumData?.data]
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <FilterListIcon />
      {Object.entries(columnFilters).map(([filterKey, filterValues]) => {
        if (filterKey === 'date') {
          const dateValues = filterValues as {
            fromDate: string;
            toDate: string;
          };
          if (!dateValues.fromDate || !dateValues.toDate) return null;
          return (
            <Chip
              key='date-filter'
              label={`${moment(dateValues.fromDate).format(
                'DD/MM/YYYY'
              )} - ${moment(dateValues.toDate).format('DD/MM/YYYY')}`}
              onDelete={() => {
                onFilterChange('date', { fromDate: '', toDate: '' });
              }}
              size='small'
            />
          );
        }

        const values = filterValues as string[];
        if (values.length === 0) return null;

        const filterLabels = getFilterLabels(filterKey, values);

        return filterLabels.map((label) => (
          <Chip
            key={`${filterKey}-${label}`}
            label={label}
            onDelete={() => {
              const newValues = values.filter((value: string) => {
                const itemLabel =
                  filterKey === 'items'
                    ? productsData?.data?.find((p) => p.id === +value)?.name
                    : orderStatusEnumData?.data?.find((e) => e.value === value)
                        ?.label;
                return itemLabel !== label;
              });
              onFilterChange(filterKey, newValues);
            }}
            size='small'
            sx={{ maxWidth: 120 }}
          />
        ));
      })}
    </Box>
  );
};

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
    setActiveFilterColumn('');
  }, []);

  const handleColumnFilterChange = useCallback(
    (
      column: string,
      value: string | string[] | { fromDate: string; toDate: string }
    ) => {
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
const OrderList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

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
  } = useFilterState();

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } =
    usePagination();

  const { data: productsData } = useGetProductList();
  const { data: orderStatusEnumData } = useGetEnumByContext('order-status');

  const {
    data: ordersData,
    refetch: refetchOrders,
    isLoading: isLoadingOrders,
  } = useGetOrderList({
    productIds: columnFilters.items,
    statuses: columnFilters.status,
    search: searchQuery,
    page: page + 1,
    limit: rowsPerPage,
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const statusMap = useMemo(
    () =>
      Object.fromEntries(
        orderStatusEnumData?.data?.map((item) => [item.value, item.label]) ?? []
      ),
    [orderStatusEnumData?.data]
  );

  const { showNotification } = useNotificationContext();

  // State for status update popover
  const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  const { mutate: updateOrderStatus, isPending: isUpdatingStatus } =
    useUpdateOrderStatus();

  useEffect(() => {
    refetchOrders();
  }, [columnFilters, refetchOrders]);

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
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                        }}>
                        <FilterChips
                          columnFilters={columnFilters}
                          productsData={productsData || { data: [] }}
                          orderStatusEnumData={
                            orderStatusEnumData || { data: [] }
                          }
                          onFilterChange={handleColumnFilterChange}
                        />
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
                                order?.status === 'PENDING'
                                  ? 'warning'
                                  : order?.status === 'PROCESSING'
                                  ? 'info'
                                  : order?.status === 'SHIPPED'
                                  ? 'success'
                                  : order?.status === 'DELIVERED'
                                  ? 'success'
                                  : order?.status === 'CANCELLED'
                                  ? 'error'
                                  : 'error'
                              }
                              // size='small'
                              onClick={(e) => {
                                setStatusAnchorEl(e.currentTarget);
                                setSelectedOrder(order);
                                setNewStatus(order.status);
                              }}
                              sx={{
                                width: '100%',
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
                          <Box>
                            <ButtonWithTooltip
                              color='error'
                              variant='outlined'
                              title='Xoá'
                              placement='left'>
                              <DeleteOutlineOutlinedIcon />
                            </ButtonWithTooltip>
                          </Box>
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
        <Popover
          open={Boolean(statusAnchorEl)}
          anchorEl={statusAnchorEl}
          onClose={() => {
            setStatusAnchorEl(null);
            setSelectedOrder(null);
            setNewStatus('');
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}>
          <Box sx={{ p: 2, minWidth: 220 }}>
            <Typography sx={{ mb: 1 }}>Cập nhật trạng thái</Typography>
            <Box sx={{ mb: 2 }}>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                style={{ width: '100%', padding: 8, fontSize: 14 }}
                disabled={isUpdatingStatus}>
                {orderStatusEnumData?.data?.map((status: IEnum) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                size='small'
                onClick={() => {
                  setStatusAnchorEl(null);
                  setSelectedOrder(null);
                  setNewStatus('');
                }}
                disabled={isUpdatingStatus}>
                Hủy
              </Button>
              <Button
                size='small'
                variant='contained'
                onClick={() => {
                  if (selectedOrder && newStatus) {
                    updateOrderStatus(
                      {
                        id: selectedOrder.id,
                        oldStatus: selectedOrder.status,
                        newStatus,
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
                          showNotification(
                            'Cập nhật trạng thái thất bại',
                            'error'
                          );
                        },
                      }
                    );
                  }
                }}
                disabled={
                  isUpdatingStatus ||
                  !selectedOrder ||
                  !newStatus ||
                  selectedOrder.status === newStatus
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
      </Card>
    </>
  );
};

export default OrderList;
