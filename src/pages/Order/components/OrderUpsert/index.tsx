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

  console.log('orderItems:', orderItems);

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
    const optionIndex = product?.tier_variations[vIndex]?.options?.indexOf(
      event?.target?.value ?? ''
    );
    const updatedSelectedModel = [...selectedModel];
    if (optionIndex !== -1) {
      updatedSelectedModel[vIndex] = optionIndex;
    } else {
      updatedSelectedModel[vIndex] = undefined;
    }
    setSelectedModel(updatedSelectedModel);
  };
  console.log('selectedModel', selectedModel);
  const hanleAddOrderItem = () => {
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
      product_id: productId ?? '',
      product_name: product?.name ?? '',
      name: matchedModel?.name ?? '',
      image: itemImage ?? '',
      price: matchedModel?.price ?? 0,
      quantity: +quantity,
    };
    console.log('newItem:', newItem);

    setOrderItems((prev) => [...prev, newItem]);
  };

  useEffect(() => {
    setSelectedModel([]);
  }, [product]);

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
                disabled={!categoryId}
                onChange={(e) => setProductId(e.target.value)}
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
                  {item?.options
                    ?.filter((item, index) =>
                      product.models.some(
                        (model) => model?.extinfo?.tier_index[vIndex] === index
                      )
                    )
                    .map((item: string) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            ))}
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
              <Button variant='contained' onClick={hanleAddOrderItem}>
                Thêm
              </Button>
              <Button
                sx={{
                  ml: 2,
                  textTransform: 'initial',
                  color: '#fff',
                  border: '1px solid #D03739',
                  bgcolor: '#D03739',
                }}
                variant='outlined'
                size='small'>
                Xoá
              </Button>
            </Box>
          </Grid2>
          <Grid2 size={6}>
            <Typography mb={1}>Ghi chú</Typography>
          </Grid2>
        </Grid2>
        {/* </>
        )} */}
        <Grid2 container rowSpacing={2} columnSpacing={4}>
          {/* {product?.tier_variations?.map((item, index) => (
            <Grid2 key={item?.name} size={6}>
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
                <InputLabel>{item?.name}</InputLabel>
                <Select
                  disableUnderline
                  size='small'
                  onChange={(e) => {
                    handleVariantChange(e, index);
                  }}
                  value={variant[index] ?? ''}>
                  {item?.options?.map((item: string) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
          ))} */}
          {/* <Grid2 size={6}>
            <FormControl fullWidth>
              <Input
                id='price'
                label='Giá'
                name='price'
                variant='filled'
                type='number'
                size='small'
                helperText={
                  <Box component={'span'} sx={helperTextStyle}>
                    {formik.errors.price}
                  </Box>
                }
                value={formik?.values.price}
                onChange={handleChangeValue}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={6}>
            <FormControl fullWidth>
              <Input
                id='stock'
                label='Số lượng'
                name='stock'
                variant='filled'
                size='small'
                helperText={
                  <Box component={'span'} sx={helperTextStyle}>
                    {formik.errors.stock}
                  </Box>
                }
                value={formik?.values.stock}
                onChange={handleChangeValue}
              />
            </FormControl>
          </Grid2>
          <Grid2 sx={{ display: 'flex', alignItems: 'center' }} size={6}>
            <Checkbox
              id='isPreOrder'
              name='extinfo.is_pre_order'
              checked={formik?.values?.extinfo?.is_pre_order ?? false}
              onChange={handleIsPreOrderChange}
              inputProps={{ 'aria-label': 'controlled' }}
            />
            <InputLabel htmlFor='isPreOrder' sx={{ cursor: 'pointer' }}>
              Hàng đặt trước
            </InputLabel>
          </Grid2> */}
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
