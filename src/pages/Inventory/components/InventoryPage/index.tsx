import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Card,
  CardHeader,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  TextField,
  InputAdornment,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { LuPackageMinus, LuPackagePlus } from 'react-icons/lu';
import { TbHomeEdit } from 'react-icons/tb';

import { ROUTES } from '@/constants/route';

import ActionButton from '@/components/ActionButton';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';

import useConfirmModal from '@/hooks/useModalConfirm';

import { useGetStocksByWarehouse } from '@/services/stock';
import { useGetWarehouseList } from '@/services/warehouse';

import { TableColumn } from '@/interfaces/ITableColumn';
import { truncateTextByLine } from '@/utils/css-helper.util';
import { TableSkeleton } from '@/components/TableSkeleton';

const columns: TableColumn[] = [
  { width: '60px', align: 'center' },
  { width: '300px', type: 'complex' },
  { width: '120px', align: 'center' },
  { width: '120px', align: 'center' },
  { width: '120px', align: 'center', type: 'action' },
];

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

const InventoryPage = () => {
  const navigate = useNavigate();
  const { confirmModal, showConfirmModal } = useConfirmModal();

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } =
    usePagination();

  const { data: warehousesData, isLoading: isLoadingWarehouses } =
    useGetWarehouseList();
  const [warehouseId, setWarehouseId] = useState<number>();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: stocksData, isLoading: isLoadingStocks } =
    useGetStocksByWarehouse(warehouseId, {
      page: page + 1,
      limit: rowsPerPage,
      search: searchQuery,
    });

  useEffect(() => {
    if (!warehouseId && warehousesData?.data?.length) {
      setWarehouseId(warehousesData.data[0].id);
    }
  }, [warehousesData, warehouseId]);

  const handleWarehouseIdChange = (event: SelectChangeEvent<number>) => {
    setWarehouseId(+event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const isLoading = isLoadingWarehouses || isLoadingStocks || !warehouseId;

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
        <Typography color='text.primary'>Kho hàng</Typography>
      </Breadcrumbs>
      <Card sx={{ borderRadius: 2 }}>
        <Card>
          <CardHeader
            action={
              <Box
                sx={{
                  button: {
                    mx: 0.5,
                  },
                  svg: {
                    fontSize: 24,
                  },
                }}>
                <ButtonWithTooltip
                  variant='outlined'
                  onClick={() => navigate(`${ROUTES.INVENTORY}/import`)}
                  title='Nhập hàng'
                  sx={{ textTransform: 'none' }}>
                  <LuPackagePlus />
                  <Typography sx={{ ml: 1 }}>Nhập hàng</Typography>
                </ButtonWithTooltip>
                <ButtonWithTooltip
                  variant='outlined'
                  onClick={() => navigate(`${ROUTES.INVENTORY}/export`)}
                  title='Xuất kho'
                  sx={{ textTransform: 'none' }}>
                  <LuPackageMinus />
                  <Typography sx={{ ml: 1 }}>Xuất kho</Typography>
                </ButtonWithTooltip>
                <ButtonWithTooltip
                  variant='outlined'
                  onClick={() => navigate(`${ROUTES.INVENTORY}/adjustment`)}
                  title='Điều chỉnh'
                  sx={{ textTransform: 'none' }}>
                  <TbHomeEdit />
                  <Typography sx={{ ml: 1 }}>Điều chỉnh</Typography>
                </ButtonWithTooltip>
              </Box>
            }
            title={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ mr: 2, fontSize: 20, fontWeight: 500 }}>
                  Kho hàng:
                </Typography>
                <FormControl
                  size='small'
                  sx={{
                    width: 200,
                    '& .MuiInputBase-root': {
                      minHeight: 40,
                    },
                  }}>
                  <Select
                    onChange={handleWarehouseIdChange}
                    value={warehouseId ?? ''}>
                    {warehousesData?.data?.map((item) => (
                      <MenuItem key={item.id} value={item?.id}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            }
          />
          <Box sx={{ px: 2, pb: 2 }}>
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
          <Divider />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align='center'>STT</TableCell>
                  <TableCell>Sản phẩm</TableCell>
                  <TableCell align='center'>Tổn kho</TableCell>
                  <TableCell align='center'>Xem</TableCell>
                  <TableCell align='center'>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton rowsPerPage={rowsPerPage} columns={columns} />
                ) : stocksData?.data?.length ? (
                  stocksData?.data?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell width={'2%'} align='center'>
                        {index + 1}
                      </TableCell>
                      <TableCell width={'58%'}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              height: 60,
                              '.thumbnail': {
                                width: 60,
                                height: 60,
                                objectFit: 'contain',
                              },
                            }}>
                            <img
                              src={item?.images?.[0]}
                              className='thumbnail'
                            />
                          </Box>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              ml: 2,
                            }}>
                            <Typography sx={{ ...truncateTextByLine(2) }}>
                              {item?.name}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell width={'15%'} align='center'>
                        {item?.totalStock}
                      </TableCell>
                      <TableCell width={'5%'} align='center'>
                        <IconButton
                          onClick={() => navigate(`${item?.id}/stocks`)}>
                          <VisibilityOutlinedIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell width={'20%'} align='center'>
                        <ActionButton>
                          <Box mb={1}>
                            <ButtonWithTooltip
                              color='primary'
                              variant='outlined'
                              title='Chỉnh sửa'
                              placement='left'>
                              <EditOutlinedIcon />
                            </ButtonWithTooltip>
                          </Box>
                          <Box>
                            <ButtonWithTooltip
                              color='error'
                              onClick={() => {
                                showConfirmModal({
                                  title: 'Bạn có muốn xóa danh mục này không?',
                                  cancelText: 'Hủy',
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
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell align='center' colSpan={6}>
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component='div'
            count={stocksData?.meta?.total || 0}
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
        </Card>
        {confirmModal()}
      </Card>
    </>
  );
};

export default InventoryPage;
