import { ChangeEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useFormik } from 'formik';
import { useQueryClient } from '@tanstack/react-query';

import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControl,
  InputLabel,
  Link,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

import Input from '@/components/Input';
import ImageUpload from '@/components/ImageUpload';
import SuspenseLoader from '@/components/SuspenseLoader';

import { QueryKeys } from '@/constants/query-key';

import { useAlertContext } from '@/contexts/AlertContext';

import {
  useCreatePayment,
  useGetPaymentById,
  useUpdatePayment,
} from '@/services/payment';

import { ROUTES } from '@/constants/route';

const PaymentUpsert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showAlert } = useAlertContext();

  const isEdit = !!id;

  const numericId = id ? Number(id) : undefined;

  const { data: paymentData } = useGetPaymentById(numericId as number);
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
              showAlert('Cập nhật danh mục thành công', 'success');
              navigate('/payment');
            },
          }
        );
      } else {
        createPaymentMutate(values, {
          onSuccess() {
            queryClient.invalidateQueries({ queryKey: [QueryKeys.Payment] });
            showAlert('Tạo hình thức thanh toán thành công', 'success');
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
          onClick={() => navigate(ROUTES.PAYMENT)}
          sx={{ cursor: 'pointer' }}>
          Phương thức thanh toán
        </Link>
        <Typography color='text.primary'>
          {isEdit
            ? 'Chỉnh sửa phương thức thanh toán'
            : 'Thêm phương thức thanh toán mới'}
        </Typography>
      </Breadcrumbs>
      <Card sx={{ mt: 3, borderRadius: 2 }}>
        <CardHeader
          title={
            <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
              {isEdit
                ? 'Sửa hình thức thanh toán'
                : 'Thêm hình thức thanh toán'}
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
    </>
  );
};

export default PaymentUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
