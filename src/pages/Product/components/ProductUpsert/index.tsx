import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import CKEditor from '@/components/CKEditor';
import Input from '@/components/Input';
import MultipleFileUpload from '@/components/MultipleFileUpload';
import SuspenseLoader from '@/components/SuspenseLoader';

import { QueryKeys } from '@/constants/query-key';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { IProductPayload, ITagOptions } from '@/interfaces/IProduct';
import {
  useCreateProduct,
  useGetProductById,
  useGetProductInitial,
  useUpdateProduct,
} from '@/services/product';
import { formatDateToIOS, formatDateToNormal } from '@/utils/formatDate';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';

import {
  Autocomplete,
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
  TextField,
  Theme,
  Typography,
} from '@mui/material';
import { TYPE_ATTRIBUTE } from '@/constants/type-attribute';

const ProductUpsert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [categoryId, setCategoryId] = useState<string>('');
  const [tags, setTags] = useState<ITagOptions[]>([]);
  const [attributes, setAttributes] = useState<string[]>([]);

  const isEdit = !!id;

  const { data: initData } = useGetProductInitial();
  const { data: productData } = useGetProductById(id as string);

  const { mutate: createProductMutate, isPending: isCreatePending } =
    useCreateProduct();
  const { mutate: updateProductMutate, isPending: isUpdatePending } =
    useUpdateProduct();

  const formik = useFormik({
    initialValues: {
      name: '',
      discount: {
        discountPrice: '',
        startDate: '',
        endDate: '',
      },
      tags: [],
      category: '',
      images: [],
      brand: '',
      content: '',
      attributes: [],
    },
    // validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      const hasDiscount =
        values.discount.discountPrice !== '' ||
        values.discount.startDate !== '' ||
        values.discount.endDate !== '';
      const payload: IProductPayload = {
        ...values,
        category: initData?.categories.find((c) => c._id === categoryId),
        tags: tags,
        discount: hasDiscount
          ? {
              discountPrice: Number(values.discount.discountPrice),
              startDate: formatDateToIOS(values.discount.startDate),
              endDate: formatDateToIOS(values.discount.endDate),
            }
          : undefined,
      };
      if (!hasDiscount) {
        delete payload.discount;
      }
      if (!payload.attributes || payload?.attributes?.length === 0) {
        delete payload.attributes;
      }
      console.log(payload);
      if (isEdit) {
        updateProductMutate(
          { _id: id, ...payload },
          {
            onSuccess() {
              queryClient.invalidateQueries({ queryKey: [QueryKeys.Product] });
              showNotification('Cập nhật sản phẩm thành công', 'success');
              navigate('/product');
            },
          }
        );
      } else {
        createProductMutate(payload, {
          onSuccess() {
            queryClient.invalidateQueries({ queryKey: [QueryKeys.Product] });
            showNotification('Tạo sản phẩm thành công', 'success');
            navigate('/product');
          },
        });
      }
    },
  });
  useEffect(() => {
    if (productData) {
      formik.setFieldValue('name', productData?.name);
      formik.setFieldValue(
        'discount.discountPrice',
        productData?.discount?.discountPrice
      );
      formik.setFieldValue(
        'discount.startDate',
        formatDateToNormal(productData?.discount?.startDate)
      );
      formik.setFieldValue(
        'discount.endDate',
        formatDateToNormal(productData?.discount?.endDate)
      );
      formik.setFieldValue('name', productData?.name);
      formik.setFieldValue('category', productData?.category?._id);
      formik.setFieldValue('tags', productData?.tags);
      formik.setFieldValue('images', productData?.images);
      formik.setFieldValue('brand', productData?.brand);
      formik.setFieldValue('content', productData?.content);
      formik.setFieldValue('attributes', productData?.attributes);
      setCategoryId(productData?.category?._id);
      setTags(productData?.tags);
      setAttributes(productData?.attributes);
    }
  }, [productData, initData]);

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  const handleTagChange = (
    _: React.ChangeEvent<unknown>,
    val: ITagOptions[]
  ) => {
    setTags(val);
    formik.setFieldValue('tags', val);
  };

  const handleAttributeChange = (
    _: React.ChangeEvent<unknown>,
    val: string[]
  ) => {
    setAttributes(val);
    formik.setFieldValue('attributes', val);
  };

  const handleCategoryChange = (e: SelectChangeEvent<unknown>) => {
    setCategoryId(e.target.value as string);
    formik.setFieldValue('category', e.target.value as string);
  };

  const handleUploadResult = (result: string[]) => {
    formik.setFieldValue('images', result);
  };

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Typography variant='h5' sx={{ fontWeight: 600 }}>
            {isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
          </Typography>
        }
      />
      <Divider />

      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl>
          <Input
            id='name'
            label='Tên'
            name='name'
            variant='filled'
            required
            helperText={
              <Box component={'span'} sx={helperTextStyle}>
                {formik.errors.name}
              </Box>
            }
            value={formik?.values.name}
            onChange={handleChangeValue}
          />
        </FormControl>
        <FormControl>
          <MultipleFileUpload
            title={'Ảnh'}
            required
            helperText={
              <Box component={'span'} sx={helperTextStyle}>
                {formik.errors.images}
              </Box>
            }
            value={formik?.values?.images}
            onUploadChange={handleUploadResult}
          />
        </FormControl>
        <FormControl
          component={Grid2}
          container
          spacing={3}
          sx={{
            flexDirection: 'unset',
            '.MuiFormControl-root': {
              width: '100%',
            },
          }}>
          <Grid2 size={3}>
            <Input
              label='Giá giảm'
              name='discount.discountPrice'
              variant='filled'
              type='number'
              helperText={
                <Box component={'span'} sx={helperTextStyle}>
                  {formik?.errors?.discount?.discountPrice}
                </Box>
              }
              onChange={handleChangeValue}
              value={
                +formik?.values?.discount?.discountPrice > 0
                  ? formik?.values?.discount?.discountPrice
                  : ''
              }
              size='small'
              sx={{ width: '22%' }}
            />
          </Grid2>
          <Grid2 size={3}>
            <Input
              name='discount.startDate'
              type='date'
              onChange={handleChangeValue}
              value={formik?.values?.discount.startDate ?? ''}
              size='small'
              sx={{ width: '22%' }}
            />
          </Grid2>
          <Grid2 size={3}>
            <Input
              name='discount.endDate'
              type='date'
              onChange={handleChangeValue}
              value={formik?.values?.discount.endDate ?? ''}
              size='small'
              sx={{ width: '22%' }}
            />
          </Grid2>
        </FormControl>
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
          <InputLabel>Danh mục</InputLabel>
          <Select
            disableUnderline
            size='small'
            name='category'
            onChange={handleCategoryChange}
            value={formik?.values?.category}>
            {initData?.categories?.map((item) => (
              <MenuItem key={item._id} value={item?._id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            <Box component={'span'} sx={helperTextStyle}>
              {formik.errors?.category}
            </Box>
          </FormHelperText>
        </FormControl>
        <FormControl>
          <Autocomplete
            multiple
            fullWidth
            options={initData?.tags ?? []}
            disableCloseOnSelect
            value={tags}
            onChange={(e, val) => handleTagChange(e, val)}
            isOptionEqualToValue={(option, value) =>
              option?.value === value?.value
            }
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder='Tag ...'
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  bgcolor: '#fff',
                  color: 'red',
                  borderRadius: '10px',
                }}
              />
            )}
            size='small'
          />
          <FormHelperText>
            <Box component={'span'} sx={helperTextStyle}>
              {formik.errors?.tags}
            </Box>
          </FormHelperText>
        </FormControl>
        <FormControl>
          <Input
            id='brand'
            label='Hãng'
            name='brand'
            variant='filled'
            helperText={
              <Box component={'span'} sx={helperTextStyle}>
                {formik.errors.brand}
              </Box>
            }
            value={formik?.values.brand}
            onChange={handleChangeValue}
          />
        </FormControl>
        <FormControl>
          <Typography mb={1}>
            Nội dung {''}
            <Typography component={'span'} color='red'>
              *
            </Typography>
          </Typography>
          <CKEditor
            onChange={(value: string) => formik.setFieldValue('content', value)}
            value={formik.values.content ?? ''}
            helperText={formik?.errors?.content}
          />
        </FormControl>
        {attributes && (
          <FormControl>
            <Autocomplete
              multiple
              fullWidth
              options={TYPE_ATTRIBUTE ?? []}
              disableCloseOnSelect
              value={attributes}
              onChange={(e, val) => handleAttributeChange(e, val)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder='Phân loại ...'
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    bgcolor: '#fff',
                    color: 'red',
                    borderRadius: '10px',
                  }}
                />
              )}
              size='small'
            />
          </FormControl>
        )}
        <Box sx={{ textAlign: 'end' }}>
          <Button onClick={() => navigate('/product')} sx={{ mr: 2 }}>
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

export default ProductUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
