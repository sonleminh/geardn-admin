import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useNotificationContext } from '@/contexts/NotificationContext';
import { useQueryClient } from '@tanstack/react-query';
import { useGetProductByCategory, useGetProductById } from '@/services/product';
import {
  useCreateModel,
  useGetInitialForCreate,
  useGetModelById,
  useUpdateModel,
} from '@/services/model';

import SuspenseLoader from '@/components/SuspenseLoader';
import Input from '@/components/Input';

import { useFormik } from 'formik';
import { QueryKeys } from '@/constants/query-key';
import { ICategory } from '@/interfaces/ICategory';

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
import { createSchema, updateSchema } from '../utils/schema/modelSchema';

interface IModelPayload {
  product: string;
  name?: string;
  price: string;
  stock: string;
  extinfo: {
    tier_index?: number[];
    is_pre_order: false;
  };
}

const InventoryModelUpsert = () => {
  const { id } = useParams();
  const isEdit = !!id;

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [categoryId, setCategoryId] = useState<string>('');
  const [productId, setProductId] = useState<string>('');
  const [variant, setVariant] = useState<string[]>([]);
  const [tierIndex, setTierIndex] = useState<number[]>([]);

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
      product: '',
      price: '',
      stock: '',
      extinfo: {
        is_pre_order: false,
      },
    } as IModelPayload,
    validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      const payload = {
        ...values,
        name: product?.sk,
        price: +values.price,
        stock: +values.stock,
      };
      if (variant.length) {
        payload.name = variant.join(',');
      }
      if (tierIndex.length) {
        payload.extinfo.tier_index = tierIndex;
      } else {
        delete payload.extinfo.tier_index;
      }

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
      formik.setFieldValue('product', modelData?.product);
      formik.setFieldValue('price', modelData?.price);
      formik.setFieldValue('stock', modelData?.stock);
      formik.setFieldValue(
        'extinfo.is_pre_order',
        modelData?.extinfo?.is_pre_order
      );
      setProductId(modelData?.product);
      setVariant(modelData?.name?.split(','));
    }
  }, [modelData, initData]);

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
    setCategoryId(value);
    setTierIndex([]);
    setVariant([]);
    formik.resetForm();
  };

  const handleProductChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
    setProductId(value);
    setTierIndex([]);
    setVariant([]);
    formik.setFieldValue('price', '');
    formik.setFieldValue('stock', '');
  };

  const handleVariantChange = (e: SelectChangeEvent<string>, index: number) => {
    const { value } = e.target;
    const updatedVariants = [...variant];
    updatedVariants[index] = value;
    setVariant(updatedVariants);

    if (product?.tier_variations) {
      const updatedTierIndex: number[] = [
        ...(formik.values.extinfo?.tier_index || []),
      ];
      updatedTierIndex[index] =
        product.tier_variations[index]?.options?.indexOf(value) ?? 0;
      setTierIndex(updatedTierIndex);
    }
  };

  const handleIsPreOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    formik.setFieldValue(name, checked);
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
                onChange={handleCategoryChange}
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
                onChange={handleProductChange}
                value={formik?.values?.product ?? ''}>
                {productsByCategory?.map((item) => (
                  <MenuItem key={item?._id} value={item?._id}>
                    {item?.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                <Box component={'span'} sx={helperTextStyle}>
                  {formik.errors?.product}
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
