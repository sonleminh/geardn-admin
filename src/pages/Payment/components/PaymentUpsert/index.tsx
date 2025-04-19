// React and Router
import { ChangeEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Third-party Libraries
import { useFormik } from 'formik';
import { useQueryClient } from '@tanstack/react-query';

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControl,
  InputLabel,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';

import Input from '@/components/Input';
import ImageUpload from '@/components/ImageUpload';
import SuspenseLoader from '@/components/SuspenseLoader';

import { QueryKeys } from '@/constants/query-key';

import { useNotificationContext } from '@/contexts/NotificationContext';

import {
  useCreatePayment,
  useGetPaymentById,
  useUpdatePayment,
} from '@/services/payment';

import { createSchema, updateSchema } from '../utils/schema/categorySchema';
import { ROUTES } from '@/constants/route';

const PaymentUpsert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();

  const isEdit = !!id;

  const numericId = id ? Number(id) : undefined;

  const { data: paymentData } = useGetPaymentById(numericId as number);
  console.log('paymentData', paymentData);
  const { mutate: createPaymentMutate, isPending: isCreatePending } =
    useCreatePayment();
  const { mutate: updatePaymentMutate, isPending: isUpdatePending } =
    useUpdatePayment();
  const formik = useFormik({
    initialValues: {
      key: '',
      name: '',
      image: '',
      isDisabled: false,
    },
    // validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      if (isEdit) {
        updatePaymentMutate(
          { id: +id, ...values },
          {
            onSuccess() {
              queryClient.invalidateQueries({ queryKey: [QueryKeys.Payment] });
              showNotification('Cập nhật danh mục thành công', 'success');
              navigate('/payment');
            },
          }
        );
      } else {
        createPaymentMutate(values, {
          onSuccess() {
            queryClient.invalidateQueries({ queryKey: [QueryKeys.Payment] });
            showNotification('Tạo hình thức thanh toán thành công', 'success');
            navigate('/payment');
          },
        });
      }
    },
  });

  useEffect(() => {
    if (paymentData) {
      formik.setFieldValue('key', paymentData?.data?.key);
      formik.setFieldValue('name', paymentData?.data?.name);
      formik.setFieldValue('image', paymentData?.data?.image);
      formik.setFieldValue('isDisabled', paymentData?.data?.isDisabled);
    }
  }, [paymentData]);

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  const handleMethodImage = (result: string) => {
    formik.setFieldValue('image', result);
  };

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
            {isEdit ? 'Sửa hình thức thanh toán' : 'Thêm hình thức thanh toán'}
          </Typography>
        }
      />
      <Divider />

      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl>
          <Input
            id='key'
            label='Key'
            name='key'
            variant='filled'
            required
            helperText={
              <Box component={'span'} sx={helperTextStyle}>
                {formik.errors.key}
              </Box>
            }
            value={formik?.values.key}
            onChange={handleChangeValue}
          />
        </FormControl>
        <FormControl>
          <Input
            id='name'
            label='Tên'
            name='name'
            variant='filled'
            required
            helperText={
              <Box component={'span'} sx={helperTextStyle}>
                {formik?.errors?.name}
              </Box>
            }
            value={formik?.values?.name}
            onChange={handleChangeValue}
          />
        </FormControl>
        <ImageUpload
          title={'Ảnh:'}
          value={formik?.values?.image}
          onUploadChange={handleMethodImage}
        />
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InputLabel htmlFor='isDisabled' sx={{ cursor: 'pointer' }}>
            Vô hiệu hoá:
          </InputLabel>
          <Checkbox
            id='isDisabled'
            name='isDisabled'
            checked={formik?.values?.isDisabled ?? false}
            onChange={handleChangeValue}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        </Box>

        <Box sx={{ textAlign: 'end' }}>
          <Button onClick={() => navigate(ROUTES.PAYMENT)} sx={{ mr: 2 }}>
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

export default PaymentUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
