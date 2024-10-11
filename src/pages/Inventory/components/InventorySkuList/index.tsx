import { ChangeEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { QueryKeys } from '@/constants/query-key';
import { useQueryClient } from '@tanstack/react-query';

import { AddCircleOutlined } from '@mui/icons-material';

import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import Input from '@/components/Input';
import { SKU_STATUS } from '@/constants/sku-status';
import { useNotificationContext } from '@/contexts/NotificationContext';
import useConfirmModal from '@/hooks/useModalConfirm';
import { IQuery } from '@/interfaces/IQuery';
import { useDeleteCategory } from '@/services/category';
import {
  useGetSkuByByProductId,
  useUpdateProductSku,
} from '@/services/product-sku';
import { truncateTextByLine } from '@/utils/css-helper.util';
import { formatPrice } from '@/utils/format-price';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
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

const InventorySkuList = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [query, setQuery] = useState<IQuery>({
    limit: 10,
    page: 1,
  });
  const [skuEdit, setSkuEdit] = useState<string>('');
  const [skuEditForm, setSkuEditForm] = useState<{
    price: number;
    quantity: number;
  }>({ price: 0, quantity: 0 });
  const { data: skuList } = useGetSkuByByProductId(id ?? '');

  const { showNotification } = useNotificationContext();

  const { confirmModal, showConfirmModal } = useConfirmModal();

  // const { mutate: updateSkuMutate, isPending: isUpdatePending } =
  //   useUpdateProductSku();
  const { mutate: deleteProductMutate } = useDeleteCategory();

  const handleDeleteProduct = (id: string) => {
    showNotification('Ok', 'error');
    deleteProductMutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Category] });
        showNotification('Xóa mã hàng thành công', 'success');
        // handleClosePopover();
      },
    });
  };

  const handleChangeQuery = (object: Partial<IQuery>) => {
    setQuery((prev) => ({ ...prev, ...object }));
  };

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSkuEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // const handleSave = () => {
  //   updateSkuMutate(
  //     {
  //       _id: skuEdit,
  //       price: skuEditForm?.price,
  //       quantity: +skuEditForm?.quantity,
  //     },
  //     {
  //       onSuccess() {
  //         queryClient.invalidateQueries({ queryKey: [QueryKeys.ProductSku] });
  //         setSkuEdit('');
  //         showNotification('Cập nhật thành công', 'success');
  //       },
  //     }
  //   );
  // };
  return (
    <Card sx={{ borderRadius: 2 }}>
      <Card>
        <CardHeader
          title={
            <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
              Kho hàng sản phẩm{skuList && ': ' + skuList[0]?.product_name}
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
                onClick={() => navigate('/inventory/sku/create')}
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
                <TableCell>Mã loại</TableCell>
                <TableCell align='center'>Giá</TableCell>
                <TableCell align='center'>Số lượng</TableCell>
                <TableCell align='center'>Trạng thái</TableCell>
                <TableCell align='center'>Ngày tạo</TableCell>
                <TableCell align='center'>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {skuList?.map((item, index) => (
                <TableRow
                  key={index}
                  sx={{
                    bgcolor: skuEdit === item?._id ? '#F1F1F1' : 'white',
                    ':hover': { bgcolor: '#F1F1F1', cursor: 'pointer' },
                  }}>
                  <TableCell align='center'>{index + 1}</TableCell>
                  <TableCell>
                    <Typography sx={{ ...truncateTextByLine(2) }}>
                      {item.sku}
                    </Typography>
                  </TableCell>
                  <TableCell align='center' sx={{ width: '20%', py: 0 }}>
                    {skuEdit && skuEdit === item?._id ? (
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
                          required
                          // helperText={
                          //   <Box component={'span'} sx={helperTextStyle}>
                          //     {formik.errors.name}
                          //   </Box>
                          // }
                          value={skuEditForm?.price ?? 0}
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
                    {skuEdit && skuEdit === item?._id ? (
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
                          name='quantity'
                          required
                          // helperText={
                          //   <Box component={'span'} sx={helperTextStyle}>
                          //     {formik.errors.name}
                          //   </Box>
                          // }
                          value={skuEditForm?.quantity ?? 0}
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
                      item?.quantity
                    )}
                  </TableCell>
                  <TableCell align='center'>
                    {SKU_STATUS[item?.status] ?? ''}
                  </TableCell>
                  <TableCell align='center'>
                    {moment(item.createdAt).format('DD/MM/YYYY')}
                  </TableCell>
                  <TableCell align='center'>
                    {skuEdit !== item?._id ? (
                      <Box>
                        <ButtonWithTooltip
                          title='Cập nhật'
                          size='small'
                          variant='outlined'
                          onClick={() => {
                            navigate(`/inventory/sku/update/${item?._id}`);
                          }}>
                          <EditOutlinedIcon />
                        </ButtonWithTooltip>
                        <Box display={'inline-block'} mx={1} />
                        <ButtonWithTooltip
                          color='error'
                          onClick={() => {
                            showConfirmModal({
                              title: 'Bạn có muốn xóa danh mục này không?',
                              cancelText: 'Hủy',
                              onOk: () => handleDeleteProduct(item?._id),
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
                          onClick={() => setSkuEdit('')}>
                          <CloseOutlinedIcon />
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {skuList?.length === 0 && (
            <Box sx={{ my: 2, textAlign: 'center', color: '#696969' }}>
              Empty
            </Box>
          )}
        </TableContainer>
        <Divider />
        {/* <Box
          p={2}
          sx={{
            ['.MuiPagination-ul']: {
              justifyContent: 'center',
            },
            textAlign: 'right',
          }}>
          <Typography>Tổng cộng: {data?.total ?? 0}</Typography>
          <Pagination
            count={Math.ceil((data?.total ?? 0) / query.limit!)}
            page={query.page ?? 0}
            onChange={(_: React.ChangeEvent<unknown>, newPage) => {
              handleChangeQuery({ page: newPage });
            }}
            defaultPage={query.page ?? 0}
            showFirstButton
            showLastButton
          />
        </Box> */}
      </Card>
      {confirmModal()}
    </Card>
  );
};

export default InventorySkuList;
