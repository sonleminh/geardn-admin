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

const CategoryUpsert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();

  const isEdit = !!id;

  const { data: categoryData } = useGetCategoryById(id as string);

  const { mutate: createCategoryMutate, isPending: isCreatePending } =
    useCreateCategory();
  const { mutate: updateCategoryMutate, isPending: isUpdatePending } =
    useUpdateCategory();
  const formik = useFormik({
    initialValues: {
      value: '',
      label: '',
    },
    // validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      const payload = {
        value: values.value,
        label: values.label,
      };
      if (isEdit) {
        updateCategoryMutate(
          { _id: id, ...payload },
          {
            onSuccess() {
              queryClient.invalidateQueries({ queryKey: [QueryKeys.Category] });
              showNotification('Cập nhật danh mục thành công', 'success');
              navigate('/category');
            },
          }
        );
      } else {
        createCategoryMutate(payload, {
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
      formik.setFieldValue('value', categoryData?.value);
      formik.setFieldValue('label', categoryData?.label);
    }
  }, [categoryData]);

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Typography variant='h5' sx={{ fontWeight: 600 }}>
            {isEdit ? 'Sửa danh mục' : 'Thêm danh mục'}
          </Typography>
        }
      />
      <Divider />

      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl>
          <Input
            id='value'
            label='Giá trị'
            name='value'
            variant='filled'
            required
            helperText={
              <Box component={'span'} sx={helperTextStyle}>
                {formik.errors.value}
              </Box>
            }
            value={formik?.values.value}
            onChange={handleChangeValue}
          />
        </FormControl>
        <FormControl>
          <Input
            id='label'
            label='Tên'
            name='label'
            variant='filled'
            required
            helperText={
              <Box component={'span'} sx={helperTextStyle}>
                {formik.errors.label}
              </Box>
            }
            value={formik?.values.label}
            onChange={handleChangeValue}
          />
        </FormControl>

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
