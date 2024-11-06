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
  Select,
  SelectChangeEvent,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import { createSchema, updateSchema } from '../utils/schema/skuSchema';
import { IOrderItem } from '@/interfaces/IOrder';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

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

  console.log('itemIndex:', itemIndex);
  console.log('orderItems:', orderItems);
  console.log('categoryId:', categoryId);

  const { data: productsByCategory } = useGetProductByCategory(categoryId);
  const { data: modelData } = useGetModelById(id as string);
  const { data: product } = useGetProductById(productId as string);
  const { data: initData } = useGetInitialForCreate();

  const { mutate: createModelMutate, isPending: isCreatePending } =
    useCreateModel();
  const { mutate: updateModelMutate, isPending: isUpdatePending } =
    useUpdateModel();

  const formik = useFormik({
    initialValues: {
      name: '',
      phone: '',
      email: '',
      items: '',
      extinfo: {
        tier_index: [],
        is_pre_order: false,
      },
    },
    validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      // const payload = {
      //   ...values,
      //   name: variant?.join(),
      //   price: +values.price,
      //   stock: +values.stock,
      //   // extinfo: {
      //   //   tier_index: tierIndex,
      //   // },
      // };
      // if (isEdit) {
      //   updateModelMutate(
      //     { _id: id, ...payload },
      //     {
      //       onSuccess() {
      //         queryClient.invalidateQueries({
      //           queryKey: [QueryKeys.Model],
      //         });
      //         showNotification('Cập nhật loại hàng thành công', 'success');
      //         navigate(-1);
      //       },
      //     }
      //   );
      // } else {
      //   createModelMutate(payload, {
      //     onSuccess() {
      //       queryClient.invalidateQueries({ queryKey: [QueryKeys.Model] });
      //       showNotification('Tạo loại hàng thành công', 'success');
      //       navigate(-1);
      //     },
      //   });
      // }
    },
  });

  useEffect(() => {
    if (product?.tier_variations.length === 0) {
      setSelectedImage(product.images[0]);
      return;
    }

    // Find the model based on selected indices
    const matchedModel = product?.models.find((model) =>
      model.extinfo.tier_index.every(
        (tierIdx, idx) => tierIdx === selectedModel[idx]
      )
    );

    // If an image exists for the selected tier index, use it; otherwise, fallback to the default image
    if (matchedModel) {
      const tierIndex = matchedModel.extinfo.tier_index[0];
      const image =
        product?.tier_variations[0]?.images?.[tierIndex] || product?.images[0];
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

  // useEffect(() => {
  //   if (modelData) {
  //     formik.setFieldValue('product_id', modelData?.product_id);
  //     formik.setFieldValue('price', modelData?.price);
  //     formik.setFieldValue('stock', modelData?.stock);
  //     formik.setFieldValue(
  //       'extinfo.tier_index',
  //       modelData?.extinfo?.tier_index
  //     );
  //     formik.setFieldValue(
  //       'extinfo.is_pre_order',
  //       modelData?.extinfo?.is_pre_order
  //     );
  //     setProductId(modelData?.product_id);
  //     setVariant(modelData?.name?.split(','));
  //   }
  // }, [modelData, initData]);

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
    setProductId(value);
  };

  const handleIsPreOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    formik.setFieldValue(name, checked);
  };

  const handleVariantChange = (event: SelectChangeEvent, vIndex: number) => {
    const selectedOptionIndex = product?.tier_variations[
      vIndex
    ]?.options.indexOf(event.target.value);
    const updatedSelectedModel = [...selectedModel];
    updatedSelectedModel[vIndex] = selectedOptionIndex;
    setSelectedModel(updatedSelectedModel);
    setQuantity('');
  };

  const getFilteredOptions = (vIndex: number) => {
    // If no previous option selected, show all options
    if (vIndex === 0) {
      return (
        product?.tier_variations[vIndex].options.filter((_, optionIndex) =>
          product.models.some(
            (model) => model.extinfo.tier_index[0] === optionIndex
          )
        ) ?? []
      );
    }

    // Filter options based on previous selections
    return (
      product?.tier_variations[vIndex]?.options.filter((_, optionIndex) =>
        product.models.some(
          (model) =>
            model.extinfo.tier_index[vIndex - 1] ===
              selectedModel[vIndex - 1] &&
            model.extinfo.tier_index[vIndex] === optionIndex
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
    const matchedModel = product?.models?.find(
      (model) =>
        JSON.stringify(model?.extinfo?.tier_index) ===
        JSON.stringify(selectedModel)
    );

    const itemImage =
      // product?.tier_variations &&
      product?.tier_variations && product?.tier_variations?.length > 0
        ? product?.tier_variations?.[0]?.images?.[
            matchedModel?.extinfo?.tier_index?.[0] ?? 0
          ]
        : product?.images?.[0];

    const newItem = {
      model_id: matchedModel?._id ?? '',
      product_id: productId,
      product_name: product?.name ?? '',
      // category_id: categoryId,
      name: matchedModel?.name ?? '',
      image: itemImage ?? '',
      price: matchedModel?.price ?? 0,
      quantity: +quantity,
    };
    if (itemIndex !== null) {
      const updatedOrderItems = [...orderItems];
      updatedOrderItems[itemIndex] = newItem;
      console.log('updatedOrderItems:', updatedOrderItems);
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

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
            {isEdit ? 'Sửa đơn hàng' : 'Thêm đơn hàng'}:{' '}
            {isEdit && modelData?.name}
          </Typography>
        }
      />
      <Divider />

      <CardContent>
        {/* {!isEdit && (
          <> */}
        <Grid2 container rowSpacing={2} columnSpacing={4}>
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
                label='Tỉnh/Thành phố'
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
          <Grid2 size={6}>
            <FormControl fullWidth>
              <Input
                label='Quận/Huyện'
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
                label='Phường/Xã'
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
          <Grid2 size={12}>
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
            <Typography mb={1}>Thêm sản phẩm</Typography>
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
                  <MenuItem key={item?._id} value={item?._id}>
                    {item?.name}
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
            {selectedImage && (
              <img
                src={selectedImage}
                alt=''
                style={{
                  width: '100%',
                  maxWidth: '100px',
                  marginBottom: '8px',
                  borderRadius: '8px',
                }}
              />
            )}
            <FormControl fullWidth>
              <Input
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
                onChange={(e) => setQuantity(e.target.value)}
                value={quantity}
              />
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button variant='contained' onClick={hanleUpsertOrderItem}>
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
          <Grid2 size={6}>
            <Typography mb={1}>Sản phẩm</Typography>
            {orderItems?.map((item, index) => (
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
                  <Typography sx={{ width: 50, mr: 2, fontSize: 14 }}>
                    x {item?.quantity}
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
            ))}
          </Grid2>
        </Grid2>
        <Box sx={{ textAlign: 'end' }}>
          <Button onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            Trở lại
          </Button>
          <Button variant='contained' onClick={() => formik.handleSubmit()}>
            Thêm
          </Button>
        </Box>
      </CardContent>
      {(isCreatePending || isUpdatePending) && <SuspenseLoader />}
    </Card>
  );
};

export default OrderUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
