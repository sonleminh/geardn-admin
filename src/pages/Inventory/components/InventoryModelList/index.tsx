import { ChangeEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { AddCircleOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import moment from 'moment';

import { useNotificationContext } from '@/contexts/NotificationContext';

import { useQueryClient } from '@tanstack/react-query';

import { useGetProductById } from '@/services/product';
import { useDeleteModel } from '@/services/model';

import useConfirmModal from '@/hooks/useModalConfirm';

import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import Input from '@/components/Input';

import { QueryKeys } from '@/constants/query-key';

import { truncateTextByLine } from '@/utils/css-helper.util';
import { formatPrice } from '@/utils/format-price';

const InventoryModelList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: deleteModelMutate } = useDeleteModel();

  const [modelEdit, setModelEdit] = useState<string>('');
  const [modelEditForm, setModelEditForm] = useState<{
    price: number;
    stock: number;
  }>({ price: 0, stock: 0 });

  const { showNotification } = useNotificationContext();
  const { data: productData } = useGetProductById(id as string);

  const { confirmModal, showConfirmModal } = useConfirmModal();

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setModelEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteModel = (id: string) => {
    showNotification('Ok', 'success');
    deleteModelMutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.Product],
        });
        showNotification('Xóa loại hàng thành công', 'success');
      },
    });
  };
  return (
    <Card sx={{ borderRadius: 2 }}>
      <Card>
        <CardHeader
          title={
            <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
              Kho hàng sản phẩm
              {`: ${productData?.name}`}
            </Typography>
          }
          action={
            <Box>
              <ButtonWithTooltip
                variant='outlined'
                onClick={() => navigate(-1)}
                title='Quay lại'>
                <KeyboardBackspaceIcon />
              </ButtonWithTooltip>
              <ButtonWithTooltip
                variant='contained'
                onClick={() => navigate(`/inventory/model/create/${id}`)}
                title='Thêm mã hàng'
                sx={{ ml: 1 }}>
                <AddCircleOutlined />
              </ButtonWithTooltip>
            </Box>
          }
        />
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align='center'>STT</TableCell>
                <TableCell>Tên loại hàng</TableCell>
                <TableCell align='center'>Giá</TableCell>
                <TableCell align='center'>Số lượng</TableCell>
                {/* <TableCell align='center'>Trạng thái</TableCell> */}
                <TableCell align='center'>Ngày tạo</TableCell>
                <TableCell align='center'>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productData?.models?.length ? (
                productData?.models?.map((item, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      bgcolor: modelEdit === item?._id ? '#F1F1F1' : 'white',
                      ':hover': { bgcolor: '#F1F1F1', cursor: 'pointer' },
                    }}>
                    <TableCell align='center'>{index + 1}</TableCell>
                    <TableCell>
                      <Typography sx={{ ...truncateTextByLine(2) }}>
                        {item?.name ? item?.name : 'Không có'}
                      </Typography>
                    </TableCell>
                    <TableCell align='center' sx={{ width: '20%', py: 0 }}>
                      {modelEdit && modelEdit === item?._id ? (
                        <FormControl
                          sx={{
                            '.MuiInputBase-root': {
                              minHeight: 36,
                              height: 36,
                            },
                            '& input[type=number]::-webkit-outer-spin-button': {
                              WebkitAppearance: 'none',
                              margin: 0,
                            },
                            '& input[type=number]::-webkit-inner-spin-button': {
                              WebkitAppearance: 'none',
                              margin: 0,
                            },
                          }}>
                          <Input
                            variant='outlined'
                            type='number'
                            size='small'
                            name='price'
                            aria-required
                            value={modelEditForm?.price ?? 0}
                            onChange={handleChangeValue}
                            sx={{
                              width: 112,
                              minHeight: 36,
                              height: 36,
                              bgcolor: '#fff',
                            }}
                          />
                        </FormControl>
                      ) : (
                        formatPrice(item.price)
                      )}
                    </TableCell>
                    <TableCell align='center' sx={{ width: '10%', py: 0 }}>
                      {modelEdit && modelEdit === item?._id ? (
                        <FormControl
                          sx={{
                            '.MuiInputBase-root': {
                              minHeight: 36,
                              height: 36,
                            },
                            '& input[type=number]::-webkit-outer-spin-button': {
                              WebkitAppearance: 'none',
                              margin: 0,
                            },
                            '& input[type=number]::-webkit-inner-spin-button': {
                              WebkitAppearance: 'none',
                              margin: 0,
                            },
                          }}>
                          <Input
                            variant='outlined'
                            type='number'
                            size='small'
                            name='stock'
                            required
                            value={modelEditForm?.stock ?? 0}
                            onChange={handleChangeValue}
                            sx={{
                              width: 80,
                              minHeight: 36,
                              height: 36,
                              bgcolor: '#fff',
                            }}
                          />
                        </FormControl>
                      ) : (
                        item?.stock
                      )}
                    </TableCell>
                    <TableCell align='center'>
                      {moment(item.createdAt).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell align='center'>
                      {modelEdit !== item?._id ? (
                        <Box>
                          <ButtonWithTooltip
                            title='Cập nhật'
                            size='small'
                            variant='outlined'
                            onClick={() => {
                              navigate(`/inventory/model/update/${item?._id}`);
                            }}>
                            <EditOutlinedIcon />
                          </ButtonWithTooltip>
                          <Box display={'inline-block'} mx={1} />
                          <ButtonWithTooltip
                            color='error'
                            onClick={() => {
                              showConfirmModal({
                                title: 'Bạn có muốn xóa loại này không?',
                                cancelText: 'Hủy',
                                onOk: () => handleDeleteModel(item?._id),
                                okText: 'Xóa',
                              });
                            }}
                            variant='outlined'
                            title='Xoá'
                            placement='left'>
                            <DeleteOutlineOutlinedIcon />
                          </ButtonWithTooltip>
                        </Box>
                      ) : (
                        <Box>
                          <Button
                            size='small'
                            variant='contained'
                            // onClick={handleSave}
                          >
                            <SaveOutlinedIcon />
                          </Button>
                          <Box display={'inline-block'} mx={1} />
                          <Button
                            size='small'
                            variant='outlined'
                            onClick={() => setModelEdit('')}>
                            <CloseOutlinedIcon />
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow
                  sx={{
                    height: '80px',
                    '& td': { border: 0 },
                  }}>
                  <TableCell
                    colSpan={6}
                    align='center'
                    sx={{
                      textAlign: 'center',
                      fontSize: 18,
                      color: '#999',
                    }}>
                    Empty
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
      </Card>
      {confirmModal()}
    </Card>
  );
};

export default InventoryModelList;
