import { ChangeEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/constants/query-key';

import { AddCircleOutlined, Edit, Delete } from '@mui/icons-material';

import {
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  FormControl,
  Pagination,
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
import { useDeleteCategory, useGetCategoryList } from '@/services/category';
import { IQuery } from '@/interfaces/IQuery';
import EastOutlinedIcon from '@mui/icons-material/EastOutlined';
import {
  useGetSkuByByProductId,
  useUpdateProductSku,
} from '@/services/product-sku';
import { SKU_STATUS } from '@/constants/sku-status';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { formatPrice } from '@/utils/format-price';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Input from '@/components/Input';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { IProductSku } from '@/interfaces/IProductSku';

const InventorySkuList = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [query, setQuery] = useState<IQuery>({
    limit: 10,
    page: 1,
  });
  const [skuEdit, setSkuEdit] = useState<string>();
  const [skuEditForm, setSkuEditForm] = useState<{
    price: number;
    quantity: number;
  }>({ price: 0, quantity: 0 });
  console.log(skuEdit);
  const { data: skuList } = useGetSkuByByProductId(id ?? '');

  console.log(skuList);

  const { showNotification } = useNotificationContext();

  const { confirmModal, showConfirmModal } = useConfirmModal();

  const { mutate: updateSkuMutate, isPending: isUpdatePending } =
    useUpdateProductSku();
  const { mutate: deleteProductMutate } = useDeleteCategory();

  const handleDeleteProduct = (id: string) => {
    showNotification('Ok', 'error');
    deleteProductMutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Category] });
        showNotification('Xóa danh mục thành công', 'success');
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

  const handleSave = () => {
    updateSkuMutate(
      {
        _id: skuEdit,
        price: skuEditForm?.price,
        quantity: +skuEditForm?.quantity,
      },
      {
        onSuccess() {
          queryClient.invalidateQueries({ queryKey: [QueryKeys.ProductSku] });
          setSkuEdit('');
          showNotification('Cập nhật thành công', 'success');
        },
      }
    );
  };
  console.log(skuEditForm);
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
            <ButtonWithTooltip
              variant='contained'
              onClick={() => navigate(-1)}
              title='Quay lại'>
              <KeyboardBackspaceIcon />
            </ButtonWithTooltip>
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
                        <Button
                          size='small'
                          variant='contained'
                          onClick={() => {
                            setSkuEdit(item?._id);
                            setSkuEditForm({
                              price: item?.price,
                              quantity: item?.quantity,
                            });
                          }}>
                          <EditOutlinedIcon />
                        </Button>
                        <Box display={'inline-block'} mx={1} />
                        <Button
                          size='small'
                          variant='outlined'
                          sx={{ bgcolor: '#' }}>
                          <DeleteOutlineOutlinedIcon />
                        </Button>
                      </Box>
                    ) : (
                      <Box>
                        <Button
                          size='small'
                          variant='contained'
                          onClick={handleSave}>
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
