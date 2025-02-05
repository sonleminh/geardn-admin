import { ChangeEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Input from '@/components/Input';
import SuspenseLoader from '@/components/SuspenseLoader';

import { QueryKeys } from '@/constants/query-key';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';

import {
  useCreateCategory,
  useGetCategoryById,
  useUpdateCategory,
} from '@/services/category';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import { createSchema, updateSchema } from '../utils/schema/categorySchema';
import ImageUpload from '@/components/ImageUpload';

const CategoryUpsert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();

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
              showNotification('Cập nhật danh mục thành công', 'success');
              navigate('/category');
            },
          }
        );
      } else {
        createCategoryMutate(values, {
          onSuccess() {
            queryClient.invalidateQueries({ queryKey: [QueryKeys.Category] });
            showNotification('Tạo danh mục thành công', 'success');
            navigate('/category');
          },
        });
      }
    },
  });

  useEffect(() => {
    if (categoryData) {
      formik.setFieldValue('name', categoryData?.name);
      formik.setFieldValue('icon', categoryData?.icon);
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
            <Typography>{categoryData?.slug}</Typography>
          </Box>
        )}
        <Box sx={{ textAlign: 'end' }}>
          <Button onClick={() => navigate('/category')} sx={{ mr: 2 }}>
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

export default CategoryUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
