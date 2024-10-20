import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import SuspenseLoader from '@/components/SuspenseLoader';

import { useNotificationContext } from '@/contexts/NotificationContext';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
// import {
//   useCreateModel,
//   useGetModelById,
//   useUpdateModel,
// } from '@/services/Model';
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
import { QueryKeys } from '@/constants/query-key';
import Input from '@/components/Input';

const InventoryModelUpsert = () => {
  const { id } = useParams();
  const isEdit = !!id;

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [categoryId, setCategoryId] = useState<string>('');
  const [productId, setProductId] = useState<string>('');
  const [image, setImage] = useState<string>('');
  const [variant, setVariant] = useState<string[]>([]);

  const { data: productsByCategory } = useGetProductByCategory(categoryId);
  const { data: modelData } = useGetModelById(id as string);
  const { data: product } = useGetProductById(productId as string);
  const { data: initData } = useGetInitialForCreate();

  const { mutate: createModelMutate, isPending: isCreatePending } =
    useCreateModel();
  const { mutate: updateModelMutate, isPending: isUpdatePending } =
    useUpdateModel();

  console.log('vr:', variant);

  const formik = useFormik({
    initialValues: {
      product_id: '',
      name: '',
      price: '',
      stock: '',
    },
    // validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      const payload = {
        ...values,
        name: variant?.join(),
        price: +values.price,
        stock: +values.stock,
      };
      console.log('pl:', payload);
      if (isEdit) {
        updateModelMutate(
          { _id: id, ...payload },
          {
            onSuccess() {
              queryClient.invalidateQueries({
                queryKey: [QueryKeys.Model],
              });
              showNotification('Cập nhật loại hàng thành công', 'success');
              navigate(-1);
            },
          }
        );
      } else {
        createModelMutate(payload, {
          onSuccess() {
            queryClient.invalidateQueries({ queryKey: [QueryKeys.Model] });
            showNotification('Tạo loại hàng thành công', 'success');
            navigate(-1);
          },
        });
      }
    },
  });
  useEffect(() => {
    if (modelData) {
      formik.setFieldValue('product_id', modelData?.product_id);
      formik.setFieldValue('price', modelData?.price);
      formik.setFieldValue('stock', modelData?.stock);
      setProductId(modelData?.product_id);
      setVariant(modelData?.name?.split(','));
    }
  }, [modelData, initData]);

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
    setProductId(value);
  };

  const handleUploadResult = (result: string) => {
    formik.setFieldValue('sku_image', result);
  };

  const handleVariantChange = (e: SelectChangeEvent<string>, index: number) => {
    const { value } = e.target;

    // Create a copy of the current variantName array
    const updatedVariants = [...variant];

    // Update the variant at the specific index
    updatedVariants[index] = value;

    // Update the state
    setVariant(updatedVariants);
  };

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
            {isEdit ? 'Sửa phân loại' : 'Thêm phân loại'}:{' '}
            {isEdit && modelData?.name}
          </Typography>
        }
      />
      <Divider />

      <CardContent>
        {!isEdit && (
          <>
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
                name='product_id'
                disabled={!categoryId}
                onChange={handleSelectChange}
                value={formik?.values?.product_id}>
                {productsByCategory?.map((item) => (
                  <MenuItem key={item?._id} value={item?._id}>
                    {item?.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                <Box component={'span'} sx={helperTextStyle}>
                  {formik.errors?.product_id}
                </Box>
              </FormHelperText>
            </FormControl>
          </>
        )}
        <Grid2 container rowSpacing={2} columnSpacing={4}>
          {product?.tier_variations?.map((item, index) => (
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
          ))}
          <Grid2 size={6}>
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

export default InventoryModelUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};