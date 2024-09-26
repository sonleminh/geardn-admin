import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import SuspenseLoader from '@/components/SuspenseLoader';
import CKEditor from '@/components/CKEditor';
import Upload from '@/components/Upload';
import Input from '@/components/Input';

import { useNotificationContext } from '@/contexts/NotificationContext';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/constants/query-key';
import {
  useCreateProduct,
  useGetProductById,
  useGetProductInitial,
  useUpdateProduct,
} from '@/services/product';
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
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  SxProps,
  TextField,
  Theme,
  Typography,
} from '@mui/material';
import { ITagOptions } from '@/interfaces/IProduct';
import { createSchema, updateSchema } from '../utils/schema/productSchema';
import { formatDateToIOS, formatDateToNormal } from '@/utils/formatDate';
import MultipleFileUpload from '@/components/MultipleFileUpload';

const ProductUpsert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [categoryId, setCategoryId] = useState<string>('');
  const [tags, setTags] = useState<ITagOptions[]>([]);

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
      price: '',
      discount: {
        discountPrice: '',
        startDate: '',
        endDate: '',
      },
      tags: [],
      category_id: '',
      content: '',
      images: undefined,
      images_edit: undefined,
    },
    // validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      console.log(values);
      const payload = {
        ...values,
        discount: {
          discountPrice: Number(values.discount.discountPrice),
          startDate: formatDateToIOS(values.discount.startDate),
          endDate: formatDateToIOS(values.discount.endDate),
        },
        price: Number(values.price),
        category_id: categoryId,
        tags: tags,
      };
      if (isEdit) {
        updateProductMutate(
          { _id: id, ...payload },
          {
            onSuccess() {
              queryClient.invalidateQueries({ queryKey: [QueryKeys.Product] });
              showNotification('Cập nhật sản phẩm thành công', 'success');
              // navigate('/product');
            },
          }
        );
      } else {
        createProductMutate(payload, {
          onSuccess() {
            queryClient.invalidateQueries({ queryKey: [QueryKeys.Product] });
            showNotification('Tạo sản phẩm thành công', 'success');
            // navigate('/product');
          },
        });
      }
    },
  });

  useEffect(() => {
    if (productData) {
      formik.setFieldValue('name', productData?.name);
      formik.setFieldValue('price', productData?.price);
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
      formik.setFieldValue('category_id', productData?.category_id);
      formik.setFieldValue('tags', productData?.tags);
      formik.setFieldValue('content', productData?.content);
      formik.setFieldValue('images_edit', productData?.images[0]);
      setCategoryId(productData?.category_id);
      setTags(productData?.tags);
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

  const handleCategoryChange = (e: SelectChangeEvent<unknown>) => {
    setCategoryId(e.target.value as string);
    formik.setFieldValue('category_id', e.target.value as string);
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
            value={formik?.values.images ?? formik.values.images_edit}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              formik.setFieldValue('images', e.target.files);
            }}
          />
        </FormControl>
        <FormControl
          sx={{
            display: 'flex',
            flexDirection: 'unset',
            justifyContent: 'space-between',
          }}>
          <Input
            id='price'
            label='Giá'
            name='price'
            variant='filled'
            type='number'
            required
            helperText={
              <Box component={'span'} sx={helperTextStyle}>
                {formik.errors.price}
              </Box>
            }
            onChange={handleChangeValue}
            value={formik?.values.price}
            size='small'
            sx={{ width: '22%' }}
          />
          <Input
            label='Giá giảm'
            name='discount.discountPrice'
            variant='filled'
            type='number'
            required
            helperText={
              <Box component={'span'} sx={helperTextStyle}>
                {formik?.errors?.discount?.discountPrice}
              </Box>
            }
            onChange={handleChangeValue}
            value={formik?.values.discount.discountPrice}
            size='small'
            sx={{ width: '22%' }}
          />
          <Input
            name='discount.startDate'
            type='date'
            onChange={handleChangeValue}
            value={formik?.values?.discount.startDate ?? ''}
            size='small'
            sx={{ width: '22%' }}
          />
          <Input
            name='discount.endDate'
            type='date'
            onChange={handleChangeValue}
            value={formik?.values?.discount.endDate ?? ''}
            size='small'
            sx={{ width: '22%' }}
          />
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
          <InputLabel id='demo-simple-select-label'>Danh mục</InputLabel>
          <Select
            disableUnderline
            size='small'
            name='category_id'
            onChange={handleCategoryChange}
            value={formik?.values?.category_id}>
            {initData?.categories?.map((item: any) => (
              <MenuItem key={item.label} value={item?._id}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            <Box component={'span'} sx={helperTextStyle}>
              {formik.errors?.category_id}
            </Box>
          </FormHelperText>
        </FormControl>
        <FormControl>
          <Autocomplete
            multiple
            fullWidth
            id='checkboxes-tags-demo'
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
