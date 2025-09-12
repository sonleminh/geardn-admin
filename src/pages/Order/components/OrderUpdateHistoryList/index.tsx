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
  Typography,
} from '@mui/material';

import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search';

import { addDays } from 'date-fns';
import moment from 'moment';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';

import { TableSkeleton } from '@/components/TableSkeleton';

import { useGetEnumByContext } from '@/services/enum';

import { ROUTES } from '@/constants/route';
import { ColumnAlign, TableColumn } from '@/interfaces/ITableColumn';
import { useGetOrderUpdateHistoryList } from '@/services/order';

interface Data {
  stt: number;
  order: string;
  user: string;
  oldStatus: string;
  newStatus: string;
  note: string;
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
    width: '18%',
  },
  {
    align: 'center',
    id: 'user',
    disablePadding: false,
    label: 'Người cập nhật',
    width: '15%',
  },
  {
    align: 'center',
    id: 'newStatus',
    disablePadding: false,
    label: 'Trạng thái cũ',
    width: '13%',
  },
  {
    align: 'center',
    id: 'oldStatus',
    disablePadding: false,
    label: 'Trạng thái mới',
    width: '13%',
  },
  {
    align: 'center',
    id: 'note',
    disablePadding: false,
    label: 'Ghi chú',
    width: '20%',
  },
  {
    align: 'center',
    id: 'createdAt',
    disablePadding: false,
    label: 'Ngày cập nhật',
    width: '14%',
  },
];

const columns: TableColumn[] = [
  { width: '60px', align: 'center', type: 'text' },
  { width: '120px', type: 'text' },
  { width: '120px', align: 'center', type: 'text' },
  { width: '120px', align: 'center', type: 'text' },
  { width: '120px', align: 'center', type: 'text' },
  { width: '120px', align: 'center', type: 'text' },
  { width: '100px', align: 'center', type: 'text' },
];

const useFilterState = () => {
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>(
    INITIAL_COLUMN_FILTERS
  );
  const [dateState, setDateState] = useState(INITIAL_DATE_STATE);
  const [dateFilterAnchorEl, setDateFilterAnchorEl] =
    useState<null | HTMLElement>(null);

  const handleFilterClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setFilterAnchorEl(event.currentTarget);
    },
    []
  );

  const handleFilterClose = useCallback(() => {
    setFilterAnchorEl(null);
  }, []);

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
    columnFilters,
    dateState,
    dateFilterAnchorEl,
    handleFilterClick,
    handleFilterClose,
    handleDateRangeChange,
    handleDateFilterClick,
    handleDateFilterClose,
  };
};

const usePagination = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = useCallback((_: unknown, newPage: number) => {
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

const OrderUpdateHistoryList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    filterAnchorEl,
    columnFilters,
    dateState,
    dateFilterAnchorEl,
    handleFilterClick,
    handleFilterClose,
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
                        placeholder='Tìm kiếm đơn hàng...'
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
                          <IconButton size='small' onClick={handleFilterClick}>
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
                              orderUpdateHistory?.oldStatus === 'PENDING'
                                ? 'warning'
                                : orderUpdateHistory?.oldStatus === 'PROCESSING'
                                ? 'info'
                                : orderUpdateHistory?.oldStatus === 'SHIPPED'
                                ? 'success'
                                : orderUpdateHistory?.oldStatus === 'DELIVERED'
                                ? 'success'
                                : orderUpdateHistory?.oldStatus === 'CANCELLED'
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
                          {orderUpdateHistory?.note ?? 'Không có'}
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
