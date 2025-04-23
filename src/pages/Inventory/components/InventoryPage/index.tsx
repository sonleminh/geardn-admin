import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/constants/query-key';

import { AddCircleOutlined } from '@mui/icons-material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import {
  Box,
  Card,
  CardHeader,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import useConfirmModal from '@/hooks/useModalConfirm';
import { truncateTextByLine } from '@/utils/css-helper.util';
import moment from 'moment';
import { useNotificationContext } from '@/contexts/NotificationContext';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import ActionButton from '@/components/ActionButton';
import {
  useDeleteWarehouse,
  useGetWarehouseById,
  useGetWarehouseList,
} from '@/services/warehouse';
import { IQuery } from '@/interfaces/IQuery';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useGetStocksByWarehouse } from '@/services/stock';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AddBusinessOutlinedIcon from '@mui/icons-material/AddBusinessOutlined';
import { ROUTES } from '@/constants/route';

const Inventory = () => {
  const { id } = useParams();
  const numericId = id ? Number(id) : undefined;

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showNotification } = useNotificationContext();
  const { confirmModal, showConfirmModal } = useConfirmModal();

  const [query, setQuery] = useState<IQuery>({
    limit: 10,
    page: 1,
  });

  const { data: warehousesData } = useGetWarehouseList();
  const [warehouseId, setWarehouseId] = useState<number>();

  const { mutate: deleteWarehouseMutate } = useDeleteWarehouse();
  const { data: stocksData } = useGetStocksByWarehouse(warehouseId);

  console.log('stocksData', stocksData?.data);

  useEffect(() => {
    if (!warehouseId && warehousesData?.data?.length) {
      setWarehouseId(warehousesData.data[0].id);
    }
  }, [warehousesData, warehouseId]);

  const handleDeleteCategory = (id: number) => {
    deleteWarehouseMutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Category] });
        showNotification('Xóa danh mục thành công', 'success');
      },
    });
  };

  const handleChangeQuery = (object: Partial<IQuery>) => {
    setQuery((prev) => ({ ...prev, ...object }));
  };

  const handleWarehouseIdChange = (event: SelectChangeEvent<number>) => {
    setWarehouseId(+event.target.value);
  };

  console.log('warehouseId', warehouseId);

  return (
    <Card sx={{ borderRadius: 2 }}>
      <Card>
        <CardHeader
          action={
            <ButtonWithTooltip
              variant='contained'
              onClick={() => navigate(`${ROUTES.WAREHOUSE}/import`)}
              title='Thêm kho hàng'>
              <AddBusinessOutlinedIcon />
            </ButtonWithTooltip>
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
                  mr: 2,
                  '& .MuiInputBase-root': {
                    minHeight: 40,
                  },
                }}>
                {/* <InputLabel>Kho hàng</InputLabel> */}
                <Select
                  onChange={handleWarehouseIdChange}
                  value={warehouseId ?? ''}>
                  {warehousesData?.data?.map((item) => (
                    <MenuItem key={item.id} value={item?.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
                {/* {categoryValue && (
                  <ClearIcon
                    sx={{
                      position: 'absolute',
                      right: 30,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      p: '2px',
                      ':hover': {
                        bgcolor: '#eee',
                        borderRadius: '50%',
                        cursor: 'pointer',
                      },
                    }}
                    onClick={handleDeleteFilter}
                  />
                )} */}
              </FormControl>
            </Box>
          }
        />
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
              {stocksData?.data?.length ? (
                stocksData?.data?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell align='center'>{index + 1}</TableCell>
                    <TableCell sx={{ width: '30%' }}>
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
                            src={item?.productImages?.[0]}
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
                            {item?.productName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align='center'>{item?.totalStock}</TableCell>
                    <TableCell align='center'>
                      <IconButton
                        onClick={() => navigate(`${item?.productId}/stocks`)}>
                        <VisibilityOutlinedIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell align='center'>
                      <ActionButton>
                        <Box mb={1}>
                          <ButtonWithTooltip
                            color='primary'
                            // onClick={() => navigate(`update/${item?.}`)}
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
                                // onOk: () => handleDeleteCategory(item?.id),
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
                    Empty
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
        <Box
          p={2}
          sx={{
            ['.MuiPagination-ul']: {
              justifyContent: 'center',
            },
            textAlign: 'right',
          }}>
          <Typography>Tổng cộng: {stocksData?.meta?.total ?? 0}</Typography>
          <Pagination
            count={Math.ceil((stocksData?.meta?.total ?? 0) / query.limit!)}
            page={query.page ?? 0}
            onChange={(_: React.ChangeEvent<unknown>, newPage) => {
              handleChangeQuery({ page: newPage });
            }}
            defaultPage={query.page ?? 0}
            showFirstButton
            showLastButton
          />
        </Box>
      </Card>
      {confirmModal()}
    </Card>
  );
};

export default Inventory;
