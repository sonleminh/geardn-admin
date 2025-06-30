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
  Typography,
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
import SearchIcon from '@mui/icons-material/Search';

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
import { useGetOrderUpdateHistoryList } from '@/services/order';

interface Data {
  stt: number;
  order: string;
  user: string;
  oldStatus: string;
  newStatus: string;
  createdAt: Date;
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
  order: string[];
  date: { fromDate: string; toDate: string };
}

// Constants
const INITIAL_COLUMN_FILTERS: ColumnFilters = {
  order: [],
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
    width: '7%',
  },
  {
    id: 'order',
    disablePadding: false,
    label: 'Đơn hàng',
    width: '15%',
  },
  {
    id: 'user',
    disablePadding: false,
    label: 'Người cập nhật',
    width: '10%',
  },
  {
    align: 'center',
    id: 'oldStatus',
    disablePadding: false,
    label: 'Trạng thái cũ',
    width: '15%',
  },
  {
    align: 'center',
    id: 'newStatus',
    disablePadding: false,
    label: 'Trạng thái mới',
    width: '12%',
  },
  {
    align: 'center',
    id: 'createdAt',
    disablePadding: false,
    label: 'Ngày cập nhật',
    width: '12%',
  },
];

const columns: TableColumn[] = [
  { width: '60px', align: 'center', type: 'text' },
  { width: '120px', type: 'text' },
  { width: '120px', align: 'center', type: 'text' },
  { width: '120px', align: 'center', type: 'text' },
  { width: '120px', align: 'center', type: 'text' },
  { width: '120px', align: 'center', type: 'text' },
];

interface FilterChipsProps {
  columnFilters: ColumnFilters;
  warehousesData: {
    data?: Array<{
      id: number;
      name: string;
    }>;
  };
  productsData: {
    data?: Array<{
      id: number;
      name: string;
    }>;
  };
  enumData: {
    data?: Array<IEnum>;
  };
  onFilterChange: (
    column: string,
    value: string | string[] | { fromDate: string; toDate: string }
  ) => void;
}

const FilterChips = ({
  columnFilters,
  warehousesData,
  productsData,
  enumData,
  onFilterChange,
}: FilterChipsProps) => {
  const getFilterLabels = useCallback(
    (filterKey: string, values: string[]) => {
      if (filterKey === 'warehouse') {
        return values.map(
          (value: string) =>
            warehousesData?.data?.find(
              (w: { id: number; name: string }) => w.id === +value
            )?.name || value
        );
      } else if (filterKey === 'items') {
        return values.map(
          (value: string) =>
            productsData?.data?.find(
              (p: { id: number; name: string }) => p.id === +value
            )?.name || value
        );
      } else if (filterKey === 'type') {
        return values.map(
          (value: string) =>
            enumData?.data?.find((e: IEnum) => e.value === value)?.label ||
            value
        );
      }
      return [];
    },
    [warehousesData?.data, productsData?.data, enumData?.data]
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
                  filterKey === 'warehouse'
                    ? warehousesData?.data?.find((w) => w.id === +value)?.name
                    : filterKey === 'items'
                    ? productsData?.data?.find((p) => p.id === +value)?.name
                    : enumData?.data?.find((e) => e.value === value)?.label;
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
const OrderUpdateHistoryList = () => {
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

  const { data: orderStatusEnumData } = useGetEnumByContext('order-status');

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } =
    usePagination();

  const {
    data: orderUpdateHistoryListData,
    refetch: refetchOrderUpdateHistoryList,
    isLoading: isLoadingOrderUpdateHistoryList,
  } = useGetOrderUpdateHistoryList({
    fromDate: columnFilters.date.fromDate,
    toDate: columnFilters.date.toDate,
    search: searchQuery,
    page: page + 1,
    limit: rowsPerPage,
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    refetchOrderUpdateHistoryList();
  }, [columnFilters, refetchOrderUpdateHistoryList]);

  const statusMap = useMemo(
    () =>
      Object.fromEntries(
        orderStatusEnumData?.data?.map((item) => [item.value, item.label]) ?? []
      ),
    [orderStatusEnumData?.data]
  );

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
        <Typography color='text.primary'>Lịch sử cập nhật</Typography>
      </Breadcrumbs>
      <Card>
        <CardHeader
          title={
            <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
              Lịch sử cập nhật trạng thái đơn hàng
            </Typography>
          }
        />
        <Divider />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={headCells.length}>
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
                {isLoadingOrderUpdateHistoryList ? (
                  <TableSkeleton rowsPerPage={rowsPerPage} columns={columns} />
                ) : orderUpdateHistoryListData?.data?.length ? (
                  orderUpdateHistoryListData?.data?.map(
                    (orderUpdateHistory, index) => (
                      <TableRow key={orderUpdateHistory?.id || index}>
                        <TableCell align='center'>
                          {page * rowsPerPage + index + 1}
                        </TableCell>

                        <TableCell>
                          <Typography component='span' sx={{ fontSize: 14 }}>
                            {orderUpdateHistory?.order?.orderCode}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          {orderUpdateHistory?.user?.name}
                        </TableCell>
                        <TableCell align='center'>
                          <Button
                            variant='outlined'
                            color={
                              orderUpdateHistory?.newStatus === 'PENDING'
                                ? 'warning'
                                : orderUpdateHistory?.newStatus === 'PROCESSING'
                                ? 'info'
                                : orderUpdateHistory?.newStatus === 'SHIPPED'
                                ? 'success'
                                : orderUpdateHistory?.newStatus === 'DELIVERED'
                                ? 'success'
                                : orderUpdateHistory?.newStatus === 'CANCELLED'
                                ? 'error'
                                : 'error'
                            }
                            sx={{
                              width: '120px',
                              fontSize: 13,
                              textTransform: 'none',
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                              },
                              gap: 1,
                            }}>
                            {statusMap?.[orderUpdateHistory?.newStatus] ||
                              'Không xác định'}
                          </Button>
                        </TableCell>
                        <TableCell align='center'>
                          <Button
                            variant='outlined'
                            color={
                              orderUpdateHistory?.newStatus === 'PENDING'
                                ? 'warning'
                                : orderUpdateHistory?.newStatus === 'PROCESSING'
                                ? 'info'
                                : orderUpdateHistory?.newStatus === 'SHIPPED'
                                ? 'success'
                                : orderUpdateHistory?.newStatus === 'DELIVERED'
                                ? 'success'
                                : orderUpdateHistory?.newStatus === 'CANCELLED'
                                ? 'error'
                                : 'error'
                            }
                            sx={{
                              width: '120px',
                              fontSize: 13,
                              textTransform: 'none',
                              cursor: 'pointer',
                            }}>
                            {statusMap?.[orderUpdateHistory?.oldStatus] ||
                              'Không xác định'}
                          </Button>
                        </TableCell>
                        <TableCell align='center'>
                          {moment(orderUpdateHistory?.createdAt).format(
                            'DD/MM/YYYY'
                          )}
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
            count={orderUpdateHistoryListData?.meta?.total || 0}
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
          {/* {renderFilterContent()} */}
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
      </Card>
    </>
  );
};

export default OrderUpdateHistoryList;
