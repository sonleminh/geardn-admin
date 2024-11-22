import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';

import { AddCircleOutlined } from '@mui/icons-material';

import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import { ORDER_STATUS } from '@/constants/order-status';
import { useNotificationContext } from '@/contexts/NotificationContext';
import useConfirmModal from '@/hooks/useModalConfirm';
import { IOrderItem } from '@/interfaces/IOrder';
import { IQuery } from '@/interfaces/IQuery';
import {
  useDeleteOrder,
  useGetOrderList,
  useUpdateOrderStatus,
} from '@/services/order';
import { formatPrice } from '@/utils/format-price';
import {
  Box,
  Card,
  CardHeader,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import moment from 'moment';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ActionButton from '@/components/ActionButton';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { QueryKeys } from '@/constants/query-key';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: string;
}

interface EnhancedTableToolbarProps {
  numSelected: number;
  selected: string[];
}

interface Data {
  stt: number;
  _id: string;
  name: string;
  items: IOrderItem[];
  created_at: string;
  total_amount: number;
  status: string;
}

type Order = 'asc' | 'desc';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string | IOrderItem[] },
  b: { [key in Key]: number | string | IOrderItem[] }
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;

  const createSortHandler =
    (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell align={'center'} padding={'none'} width={'6%'}>
          STT
        </TableCell>
        <TableCell
          align={'center'}
          padding={'none'}
          sortDirection={orderBy === 'name' ? order : false}>
          <TableSortLabel
            active={orderBy === 'name'}
            direction={orderBy === 'name' ? order : 'asc'}
            onClick={createSortHandler('name')}>
            Khách hàng
            {orderBy === 'name' ? (
              <Box component='span' sx={visuallyHidden}>
                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
              </Box>
            ) : null}
          </TableSortLabel>
        </TableCell>
        <TableCell align={'center'} padding={'none'} sx={{ width: '18%' }}>
          Sản phẩm
        </TableCell>
        <TableCell
          align={'center'}
          padding={'none'}
          sortDirection={orderBy === 'created_at' ? order : false}>
          <TableSortLabel
            active={orderBy === 'created_at'}
            direction={orderBy === 'created_at' ? order : 'asc'}
            onClick={createSortHandler('created_at')}>
            Ngày đặt
            {orderBy === 'created_at' ? (
              <Box component='span' sx={visuallyHidden}>
                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
              </Box>
            ) : null}
          </TableSortLabel>
        </TableCell>
        <TableCell
          align={'center'}
          padding={'none'}
          sortDirection={orderBy === 'created_at' ? order : false}>
          <TableSortLabel
            active={orderBy === 'created_at'}
            direction={orderBy === 'created_at' ? order : 'asc'}
            onClick={createSortHandler('created_at')}>
            Tổng tiền
            {orderBy === 'created_at' ? (
              <Box component='span' sx={visuallyHidden}>
                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
              </Box>
            ) : null}
          </TableSortLabel>
        </TableCell>
        <TableCell
          align={'center'}
          padding={'none'}
          sortDirection={orderBy === 'created_at' ? order : false}>
          Trạng thái
        </TableCell>
        <TableCell align={'center'}>Hành động</TableCell>
      </TableRow>
    </TableHead>
  );
}

const OrderList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutate: updateOrderStatusMutate, isPending: isUpdatePending } =
    useUpdateOrderStatus();

  const [query, setQuery] = useState<IQuery>({
    search: '',
    status: '',
    limit: 10,
    page: 0,
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Data>('stt');
  const [tabValue, setTabValue] = useState('');
  const [updateStatusId, setUpdateStatusId] = useState('');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
    setQuery((prev) => ({ ...prev, ...{ status: newValue } }));
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const { data } = useGetOrderList(query);

  const { showNotification } = useNotificationContext();
  const { mutate: deleteOrderMutate } = useDeleteOrder();

  const { confirmModal, showConfirmModal } = useConfirmModal();

  const handleChangeQuery = (object: Partial<IQuery>) => {
    setQuery((prev) => ({ ...prev, ...object }));
  };

  const handleDeleteOrder = (id: string) => {
    showNotification('Ok', 'error');
    deleteOrderMutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Order] });
        showNotification('Xóa danh mục thành công', 'success');
      },
    });
  };

  function CustomTabPanel(props: TabPanelProps) {
    const { value, index, ...other } = props;
    return (
      <div
        role='tabpanel'
        hidden={value !== tabValue}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}>
        {value === tabValue && (
          <Box>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Box>
                <TextField
                  sx={{ width: '100%', my: 2 }}
                  placeholder='Search'
                  size='small'></TextField>
              </Box>
              <Table sx={{ minWidth: 750 }} aria-labelledby='tableTitle'>
                <EnhancedTableHead
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={handleSelectAllClick}
                  onRequestSort={handleRequestSort}
                  rowCount={data?.total || 0}
                />
                <TableBody
                  sx={{
                    position: 'relative',
                    // height: !productByCategory
                    //   ? 80 *
                    //     ((data?.total ?? 0) < (query?.limit ?? 2)
                    //       ? data?.total ?? 10
                    //       : query?.limit ?? 10)
                    //   : '',
                    // + 1 *
                    // ((data?.total ?? 0) < (query?.limit ?? 10)
                    //   ? data?.total ?? 0
                    //   : query?.limit ?? 10),
                  }}>
                  {
                    // isLoading ? (
                    //   <Box
                    //     sx={{
                    //       position: 'absolute',
                    //       top: '50%',
                    //       right: '50%',
                    //       transform: 'translate(50%, -50%)',
                    //     }}>
                    //     <CircularProgress
                    //       size={64}
                    //       disableShrink
                    //       thickness={3}
                    //     />
                    //   </Box>
                    // ) : (
                    visibleRows?.map((row, index) => {
                      const labelId = `enhanced-table-checkbox-${index}`;

                      return (
                        <TableRow
                          hover
                          role='checkbox'
                          tabIndex={-1}
                          key={row.stt}
                          sx={{ cursor: 'pointer' }}>
                          <TableCell
                            component='th'
                            id={labelId}
                            scope='row'
                            padding='none'
                            align='center'
                            sx={{ height: 80 }}>
                            {index +
                              1 +
                              (query?.page ?? 0) * (query?.limit ?? 0)}
                          </TableCell>
                          <TableCell
                            component='th'
                            id={labelId}
                            scope='row'
                            padding='none'
                            align='center'
                            sx={{ width: '16%', height: 80 }}>
                            {row.name}
                          </TableCell>
                          <TableCell
                            padding='none'
                            sx={{
                              width: '16%',
                              height: 80,
                            }}>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                height: 66,
                                overflow: 'auto',
                              }}>
                              {row?.items?.map((item) => (
                                <Box key={item.model_id} sx={{ fontSize: 12 }}>
                                  - {item?.product_name}
                                </Box>
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell
                            padding='none'
                            align='center'
                            sx={{ height: 80 }}>
                            {row?.created_at}
                          </TableCell>
                          <TableCell
                            padding='none'
                            align='center'
                            sx={{ height: 80 }}>
                            {formatPrice(row.total_amount)}
                          </TableCell>
                          <TableCell
                            padding='none'
                            align='center'
                            sx={{ height: 80 }}>
                            <Select
                              sx={{
                                width: '120px',
                                minHeight: '36px',
                                fontSize: 14,
                              }}
                              size='small'
                              onChange={(e) => handleUpdateStatus(e, row._id)}
                              value={row?.status ?? ''}>
                              {Object.entries(ORDER_STATUS)?.map(
                                ([key, label]) => (
                                  <MenuItem
                                    sx={{ fontSize: 12 }}
                                    key={key}
                                    value={key}>
                                    {label}
                                  </MenuItem>
                                )
                              )}
                            </Select>
                          </TableCell>

                          <TableCell
                            align='center'
                            sx={{ width: '10%', height: 80 }}>
                            <Box onClick={(e) => e.stopPropagation()}>
                              <ActionButton>
                                {/* <Box mb={1}>
                                  <ButtonWithTooltip
                                    color='primary'
                                    variant='outlined'
                                    title='Chi tiết'
                                    placement='left'
                                    // onClick={() => handleDetailClick(row)}
                                  >
                                    <InfoOutlinedIcon />
                                  </ButtonWithTooltip>
                                </Box> */}
                                <Box mb={1}>
                                  <ButtonWithTooltip
                                    color='primary'
                                    onClick={() =>
                                      navigate(`update/${row?._id}`)
                                    }
                                    variant='outlined'
                                    title='Chỉnh sửa'
                                    placement='left'>
                                    <EditOutlinedIcon />
                                  </ButtonWithTooltip>
                                </Box>
                                <Box mb={1}>
                                  <ButtonWithTooltip
                                    color='error'
                                    onClick={() => {
                                      showConfirmModal({
                                        title:
                                          'Bạn có muốn xóa đơn hàng này không?',
                                        cancelText: 'Hủy',
                                        onOk: () => handleDeleteOrder(row?._id),
                                        okText: 'Xóa',
                                        btnOkColor: 'error',
                                      });
                                    }}
                                    variant='outlined'
                                    title='Xoá'
                                    placement='left'>
                                    <DeleteOutlineOutlinedIcon />
                                  </ButtonWithTooltip>
                                </Box>
                              </ActionButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                    // )
                  }
                  {/* {emptyRows > 0 && data && (
                      <TableRow
                        style={{
                          height: 80 * emptyRows + 1 * emptyRows,
                        }}>
                        <TableCell colSpan={12} />
                      </TableRow>
                    )} */}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </div>
    );
  }

  const rows = useMemo(
    () =>
      data?.orders?.map((order, index) => ({
        stt: index + 1,
        _id: order._id,
        name: order.customer?.name,
        items: order.items,
        created_at: moment(order?.createdAt)?.format('DD/MM/YYYY'),
        total_amount: order.total_amount,
        status: order.status,
      })) || [],
    [data]
  );

  const visibleRows = useMemo(
    () => rows.sort(getComparator(order, orderBy)),
    [order, orderBy, query.limit, rows]
  );

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    // if (event.target.checked) {
    //   const newSelected = (productByCategory ?? data?.productList)?.map(
    //     (n) => n?._id
    //   );
    //   if (newSelected) {
    //     setSelected(newSelected);
    //   }
    //   return;
    // }
    setSelected([]);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setQuery((prev) => ({ ...prev, ...{ page: newPage } }));
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setQuery((prev) => ({
      ...prev,
      ...{ limit: +event.target.value },
    }));
  };

  const handleUpdateStatus = (e: SelectChangeEvent<string>, id: string) => {
    updateOrderStatusMutate(
      { _id: id, status: e.target.value },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [QueryKeys.Order] });
          showNotification('Cập nhật trạng thái thành công', 'success');
        },
      }
    );
    // queryClient.invalidateQueries({ queryKey: [QueryKeys.Order] });
  };

  return (
    <Card sx={{ borderRadius: 2 }}>
      <Card>
        <CardHeader
          title={
            <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
              Danh sách đơn hàng
            </Typography>
          }
          action={
            <ButtonWithTooltip
              variant='contained'
              onClick={() => navigate('/order/create')}
              title='Thêm mã hàng'
              sx={{ ml: 1 }}>
              <AddCircleOutlined />
            </ButtonWithTooltip>
          }
        />
        <Divider />
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleChange}
              aria-label='basic tabs example'>
              <Tab label='Tất cả' value={''} />\{}
              {Object.entries(ORDER_STATUS)?.map(([key, label]) => (
                <Tab key={key} label={label} value={key} />
              ))}
            </Tabs>
          </Box>
          <CustomTabPanel value={''} index={0} />
          {Object.entries(ORDER_STATUS)?.map(([key, value], index) => (
            <CustomTabPanel key={key} value={key} index={index + 1} />
          ))}
        </Box>
        <Divider />
        <Box
          p={2}
          sx={{
            ['.MuiPagination-ul']: {
              justifyContent: 'center',
            },
            textAlign: 'right',
          }}>
          <TablePagination
            component='div'
            count={data?.total ?? 0}
            page={query?.page ?? 1}
            onPageChange={handleChangePage}
            rowsPerPage={query?.limit ?? 10}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
          {/* <Pagination
            count={Math.ceil((data?.total ?? 0) / query.limit!)}
            page={query.page ?? 1}
            onChange={(_: React.ChangeEvent<unknown>, newPage) => {
              handleChangeQuery({ page: newPage });
            }}
            defaultPage={query.page ?? 1}
            showFirstButton
            showLastButton
          /> */}
        </Box>
      </Card>
      {confirmModal()}
    </Card>
  );
};

export default OrderList;
