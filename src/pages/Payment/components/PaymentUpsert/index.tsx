import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Input from '@/components/Input';
import SuspenseLoader from '@/components/SuspenseLoader';

import { QueryKeys } from '@/constants/query-key';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';

import {
  useCreatePayment,
  useGetPaymentById,
  useUpdatePayment,
} from '@/services/payment';
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
import ImageUpload from '@/components/ImageUpload';
// import { createSchema, updateSchema } from '../utils/schema/PaymentSchema';

const PaymentUpsert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();

  const isEdit = !!id;

  const [optionImage, setOptionImage] = useState<string>('');

  const { data: PaymentData } = useGetPaymentById(id as string);

  const { mutate: createPaymentMutate, isPending: isCreatePending } =
    useCreatePayment();
  const { mutate: updatePaymentMutate, isPending: isUpdatePending } =
    useUpdatePayment();
  const formik = useFormik({
    initialValues: {
      name: '',
      image: '',
      display_name: '',
    },
    // validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      // if (isEdit) {
      //   updatePaymentMutate(
      //     { _id: id, ...values },
      //     {
      //       onSuccess() {
      //         queryClient.invalidateQueries({ queryKey: [QueryKeys.Payment] });
      //         showNotification('Cập nhật danh mục thành công', 'success');
      //         navigate('/Payment');
      //       },
      //     }
      //   );
      // } else {
      //   createPaymentMutate(values, {
      //     onSuccess() {
      //       queryClient.invalidateQueries({ queryKey: [QueryKeys.Payment] });
      //       showNotification('Tạo danh mục thành công', 'success');
      //       navigate('/Payment');
      //     },
      //   });
      // }
    },
  });

  useEffect(() => {
    if (PaymentData) {
      formik.setFieldValue('name', PaymentData?.name);
    }
  }, [PaymentData]);

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  const handleOptionImageUpload = (result: string) => {
    setOptionImage(result);
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
          <Input
            id='display_name'
            label='Tên hiển thị'
            name='display_name'
            variant='filled'
            required
            helperText={
              <Box component={'span'} sx={helperTextStyle}>
                {formik.errors.display_name}
              </Box>
            }
            value={formik?.values.display_name}
            onChange={handleChangeValue}
          />
        </FormControl>
        <ImageUpload
          title={'Ảnh:'}
          value={optionImage}
          onUploadChange={handleOptionImageUpload}
        />
        <Box sx={{ textAlign: 'end' }}>
          <Button onClick={() => navigate('/Payment')} sx={{ mr: 2 }}>
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
