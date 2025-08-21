import { ChangeEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Input from '@/components/Input';
import SuspenseLoader from '@/components/SuspenseLoader';

import { QueryKeys } from '@/constants/query-key';
import { useAlertContext } from '@/contexts/AlertContext';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';

import {
  useCreateCategory,
  useGetCategoryById,
  useUpdateCategory,
} from '@/services/category';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  Link,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { createSchema, updateSchema } from '../utils/schema/categorySchema';
import ImageUpload from '@/components/ImageUpload';
import { ROUTES } from '@/constants/route';

const CategoryUpsert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showAlert } = useAlertContext();

  const isEdit = !!id;

  const numericId = id ? Number(id) : undefined;

  const { data: categoryData } = useGetCategoryById(numericId as number);

  const { mutate: createCategoryMutate, isPending: isCreatePending } =
    useCreateCategory();
  const { mutate: updateCategoryMutate, isPending: isUpdatePending } =
    useUpdateCategory();
  const formik = useFormik({
    initialValues: {
      name: '',
      icon: '',
    },
    validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      if (isEdit) {
        updateCategoryMutate(
          { id: +id, ...values },
          {
            onSuccess() {
              queryClient.invalidateQueries({ queryKey: [QueryKeys.Category] });
              showAlert('Cập nhật danh mục thành công', 'success');
              navigate('/category');
            },
          }
        );
      } else {
        createCategoryMutate(values, {
          onSuccess() {
            queryClient.invalidateQueries({ queryKey: [QueryKeys.Category] });
            showAlert('Tạo danh mục thành công', 'success');
            navigate('/category');
          },
        });
      }
    },
  });

  useEffect(() => {
    if (categoryData) {
      formik.setFieldValue('name', categoryData?.data?.name);
      formik.setFieldValue('icon', categoryData?.data?.icon);
    }
  }, [categoryData]);

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  const handleIconImage = (result: string) => {
    formik.setFieldValue('icon', result);
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
          onClick={() => navigate(ROUTES.CATEGORY)}
          sx={{ cursor: 'pointer' }}>
          Danh mục
        </Link>
        <Typography color='text.primary'>
          {isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        </Typography>
      </Breadcrumbs>
      <Card sx={{ mt: 3, borderRadius: 2 }}>
        <CardHeader
          title={
            <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
              {isEdit ? 'Sửa danh mục' : 'Thêm danh mục'}
            </Typography>
          }
        />
        <Divider />

        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl>
            <Input
              id='name'
              label='Tên danh mục'
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
          <ImageUpload
            title={'Ảnh icon:'}
            value={formik?.values?.icon}
            onUploadChange={handleIconImage}
          />
          {isEdit && categoryData && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ mr: 1 }}>Slug:</Typography>
              <Typography>{categoryData?.data?.slug}</Typography>
            </Box>
          )}
          <Box sx={{ textAlign: 'end' }}>
            <Button onClick={() => navigate(ROUTES.CATEGORY)} sx={{ mr: 2 }}>
              Trở lại
            </Button>
            <Button variant='contained' onClick={() => formik.handleSubmit()}>
              Thêm
            </Button>
          </Box>
        </CardContent>
        {(isCreatePending || isUpdatePending) && <SuspenseLoader />}
      </Card>
    </>
  );
};

export default CategoryUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
