import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import SuspenseLoader from '@/components/SuspenseLoader';

import { useNotificationContext } from '@/contexts/NotificationContext';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import Input from '@/components/Input';
import { QueryKeys } from '@/constants/query-key';
import { ICategory } from '@/interfaces/ICategory';
import {
  useCreateModel,
  useGetInitialForCreate,
  useGetModelById,
  useUpdateModel,
} from '@/services/model';
import { useGetProductByCategory, useGetProductById } from '@/services/product';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControl,
  FormHelperText,
  Grid2,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Theme,
  Typography,
} from '@mui/material';
import { createSchema, updateSchema } from '../utils/schema/orderSchema';
import { IOrderItem } from '@/interfaces/IOrder';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import {
  getProvinces,
  useCreateOrder,
  useGetDistrictByCode,
  useGetOrderById,
  useGetProvinces,
  useUpdateOrder,
} from '@/services/order';
import { formatPrice } from '@/utils/format-price';

const OrderUpsert = () => {
  const { id } = useParams();
  const isEdit = !!id;

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [categoryId, setCategoryId] = useState<string>('');
  const [productId, setProductId] = useState<string>('');
  const [quantity, setQuantity] = useState('');
  const [orderItems, setOrderItems] = useState<IOrderItem[]>([]);
  const [selectedModel, setSelectedModel] = useState<(number | undefined)[]>(
    []
  );
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isOrderItemEdit, setIsOrderItemEdit] = useState<boolean>(false);
  const [modelIdEdit, setModelIdEdit] = useState<string>('');
  const [itemIndex, setItemIndex] = useState<number | null>(null);
  const [districtCode, setDistrictCode] = useState<string>('');

  // console.log('orderItems:', orderItems);
  // console.log('categoryId:', categoryId);

  const { data: orderData } = useGetOrderById(id as string);
  const { data: productsByCategory } = useGetProductByCategory(categoryId);
  const { data: product } = useGetProductById(productId);
  const { data: initData } = useGetInitialForCreate();
  const { data: provinces } = useGetProvinces();
  const { data: district } = useGetDistrictByCode(districtCode);
  // console.log('district:', districtCode);
  // console.log('provinces:', provinces);

  const { mutate: createOrderMutate, isPending: isCreatePending } =
    useCreateOrder();
  const { mutate: updateOrderMutate, isPending: isUpdatePending } =
    useUpdateOrder();

  const formik = useFormik({
    initialValues: {
      name: '',
      phone: '',
      email: '',
      items: '',
      province: '',
      ward: '',
    },
    validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      const payload = {
        ...values,
        items: orderItems,
        receive_option: 'COD',
        district: district?.name,
        // total_amount: totalAmount(),
        // name: variant?.join(),
        // price: +values.price,
        // stock: +values.stock,
        // extinfo: {
        //   tier_index: tierIndex,
        // },
      };
      if (isEdit) {
        updateOrderMutate(
          { _id: id, ...payload },
          {
            onSuccess() {
              queryClient.invalidateQueries({
                queryKey: [QueryKeys.Model],
              });
              showNotification('Cập nhật đơn hàng thành công', 'success');
              navigate(-1);
            },
          }
        );
      } else {
        createOrderMutate(payload, {
          onSuccess() {
            queryClient.invalidateQueries({ queryKey: [QueryKeys.Order] });
            showNotification('Tạo đơn hàng thành công', 'success');
            navigate(-1);
          },
        });
      }
    },
  });

  useEffect(() => {
    if (product?.tier_variations.length === 0) {
      setSelectedImage(product.images[0]);
      return;
    }

    // Find the model based on selected indices
    const matchedModel = product?.models.find((model) =>
      model?.extinfo?.tier_index?.every(
        (tierIdx, idx) => tierIdx === selectedModel[idx]
      )
    );

    // If an image exists for the selected tier index, use it; otherwise, fallback to the default image
    if (matchedModel) {
      const tierIndex = matchedModel?.extinfo?.tier_index?.[0];
      const image =
        product?.tier_variations[0]?.images?.[tierIndex ?? 0] ||
        product?.images[0];
      setSelectedImage(image ?? '');
    }
  }, [selectedModel, product]);

  useEffect(() => {
    if (
      (isOrderItemEdit && product && modelIdEdit) ||
      (isOrderItemEdit && product)
    ) {
      setSelectedModel(
        product?.models?.find((item) => item._id === modelIdEdit)?.extinfo
          .tier_index ?? []
      );
      setCategoryId(product?.category?._id);
    }
  }, [isOrderItemEdit, product, modelIdEdit]);

  useEffect(() => {
    if (orderData) {
      console.log('od:', orderData?.items);
      formik.setFieldValue('name', orderData?.name);
      formik.setFieldValue('phone', orderData?.phone);
      formik.setFieldValue('email', orderData?.email);
      // formik.setFieldValue('stock', modelData?.stock);
      // formik.setFieldValue(
      //   'extinfo.tier_index',
      //   modelData?.extinfo?.tier_index
      // );
      // formik.setFieldValue(
      //   'extinfo.is_pre_order',
      //   modelData?.extinfo?.is_pre_order
      // );
      setOrderItems(orderData?.items);
    }
  }, [orderData]);

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };
  const handleSelectChangeValue = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    console.log('o:', name, value);
    formik.setFieldValue(name, value);
  };

  // const handleSelectChange = (e: SelectChangeEvent<string>) => {
  //   const { name, value } = e.target;
  //   formik.setFieldValue(name, value);
  //   setProductId(value);
  // };

  // const handleIsPreOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, checked } = e.target;
  //   formik.setFieldValue(name, checked);
  // };

  const handleVariantChange = (event: SelectChangeEvent, vIndex: number) => {
    const selectedOptionIndex = product?.tier_variations[
      vIndex
    ]?.options.indexOf(event.target.value);
    const updatedSelectedModel = [...selectedModel];
    updatedSelectedModel[vIndex] = selectedOptionIndex;
    setSelectedModel(updatedSelectedModel);
    setSelectedImage('');
    setQuantity('');
  };

  const getFilteredOptions = (vIndex: number) => {
    // If no previous option selected, show all options
    if (vIndex === 0) {
      return (
        product?.tier_variations[vIndex].options.filter((_, optionIndex) =>
          product.models.some(
            (model) => model?.extinfo?.tier_index?.[0] === optionIndex
          )
        ) ?? []
      );
    }

    // Filter options based on previous selections
    return (
      product?.tier_variations[vIndex]?.options.filter((_, optionIndex) =>
        product.models.some(
          (model) =>
            model?.extinfo?.tier_index?.[vIndex - 1] ===
              selectedModel?.[vIndex - 1] &&
            model?.extinfo?.tier_index?.[vIndex] === optionIndex
        )
      ) ?? []
    );
  };

  // const handleVariantChange = (event: SelectChangeEvent, vIndex: number) => {
  //   const optionIndex = product?.tier_variations[vIndex]?.options?.indexOf(
  //     event?.target?.value ?? ''
  //   );
  //   const updatedSelectedModel = [...selectedModel];
  //   if (optionIndex !== -1) {
  //     updatedSelectedModel[vIndex] = optionIndex;
  //   } else {
  //     updatedSelectedModel[vIndex] = undefined;
  //   }
  //   setSelectedModel(updatedSelectedModel);
  // };
  const hanleUpsertOrderItem = () => {
    let matchedModel;
    if (!product?.tier_variations?.length) {
      matchedModel = product?.models[0];
    } else {
      matchedModel = product?.models?.find(
        (model) =>
          JSON.stringify(model?.extinfo?.tier_index) ===
          JSON.stringify(selectedModel)
      );
    }

    // console.log(matchedModel);

    if (
      !isOrderItemEdit &&
      orderItems?.find((item) => item?.model_id === matchedModel?._id)
    ) {
      return showNotification('Sản phẩm đã có trong danh sách!', 'error');
    }

    if (matchedModel && +quantity > matchedModel?.stock) {
      return showNotification('Số lượng vượt quá hàng trong kho!!', 'error');
    }

    const newItem = {
      model_id: matchedModel?._id ?? '',
      product_id: productId,
      product_name: product?.name ?? '',
      // category_id: categoryId,
      name: matchedModel?.name ?? '',
      image: selectedImage,
      price: matchedModel?.price ?? 0,
      quantity: +quantity,
    };
    if (itemIndex !== null) {
      const updatedOrderItems = [...orderItems];
      updatedOrderItems[itemIndex] = newItem;
      setOrderItems(updatedOrderItems);
      setItemIndex(null);
    } else {
      setOrderItems((prev) => [...prev, newItem]);
    }

    setCategoryId('');
    setProductId('');
    setSelectedImage('');
    setQuantity('');
  };

  const handleCancelUpsertOrderItem = () => {
    setIsOrderItemEdit(false);
    setCategoryId('');
    setProductId('');
    setSelectedImage('');
    setModelIdEdit('');
    setQuantity('');
  };

  const handleEditOrderItem = (item: IOrderItem, index: number) => {
    setIsOrderItemEdit(true);
    // setCategoryId(item?.category_id);
    setProductId(item?.product_id);
    setModelIdEdit(item?.model_id);
    setQuantity(`${item?.quantity}`);
    setItemIndex(index);
    // setIsOrderItemEdit(true); // Set edit mode
    // setProductId(item.product_id); // Set productId
    // setCategoryId(item.product_id); // Set categoryId
    // // Find the model based on item details to pre-fill variant selections
    // const matchedProduct = product?.models?.find(
    //   (model) => model._id === item.product_id
    // );
    // if (matchedProduct) {
    //   const selectedModelIndices = matchedProduct.models.find(
    //     (model) => model._id === item.model_id
    //   )?.extinfo?.tier_index;
    //   if (selectedModelIndices) {
    //     setSelectedModel(selectedModelIndices);
    //   }
    // }
    // setQuantity(item.quantity.toString());
  };

  const handleDeleteOrderItem = (index: number) => {
    const updatedOrderItems = [...orderItems];
    updatedOrderItems.splice(index, 1);
    setOrderItems(updatedOrderItems);
  };

  function showOrderItemStock() {
    if (product && selectedModel.length > 0) {
      const matchedModel = product?.models?.find(
        (model) =>
          JSON.stringify(model?.extinfo?.tier_index) ===
          JSON.stringify(selectedModel)
      );
      return matchedModel?.stock;
    } else if (
      product &&
      selectedModel.length === 0 &&
      product?.models?.length === 1
    ) {
      return product?.models?.[0]?.stock;
    } else {
      return null;
    }
  }

  const totalAmount = () => {
    return orderItems?.reduce(
      (acc, item) => acc + (item?.price ?? 0) * (item?.quantity ?? 0),
      0
    );
  };
  // console.log('slt:', selectedModel);
  // console.log(!!product?.tier_variations?.length && !!selectedModel?.length);

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
            {isEdit ? 'Sửa đơn hàng' : 'Thêm đơn hàng'}:{' '}
          </Typography>
        }
      />
      <Divider />

      <CardContent>
        {/* {!isEdit && (
          <> */}
        <Typography mb={1}>Thông tin:</Typography>
        <Grid2 container rowSpacing={2} columnSpacing={4} mb={2}>
          <Grid2 size={6}>
            <FormControl fullWidth>
              <Input
                label='Tên khách hàng'
                name='name'
                variant='filled'
                size='small'
                helperText={
                  <Box component={'span'} sx={helperTextStyle}>
                    {formik.errors.name}
                  </Box>
                }
                value={formik?.values.name}
                onChange={handleChangeValue}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={6}>
            <FormControl fullWidth>
              <Input
                label='Email'
                name='email'
                variant='filled'
                size='small'
                helperText={
                  <Box component={'span'} sx={helperTextStyle}>
                    {formik.errors.email}
                  </Box>
                }
                value={formik?.values.email}
                onChange={handleChangeValue}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={6}>
            <FormControl fullWidth>
              <Input
                label='Số điện thoại'
                name='phone'
                variant='filled'
                size='small'
                helperText={
                  <Box component={'span'} sx={helperTextStyle}>
                    {formik.errors.phone}
                  </Box>
                }
                value={formik?.values.phone}
                onChange={handleChangeValue}
              />
            </FormControl>
          </Grid2>
        </Grid2>
        <Typography mb={1}>Địa chỉ:</Typography>
        <Grid2 mb={4} container rowSpacing={2} columnSpacing={4}>
          <Grid2 size={6}>
            <FormControl
              variant='filled'
              fullWidth
              sx={{
                '& .MuiFilledInput-root': {
                  overflow: 'hidden',
                  borderRadius: 1,
                  backgroundColor: '#fff !important',
                  border: '1px solid',
                  borderColor: 'rgba(0,0,0,0.23)',
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'transparent',
                    border: '2px solid',
                  },
                },
                '& .MuiInputLabel-asterisk': {
                  color: 'red',
                },
              }}>
              <InputLabel>Tỉnh/Thành phố</InputLabel>
              <Select
                disableUnderline
                size='small'
                name='province'
                onChange={handleSelectChangeValue}
                value={formik?.values.province ?? ''}>
                {provinces &&
                  provinces?.map((item) => (
                    <MenuItem key={item?.code} value={item?.name}>
                      {item?.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={6}>
            <FormControl
              variant='filled'
              fullWidth
              sx={{
                '& .MuiFilledInput-root': {
                  overflow: 'hidden',
                  borderRadius: 1,
                  backgroundColor: '#fff !important',
                  border: '1px solid',
                  borderColor: 'rgba(0,0,0,0.23)',
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'transparent',
                    border: '2px solid',
                  },
                },
                '& .MuiInputLabel-asterisk': {
                  color: 'red',
                },
              }}>
              <InputLabel>Quận/Huyện</InputLabel>
              <Select
                disableUnderline
                size='small'
                name='district'
                onChange={(e) => {
                  setDistrictCode(e?.target?.value as string);
                }}
                value={districtCode}>
                {provinces
                  ?.find((item) => item?.name === formik?.values?.province)
                  ?.districts?.map((item) => (
                    <MenuItem key={item?.code} value={item?.code}>
                      {item?.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={6}>
            <FormControl
              variant='filled'
              fullWidth
              sx={{
                '& .MuiFilledInput-root': {
                  overflow: 'hidden',
                  borderRadius: 1,
                  backgroundColor: '#fff !important',
                  border: '1px solid',
                  borderColor: 'rgba(0,0,0,0.23)',
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'transparent',
                    border: '2px solid',
                  },
                },
                '& .MuiInputLabel-asterisk': {
                  color: 'red',
                },
              }}>
              <InputLabel>Phường/Xã</InputLabel>
              <Select
                disableUnderline
                name='ward'
                size='small'
                onChange={handleSelectChangeValue}
                value={formik?.values.ward ?? ''}>
                {district?.wards?.map((item) => (
                  <MenuItem key={item?.code} value={item?.name}>
                    {item?.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={6}>
            <FormControl fullWidth>
              <Input
                label='Địa chỉ cụ thể'
                name='phone'
                variant='filled'
                size='small'
                rows={3}
                helperText={
                  <Box component={'span'} sx={helperTextStyle}>
                    {formik.errors.phone}
                  </Box>
                }
                value={formik?.values.phone}
                onChange={handleChangeValue}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={6}>
            <Typography mb={1}>Thêm sản phẩm:</Typography>
            <FormControl
              variant='filled'
              fullWidth
              sx={{
                mb: 2,
                '& .MuiFilledInput-root': {
                  overflow: 'hidden',
                  borderRadius: 1,
                  backgroundColor: '#fff !important',
                  border: '1px solid',
                  borderColor: 'rgba(0,0,0,0.23)',
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'transparent',
                    border: '2px solid',
                  },
                },
                '& .MuiInputLabel-asterisk': {
                  color: 'red',
                },
              }}>
              <InputLabel>Danh mục</InputLabel>
              <Select
                disableUnderline
                size='small'
                onChange={(e) => {
                  setCategoryId(e?.target?.value as string);
                  setProductId('');
                  setSelectedModel([]);
                  setSelectedImage('');
                  setQuantity('');
                }}
                value={categoryId ?? ''}>
                {initData?.categoryList?.map((item: ICategory) => (
                  <MenuItem key={item?._id} value={item?._id}>
                    {item?.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl
              variant='filled'
              fullWidth
              sx={{
                mb: 2,
                '& .MuiFilledInput-root': {
                  overflow: 'hidden',
                  borderRadius: 1,
                  backgroundColor: categoryId ? '#fff' : '',
                  border: '1px solid',
                  borderColor: 'rgba(0,0,0,0.23)',

                  '&.Mui-focused': {
                    border: '2px solid',
                  },
                },
                '& .MuiInputLabel-asterisk': {
                  color: 'red',
                },
              }}>
              <InputLabel>Sản phẩm</InputLabel>
              <Select
                disableUnderline
                size='small'
                name='product'
                disabled={!categoryId && !isOrderItemEdit}
                onChange={(e) => {
                  setProductId(e.target.value);
                  setSelectedModel([]);
                  setSelectedImage('');
                  setQuantity('');
                }}
                value={productId}>
                {productsByCategory?.map((item) => (
                  <MenuItem
                    key={item?._id}
                    value={item?._id}
                    disabled={
                      !item?.original_price
                      //  ||
                      // orderItems?.find((orderItem) =>
                      //   item?.models?.some(
                      //     (item) => item._id === orderItem?.model_id
                      //   )
                    }>
                    {item?.name} {!item?.original_price && '- (Hết hàng)'}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                <Box component={'span'} sx={helperTextStyle}>
                  {/* {formik.errors?.product} */}
                </Box>
              </FormHelperText>
            </FormControl>
            {product?.tier_variations?.map((item, vIndex) => (
              <FormControl
                sx={{
                  mb: 2,
                  '& .MuiFilledInput-root': {
                    overflow: 'hidden',
                    borderRadius: 1,
                    backgroundColor: '#fff !important',
                    border: '1px solid',
                    borderColor: 'rgba(0,0,0,0.23)',
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'transparent',
                      border: '2px solid',
                    },
                  },
                  '& .MuiInputLabel-asterisk': {
                    color: 'red',
                  },
                }}
                key={item?.name}
                variant='filled'
                fullWidth>
                <InputLabel>{item?.name}</InputLabel>
                <Select
                  disableUnderline
                  size='small'
                  onChange={(e) => {
                    handleVariantChange(e, vIndex);
                  }}
                  value={
                    selectedModel[vIndex] !== undefined
                      ? product?.tier_variations[vIndex]?.options[
                          selectedModel[vIndex] as number
                        ]
                      : ''
                  }>
                  {getFilteredOptions(vIndex).map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
            {categoryId && productId && (
              <Box>
                <Grid2 container spacing={4} mb={1}>
                  <Grid2 sx={{ display: 'flex' }} size={6}>
                    <Typography mr={2}>Ảnh:</Typography>
                    {selectedImage && (
                      <img
                        src={selectedImage}
                        alt=''
                        style={{
                          width: '100%',
                          maxWidth: '80px',
                          height: '80px',
                          marginBottom: '4px',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          objectFit: 'contain',
                        }}
                      />
                    )}
                  </Grid2>
                  <Grid2 size={6}>
                    <Typography>Kho: {showOrderItemStock()}</Typography>
                  </Grid2>
                </Grid2>
              </Box>
            )}
            <FormControl fullWidth>
              <Input
                // sx={{
                //   '& .MuiFilledInput-root': {
                //     ':hover': {
                //       backgroundColor: '#E0E0E0 !important',
                //     },
                //   },
                // }}
                label='Số lượng'
                name='quantity'
                variant='filled'
                size='small'
                type='number'
                helperText={
                  <Box component={'span'} sx={helperTextStyle}>
                    {/* {formik.errors.name} */}
                  </Box>
                }
                disabled={showOrderItemStock() === 0 ? true : false}
                onChange={(e) => setQuantity(e.target.value)}
                value={quantity}
              />
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant='contained'
                onClick={hanleUpsertOrderItem}
                disabled={!selectedImage || !quantity}>
                {isOrderItemEdit ? 'Lưu' : 'Thêm'}
              </Button>
              <Button
                sx={{ ml: 2 }}
                variant='outlined'
                disabled={!categoryId || !productId}
                onClick={handleCancelUpsertOrderItem}>
                Hủy
              </Button>
            </Box>
          </Grid2>
          <Grid2
            // sx={{ border: '1px solid #aaaaaa', borderRadius: 1, p: 2 }}
            size={6}>
            <Typography mb={1}>Sản phẩm:</Typography>
            <TableContainer component={Paper}>
              <Table sx={{}} aria-label='simple table'>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '3%', px: 1 }} align='center'>
                      Stt
                    </TableCell>
                    <TableCell sx={{ width: '5%', px: 0 }} align='center'>
                      Ảnh
                    </TableCell>
                    <TableCell sx={{ width: '20%', px: 1 }} align='center'>
                      Tên
                    </TableCell>
                    <TableCell sx={{ width: '5%', px: 1 }} align='center'>
                      SL
                    </TableCell>
                    <TableCell sx={{ width: '8%', px: 1 }} align='center'>
                      Giá
                    </TableCell>
                    <TableCell sx={{ width: '16%' }} align='center'>
                      Tuỳ chọn
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderItems?.length ? (
                    orderItems.map((item, index) => (
                      <TableRow
                        key={item.model_id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}>
                        <TableCell
                          sx={{ px: 1 }}
                          component='th'
                          scope='row'
                          align='center'>
                          {index + 1}
                        </TableCell>
                        <TableCell sx={{ px: 0 }} align='center'>
                          <img
                            src={item?.image}
                            alt='Selected Product'
                            style={{
                              width: '48px',
                              maxWidth: '48px',
                              height: '48px',
                              objectFit: 'contain',
                              border: '1px solid #ccc',
                              borderRadius: '2px',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: 13 }}>
                          {item.product_name}
                        </TableCell>
                        <TableCell sx={{ px: 1 }} align='center'>
                          {item.quantity}
                        </TableCell>
                        <TableCell sx={{ fontSize: 12 }} align='center'>
                          {formatPrice(item?.price)}
                        </TableCell>
                        <TableCell align='center'>
                          <Button
                            sx={{
                              minWidth: 20,
                              width: 20,
                              height: 30,
                              mr: 1,
                            }}
                            variant='outlined'
                            onClick={() => {
                              handleEditOrderItem(item, index);
                            }}>
                            <EditOutlinedIcon sx={{ fontSize: 14 }} />
                          </Button>
                          <Button
                            sx={{ minWidth: 20, width: 20, height: 30 }}
                            variant='outlined'
                            onClick={() => handleDeleteOrderItem(index)}>
                            <DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <Box sx={{ width: '100%' }}>Empty</Box>
                  )}
                </TableBody>
              </Table>
              <Divider />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'end',
                  alignItems: 'center',
                  width: '100%',
                  px: 4,
                  py: 1,
                }}>
                <Typography sx={{ mr: 4, fontSize: 14 }}>Tổng tiền:</Typography>
                <Typography>{formatPrice(totalAmount())}</Typography>
              </Box>
            </TableContainer>
            {/* <Typography mb={1}>Sản phẩm:</Typography> */}
            {/* {orderItems?.map((item, index) => (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: index !== 0 ? 2 : 0,
                }}
                key={item?.model_id}>
                <Box sx={{ display: 'flex' }}>
                  <img
                    src={item?.image}
                    alt='Selected Product'
                    style={{
                      width: '50px',
                      maxWidth: '50px',
                      height: '50px',
                      objectFit: 'contain',
                      marginRight: '12px',
                      border: '1px solid #ccc',
                      borderRadius: '2px',
                    }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}>
                    <Typography sx={{ fontSize: 15 }}>
                      {item?.product_name}
                    </Typography>
                    {item?.name && (
                      <Typography
                        sx={{
                          display: 'inline-block',
                          px: '6px',
                          py: '2px',
                          bgcolor: '#f3f4f6',
                          fontSize: 11,
                          borderRadius: 0.5,
                        }}>
                        {item?.name}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex' }}>
                  <Typography sx={{ width: 40, mr: 1, fontSize: 14 }}>
                    x {item?.quantity}
                  </Typography>
                  <Typography
                    sx={{ width: 80, mr: 3, fontSize: 14, textAlign: 'end' }}>
                    {formatPrice(item?.price)}
                  </Typography>
                  <Button
                    sx={{
                      minWidth: 40,
                      width: 40,
                      height: 30,
                      mr: 1,
                    }}
                    variant='outlined'
                    onClick={() => {
                      handleEditOrderItem(item, index);
                    }}>
                    <EditOutlinedIcon sx={{ fontSize: 20 }} />
                  </Button>
                  <Button
                    sx={{ minWidth: 40, width: 40, height: 30 }}
                    variant='outlined'
                    onClick={() => handleDeleteOrderItem(index)}>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 20 }} />
                  </Button>
                </Box>
              </Box>
            ))} */}
            {/* <Divider sx={{ mt: 2 }} /> */}
          </Grid2>
        </Grid2>
        <Box sx={{ textAlign: 'end' }}>
          <Button
            sx={{ mr: 2 }}
            variant='contained'
            onClick={() => formik.handleSubmit()}>
            Thêm
          </Button>
          <Button onClick={() => navigate(-1)}>Trở lại</Button>
        </Box>
      </CardContent>
      {/* {(isCreatePending || isUpdatePending) && <SuspenseLoader />} */}
    </Card>
  );
};

export default OrderUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
