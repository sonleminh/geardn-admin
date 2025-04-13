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
  useCreateAttributeType,
  useGetAttributeTypeById,
  useUpdateAttributeType,
} from '@/services/attribute-type';

import { createSchema, updateSchema } from '../utils/schema/attributeSchema';

const AttributeTypeUpsert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();

  const isEdit = !!id;

  const { data: attributeTypeData } = useGetAttributeTypeById(id as string);

  const { mutate: createAttributeTypeMutate, isPending: isCreatePending } =
    useCreateAttributeType();
  const { mutate: updateAttributeTypeMutate, isPending: isUpdatePending } =
    useUpdateAttributeType();
  const formik = useFormik({
    initialValues: {
      name: '',
      label: '',
    },
    validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      if (isEdit) {
        updateAttributeTypeMutate(
          { id: +id, ...values },
          {
            onSuccess() {
              queryClient.invalidateQueries({
                queryKey: [QueryKeys.AttributeType],
              });
              showNotification(
                'Cập nhật loại thuộc tính thành công',
                'success'
              );
              navigate(ROUTES.ATTRIBUTE_TYPE);
            },
          }
        );
      } else {
        createAttributeTypeMutate(values, {
          onSuccess() {
            queryClient.invalidateQueries({
              queryKey: [QueryKeys.AttributeType],
            });
            showNotification('Tạo loại thuộc tính thành công', 'success');
            navigate(ROUTES.ATTRIBUTE_TYPE);
          },
        });
      }
    },
  });

  useEffect(() => {
    if (attributeTypeData) {
      formik.setFieldValue('name', attributeTypeData?.name);
      formik.setFieldValue('label', attributeTypeData?.label);
    }
  }, [attributeTypeData]);

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
          <Button
            onClick={() => navigate(ROUTES.ATTRIBUTE_TYPE)}
            sx={{ mr: 2 }}>
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

export default AttributeTypeUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
