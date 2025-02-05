import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import CKEditor from '@/components/CKEditor';
import Input from '@/components/Input';
import MultipleFileUpload from '@/components/MultipleImageUpload';
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
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
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

type DetailKey = 'guarantee' | 'weight' | 'material';

interface IVariant {
  name: string;
  options: string[];
  images?: string[];
}

const ProductUpsert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  // const [attributes, setAttributes] = useState<string[]>([]);
  const [tags, setTags] = useState<ITagOptions[]>([]);
  const [showDetailForm, setShowDetailForm] = useState<boolean>(false);
  const [variants, setVariants] = useState<IVariant[]>([]);

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
      categoryId: '',
      tags: [],
      images: [],
      brand: '',
      details: {
        guarantee: '',
        weight: '',
        material: '',
      },
      description: '',
    },
    // validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      const details = { ...values.details };
      (Object.keys(details) as DetailKey[]).forEach((key) => {
        if (details[key] === '') {
          delete details[key];
        }
      });

      const payload: IProductPayload = {
        ...values,
        tags: tags,
        tier_variations: variants,
        categoryId: +values.categoryId,
      };
      // if (Object.keys(details).length > 0) {
      //   payload.details = details;
      // }
      if (isEdit) {
        updateProductMutate(
          { id: +id, ...payload },
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
      formik.setFieldValue('name', productData?.name);
      formik.setFieldValue('categoryId', productData?.categoryId);
      formik.setFieldValue('tags', productData?.tags);
      formik.setFieldValue('images', productData?.images);
      formik.setFieldValue('brand', productData?.brand);
      formik.setFieldValue('description', productData?.description);
      setTags(productData?.tags);
      setVariants(productData?.tier_variations);
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

  const handleSelectChange = (e: SelectChangeEvent<unknown>) => {
    formik.setFieldValue('categoryId', e.target.value);
  };

  const handleUploadResult = (result: string[]) => {
    formik.setFieldValue('images', result);
  };
  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
            {isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
          </Typography>
        }
      />
      <Divider />

      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Grid2 container rowSpacing={2} columnSpacing={4}>
          <Grid2 size={12}>
            <FormControl fullWidth>
              <Input
                label='Tên'
                name='name'
                variant='filled'
                size='small'
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
              <InputLabel>Danh mục</InputLabel>
              <Select
                disableUnderline
                size='small'
                name='categoryId'
                onChange={handleSelectChange}
                value={formik?.values?.categoryId}>
                {initData?.categories?.map((item) => (
                  <MenuItem key={item.id} value={item?.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                <Box component={'span'} sx={helperTextStyle}>
                  {formik.errors?.categoryId}
                </Box>
              </FormHelperText>
            </FormControl>
          </Grid2>

          <Grid2 size={6}>
            <FormControl fullWidth>
              <Autocomplete
                multiple
                fullWidth
                options={initData?.tags ?? []}
                disableCloseOnSelect
                // value={tags}
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
          </Grid2>

          <Grid2 size={6}>
            <FormControl fullWidth>
              <Input
                label='Hãng'
                name='brand'
                variant='filled'
                size='small'
                helperText={
                  <Box component={'span'} sx={helperTextStyle}>
                    {formik.errors.brand}
                  </Box>
                }
                value={formik?.values.brand}
                onChange={handleChangeValue}
              />
            </FormControl>
          </Grid2>
        </Grid2>
        <Box sx={{ display: 'flex' }}>
          <Typography sx={{ width: 80, mr: 2 }}>Chi tiết:</Typography>
          <Button
            variant={showDetailForm ? 'outlined' : 'contained'}
            size='small'
            onClick={() => setShowDetailForm(!showDetailForm)}>
            {showDetailForm ? <RemoveIcon /> : <AddIcon />}
          </Button>
        </Box>
        {showDetailForm && (
          <FormControl>
            <Grid2 container spacing={4}>
              <Grid2>
                <Input
                  label='Thời gian bảo hành'
                  name='details.guarantee'
                  variant='filled'
                  size='small'
                  fullWidth
                  helperText={
                    <Box component={'span'} sx={helperTextStyle}>
                      {formik?.errors?.details?.guarantee}
                    </Box>
                  }
                  value={formik?.values?.details.guarantee}
                  onChange={handleChangeValue}
                />
              </Grid2>
              <Grid2 size={3}>
                <Input
                  label='Trọng lượng'
                  name='details.weight'
                  variant='filled'
                  size='small'
                  fullWidth
                  helperText={
                    <Box component={'span'} sx={helperTextStyle}>
                      {formik?.errors?.details?.weight}
                    </Box>
                  }
                  value={formik?.values?.details?.weight}
                  onChange={handleChangeValue}
                />
              </Grid2>
              <Grid2 size={3}>
                <Input
                  label='Chất liệu'
                  name='details.material'
                  variant='filled'
                  size='small'
                  fullWidth
                  helperText={
                    <Box component={'span'} sx={helperTextStyle}>
                      {formik?.errors?.details?.material}
                    </Box>
                  }
                  value={formik?.values?.details?.material}
                  onChange={handleChangeValue}
                />
              </Grid2>
            </Grid2>
          </FormControl>
        )}
        <FormControl>
          <MultipleFileUpload
            title={'Ảnh:'}
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
        <FormControl>
          <Typography mb={1}>Mô tả:</Typography>
          <CKEditor
            onChange={(value: string) =>
              formik.setFieldValue('description', value)
            }
            value={formik.values.description ?? ''}
            helperText={formik?.errors?.description}
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
