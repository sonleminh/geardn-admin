import { ChangeEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';

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

import { QueryKeys } from '@/constants/query-key';
import { ROUTES } from '@/constants/route';

import Input from '@/components/Input';
import SuspenseLoader from '@/components/SuspenseLoader';

import { useNotificationContext } from '@/contexts/NotificationContext';

import {
  useCreateAttribute,
  useGetAttributeById,
  useUpdateAttribute,
} from '@/services/attribute';

import { createSchema, updateSchema } from '../utils/schema/attributeSchema';

const AttributeUpsert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();

  const isEdit = !!id;

  const { data: AttributeData } = useGetAttributeById(id as string);

  const { mutate: createAttributeMutate, isPending: isCreatePending } =
    useCreateAttribute();
  const { mutate: updateAttributeMutate, isPending: isUpdatePending } =
    useUpdateAttribute();
  const formik = useFormik({
    initialValues: {
      name: '',
      label: '',
    },
    validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      if (isEdit) {
        updateAttributeMutate(
          { id: +id, ...values },
          {
            onSuccess() {
              queryClient.invalidateQueries({
                queryKey: [QueryKeys.Attribute],
              });
              showNotification(
                'Cập nhật loại thuộc tính thành công',
                'success'
              );
              navigate(ROUTES.ATTRIBUTE);
            },
          }
        );
      } else {
        createAttributeMutate(values, {
          onSuccess() {
            queryClient.invalidateQueries({
              queryKey: [QueryKeys.Attribute],
            });
            showNotification('Tạo loại thuộc tính thành công', 'success');
            navigate(ROUTES.ATTRIBUTE);
          },
        });
      }
    },
  });

  useEffect(() => {
    if (AttributeData) {
      formik.setFieldValue('name', AttributeData?.name);
      formik.setFieldValue('label', AttributeData?.label);
    }
  }, [AttributeData]);

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
            {isEdit ? 'Sửa loại thuộc tính' : 'Thêm loại thuộc tính'}
          </Typography>
        }
      />
      <Divider />

      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl>
          <Input
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
          <Input
            label='Nhãn'
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
          <Button onClick={() => navigate(ROUTES.ATTRIBUTE)} sx={{ mr: 2 }}>
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

export default AttributeUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
