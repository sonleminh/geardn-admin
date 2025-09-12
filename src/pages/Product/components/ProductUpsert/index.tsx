import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import CKEditor from '@/components/CKEditor';
import Input from '@/components/Input';
import MultipleFileUpload from '@/components/MultipleImageUpload';
import SuspenseLoader from '@/components/SuspenseLoader';

import { QueryKeys } from '@/constants/query-key';
import { useAlertContext } from '@/contexts/AlertContext';
import { IProductPayload, ITagOptions } from '@/interfaces/IProduct';
import {
  useCreateProduct,
  useGetProductById,
  useGetProductInitial,
  useUpdateProduct,
} from '@/services/product';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid2,
  InputLabel,
  Link,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  SxProps,
  TextField,
  Theme,
  Typography,
} from '@mui/material';

import { ROUTES } from '@/constants/route';
import { useGetCategoryList } from '@/services/category';
import { useGetEnumByContext } from '@/services/enum';

interface FormValues {
  name: string;
  categoryId: string;
  tags: ITagOptions[];
  images: string[];
  brand: string;
  details: {
    guarantee: string;
    weight: string;
    material: string;
  };
  description: string;
  slug: string;
  status: string;
  isVisible: boolean;
}

const ProductUpsert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showAlert } = useAlertContext();
  const [tags, setTags] = useState<ITagOptions[]>([]);
  const [initialValues, setInitialValues] = useState<FormValues | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const isEdit = !!id;

  const { data: initData } = useGetProductInitial();
  const { data: productData } = useGetProductById(id ? +id : 0);
  const { data: categoryList } = useGetCategoryList();
  const { data: tagData } = useGetEnumByContext('product-tag');
  const { data: statusData } = useGetEnumByContext('product-status');

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
      slug: '',
      status: '',
      isVisible: true,
    } as FormValues,
    // validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      const { details, ...rest } = values;

      const isDetailsEmpty = Object.values(details).every((value) => !value);

      const payload: IProductPayload = {
        ...rest,
        ...(isDetailsEmpty ? {} : { details }),
        tags,
        categoryId: +values.categoryId,
      } as IProductPayload;

      if (isEdit) {
        updateProductMutate(
          { id: +id, ...payload },
          {
            onSuccess() {
              queryClient.invalidateQueries({ queryKey: [QueryKeys.Product] });
              showAlert('Cập nhật sản phẩm thành công', 'success');
              navigate('/product');
            },
          }
        );
      } else {
        createProductMutate(payload, {
          onSuccess() {
            queryClient.invalidateQueries({ queryKey: [QueryKeys.Product] });
            showAlert('Tạo sản phẩm thành công', 'success');
            navigate('/product');
          },
        });
      }
    },
  });

  // Function to check if form has changes
  const checkFormChanges = () => {
    if (!initialValues) return false;

    const currentValues = {
      ...formik.values,
      tags: tags,
    };

    // Deep comparison of form values
    const hasFormChanges =
      JSON.stringify(currentValues) !== JSON.stringify(initialValues);
    setHasChanges(hasFormChanges);
  };

  // Check for changes whenever form values or tags change
  useEffect(() => {
    checkFormChanges();
  }, [formik.values, tags]);

  useEffect(() => {
    if (productData) {
      const formValues: FormValues = {
        name: productData?.data?.name || '',
        categoryId: String(productData?.data?.categoryId || ''),
        tags: productData?.data?.tags || [],
        images: productData?.data?.images || [],
        brand: productData?.data?.brand || '',
        details: {
          guarantee: String(productData?.data?.details?.guarantee || ''),
          weight: productData?.data?.details?.weight || '',
          material: productData?.data?.details?.material || '',
        },
        description: productData?.data?.description || '',
        slug: productData?.data?.slug || '',
        status: productData?.data?.status || '',
        isVisible: productData?.data?.isVisible ?? true,
      };

      formik.setFieldValue('name', formValues.name);
      formik.setFieldValue('categoryId', formValues.categoryId);
      formik.setFieldValue('tags', formValues.tags);
      formik.setFieldValue('images', formValues.images);
      formik.setFieldValue('brand', formValues.brand);
      formik.setFieldValue('description', formValues.description);
      formik.setFieldValue('details.guarantee', formValues.details.guarantee);
      formik.setFieldValue('details.weight', formValues.details.weight);
      formik.setFieldValue('details.material', formValues.details.material);
      formik.setFieldValue('slug', formValues.slug);
      setTags(formValues.tags);
      formik.setFieldValue('status', formValues.status);
      formik.setFieldValue('isVisible', formValues.isVisible);

      // Set initial values for change tracking
      setInitialValues(formValues);
    } else if (!isEdit && initData) {
      // For new product, set initial values to current form values
      const formValues: FormValues = {
        ...formik.values,
        tags: tags,
      };
      setInitialValues(formValues);
    }
  }, [productData, initData]);

  // Set initial values for new products when component mounts
  useEffect(() => {
    if (!isEdit && !initialValues) {
      const defaultValues: FormValues = {
        ...formik.values,
        tags: tags,
      };
      setInitialValues(defaultValues);
    }
  }, [isEdit, initialValues, formik.values, tags]);

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
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formik.setFieldValue('isVisible', e.target.checked);
  };

  const handleUploadResult = (result: string[]) => {
    formik.setFieldValue('images', result);
  };

  return (
    <>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize='small' />}
        aria-label='breadcrumb'
        sx={{ mb: 3 }}>
        <Link
          underline='hover'
          color='inherit'
          onClick={() => navigate(ROUTES.DASHBOARD)}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <HomeOutlinedIcon sx={{ fontSize: 24 }} />
        </Link>
        <Link
          underline='hover'
          color='inherit'
          onClick={() => navigate(ROUTES.PRODUCT)}
          sx={{ cursor: 'pointer' }}>
          Sản phẩm
        </Link>
        <Typography color='text.primary'>
          {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        </Typography>
      </Breadcrumbs>

      <Typography sx={{ mb: 2, fontSize: 20, fontWeight: 600 }}>
        {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}:
      </Typography>

      <Grid2 container spacing={3}>
        <Grid2 size={6}>
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title='Thông tin chung'
              sx={{
                span: {
                  fontSize: 18,
                  fontWeight: 500,
                },
              }}
            />
            <Divider />
            <CardContent>
              <FormControl fullWidth margin='normal'>
                <Input
                  label='Tên sản phẩm'
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
              <FormControl fullWidth margin='normal'>
                <FormControl variant='filled' fullWidth>
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    disableUnderline
                    size='small'
                    name='categoryId'
                    onChange={handleSelectChange}
                    value={formik?.values?.categoryId}>
                    {categoryList?.data?.map((item) => (
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
              </FormControl>
              <FormControl fullWidth margin='normal'>
                <Typography mb={1}>
                  Ảnh:
                  <Typography component={'span'} color='red'>
                    *
                  </Typography>
                </Typography>
                <MultipleFileUpload
                  helperText={
                    <Box component={'span'} sx={helperTextStyle}>
                      {formik.errors.images}
                    </Box>
                  }
                  value={formik?.values?.images}
                  onUploadChange={handleUploadResult}
                />
              </FormControl>
              <FormControl fullWidth margin='normal'>
                <FormControl variant='filled' fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    disableUnderline
                    size='small'
                    name='status'
                    onChange={handleSelectChange}
                    value={formik?.values?.status}>
                    {statusData?.data?.map((item) => (
                      <MenuItem key={item.value} value={item?.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    <Box component={'span'} sx={helperTextStyle}>
                      {formik.errors?.status}
                    </Box>
                  </FormHelperText>
                </FormControl>
              </FormControl>
              <FormControl fullWidth margin='normal'>
                <Autocomplete
                  multiple
                  fullWidth
                  options={tagData?.data ?? []}
                  disableCloseOnSelect
                  value={tags}
                  onChange={(
                    e: React.ChangeEvent<unknown>,
                    val: ITagOptions[]
                  ) => handleTagChange(e, val)}
                  isOptionEqualToValue={(
                    option: ITagOptions,
                    value: ITagOptions
                  ) => option?.value === value?.value}
                  renderInput={(params: AutocompleteRenderInputParams) => (
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
                    {Array.isArray(formik.errors?.tags)
                      ? formik.errors.tags.join(', ')
                      : formik.errors?.tags}
                  </Box>
                </FormHelperText>
              </FormControl>
              <FormControl fullWidth margin='normal'>
                <Box sx={{ textAlign: 'start' }}>
                  <FormControlLabel
                    value={formik?.values?.isVisible}
                    control={
                      <Switch
                        color='primary'
                        checked={formik?.values?.isVisible}
                        onChange={handleSwitchChange}
                      />
                    }
                    label='Hiển thị:'
                    labelPlacement='start'
                    sx={{ ml: 0 }}
                  />
                </Box>
              </FormControl>
              <FormControl fullWidth margin='normal'>
                <Typography mb={1}>
                  Mô tả:
                  <Typography component={'span'} color='red'>
                    *
                  </Typography>
                </Typography>
                <CKEditor
                  onChange={(value: string) =>
                    formik.setFieldValue('description', value)
                  }
                  value={formik.values.description ?? ''}
                  helperText={formik?.errors?.description}
                />
              </FormControl>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={6}>
          <Card>
            <CardHeader
              title='Thông tin chi tiết'
              sx={{
                span: {
                  fontSize: 18,
                  fontWeight: 500,
                },
              }}
            />
            <Divider />
            <CardContent>
              <FormControl fullWidth margin='normal'>
                <Input
                  label='Hãng'
                  name='brand'
                  variant='filled'
                  size='small'
                  value={formik?.values.brand}
                  onChange={handleChangeValue}
                />
              </FormControl>
              <FormControl fullWidth margin='normal'>
                <Input
                  label='Bảo hành'
                  name='details.guarantee'
                  variant='filled'
                  size='small'
                  value={formik?.values.details.guarantee}
                  onChange={handleChangeValue}
                />
              </FormControl>
              <FormControl fullWidth margin='normal'>
                <Input
                  label='Trọng lượng'
                  name='details.weight'
                  variant='filled'
                  size='small'
                  value={formik?.values.details.weight}
                  onChange={handleChangeValue}
                />
              </FormControl>
              <FormControl fullWidth margin='normal'>
                <Input
                  label='Chất liệu'
                  name='details.material'
                  variant='filled'
                  size='small'
                  value={formik?.values.details.material}
                  onChange={handleChangeValue}
                />
              </FormControl>
              <FormControl fullWidth margin='normal'>
                <Input
                  label='Slug'
                  name='slug'
                  variant='filled'
                  size='small'
                  disabled
                  value={formik?.values?.slug}
                />
              </FormControl>
            </CardContent>
          </Card>
        </Grid2>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            mt: 2,
          }}>
          <Button onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            Trở lại
          </Button>
          <Button
            variant='contained'
            onClick={() => formik.handleSubmit()}
            disabled={!hasChanges}
            sx={{ minWidth: 100 }}>
            Lưu
          </Button>
        </Box>
      </Grid2>
      {(isCreatePending || isUpdatePending) && <SuspenseLoader />}
    </>
  );
};

export default ProductUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
