import { ChangeEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { QueryKeys } from '@/constants/query-key';
import { useQueryClient } from '@tanstack/react-query';

import { AddCircleOutlined } from '@mui/icons-material';

import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import Input from '@/components/Input';
// import { Model_STATUS } from '@/constants/Model-status';
import { useNotificationContext } from '@/contexts/NotificationContext';
import useConfirmModal from '@/hooks/useModalConfirm';
import { IQuery } from '@/interfaces/IQuery';
// import {
//   useDeleteProductModel,
//   useGetModelByProductId
// } from '@/services/model';
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
import { useGetModelByProductId } from '@/services/model';
import { useGetProductById } from '@/services/product';

const InventoryModelList = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [query, setQuery] = useState<IQuery>({
    limit: 10,
    page: 1,
  });
  const [modelEdit, setModelEdit] = useState<string>('');
  const [modelEditForm, setModelEditForm] = useState<{
    price: number;
    stock: number;
  }>({ price: 0, stock: 0 });

  const { showNotification } = useNotificationContext();
  const { data: productData } = useGetProductById(id as string);
  // const { data: modelList } = useGetModelByProductId(id ?? '');

  const { confirmModal, showConfirmModal } = useConfirmModal();

  // const { mutate: updateModelMutate, isPending: isUpdatePending } =
  //   useUpdateProductModel();
  // const { mutate: deleteProductModel } = useDeleteProductModel();

  // const handleDeleteProduct = (id: string) => {
  //   showNotification('Ok', 'error');
  //   deleteProductModel(id, {
  //     onSuccess: () => {
  //       queryClient.invalidateQueries({ queryKey: [QueryKeys.ProductModel] });
  //       showNotification('Xóa mã hàng thành công', 'success');
  //       // handleClosePopover();
  //     },
  //   });
  // };

  const handleChangeQuery = (object: Partial<IQuery>) => {
    setQuery((prev) => ({ ...prev, ...object }));
  };

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setModelEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // const handleSave = () => {
  //   updateModelMutate(
  //     {
  //       _id: ModelEdit,
  //       price: ModelEditForm?.price,
  //       stock: +ModelEditForm?.stock,
  //     },
  //     {
  //       onSuccess() {
  //         queryClient.invalidateQueries({ queryKey: [QueryKeys.ProductModel] });
  //         setModelEdit('');
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
                onClick={() => navigate('/inventory/model/create')}
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
              {productData?.models?.map((item, index) => (
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
                          required
                          // helperText={
                          //   <Box component={'span'} sx={helperTextStyle}>
                          //     {formik.errors.name}
                          //   </Box>
                          // }
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
                          // helperText={
                          //   <Box component={'span'} sx={helperTextStyle}>
                          //     {formik.errors.name}
                          //   </Box>
                          // }
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
                              // onOk: () => handleDeleteProduct(item?._id),
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
              ))}
            </TableBody>
          </Table>
          {/* {ModelList?.length === 0 && (
            <Box sx={{ my: 2, textAlign: 'center', color: '#696969' }}>
              Empty
            </Box>
          )} */}
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

export default InventoryModelList;
