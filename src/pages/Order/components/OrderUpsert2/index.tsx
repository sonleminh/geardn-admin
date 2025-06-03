import axios, { AxiosError } from 'axios';
import { useFormik } from 'formik';
import moment from 'moment';
import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormControlLabel,
  Grid2,
  Link,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useQueryClient } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/AuthContext';
import { useNotificationContext } from '@/contexts/NotificationContext';

import {
  useCreateOrder,
  useGetOrderById,
  useUpdateOrder,
} from '@/services/order';
import { useGetPaymentById } from '@/services/payment';

import { QueryKeys } from '@/constants/query-key';

import { IOrderItem } from '@/interfaces/IOrder';

import { createSchema, updateSchema } from '../utils/schema/orderSchema';

import SuspenseLoader from '@/components/SuspenseLoader';
import CustomerForm from './components/CustomerForm';
// import ProductSelector from './components/ProductSelector';
import ShipmentForm from './components/ShipmentForm';
import { ROUTES } from '@/constants/route';

const OrderUpsert = () => {
  const { id } = useParams();
  const isEdit = !!id;

  const { user } = useAuthContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [orderItems, setOrderItems] = useState<IOrderItem[]>([]);

  const [city, setCity] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [ward, setWard] = useState<string>('');
  const [detailAddress, setDetailAddress] = useState<string>('');
  const [shopAddress, setShopAddress] = useState<string>('');

  const { data: orderData } = useGetOrderById(id as string);
  const { data: payment } = useGetPaymentById('673c8947d6a67118f380f4ab');

  const { mutate: createOrderMutate, isPending: isCreatePending } =
    useCreateOrder();
  const { mutate: updateOrderMutate, isPending: isUpdatePending } =
    useUpdateOrder();

  const formik = useFormik({
    initialValues: {
      customer: {
        name: '',
        phone: '',
        mail: '',
      },
      shipment: {
        method: 1,
        delivery_date: isEdit ? null : moment(),
      },
      payment: {
        method: '673c8947d6a67118f380f4ab',
      },
      flag: {
        is_online_order: false,
      },
      note: '',
    },
    validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      const payload = {
        ...values,
        user: user?._id,
        items: orderItems,
        shipment: {
          ...values?.shipment,
          address:
            values?.shipment?.method === 1
              ? `${detailAddress}, ${ward}, ${district}, ${city}`
              : shopAddress,
        },
      };
      if (!orderItems?.length) {
        return showNotification(
          'Không có sản phẩm nào để tạo đơn hàng',
          'error'
        );
      }
      if (
        (values?.shipment?.method === 1 && !ward && !detailAddress) ||
        (values?.shipment?.method === 2 && !shopAddress)
      ) {
        return showNotification('Vui lòng chọn địa chỉ nhận hàng', 'error');
      }
      if (isEdit) {
        updateOrderMutate(
          { _id: id, ...payload },
          {
            onSuccess() {
              queryClient.invalidateQueries({
                queryKey: [QueryKeys.Order],
              });
              showNotification('Cập nhật đơn hàng thành công', 'success');
              navigate(-1);
            },
            onError: (err: Error | AxiosError) => {
              if (axios.isAxiosError(err)) {
                showNotification(err.response?.data?.message, 'error');
              } else {
                showNotification(err.message, 'error');
              }
            },
          }
        );
      } else {
        createOrderMutate(payload, {
          onSuccess() {
            queryClient.invalidateQueries({ queryKey: [QueryKeys.Order] });
            showNotification('Tạo đơn hàng thành công', 'success');
            navigate(-1);
          },
          onError: (err: Error | AxiosError) => {
            if (axios.isAxiosError(err)) {
              showNotification(err.response?.data?.message, 'error');
            } else {
              showNotification(err.message, 'error');
            }
          },
        });
      }
    },
  });

  useEffect(() => {
    if (orderData) {
      formik.setFieldValue('customer.name', orderData?.customer?.name);
      formik.setFieldValue('customer.phone', orderData?.customer?.phone);
      formik.setFieldValue('customer.mail', orderData?.customer?.mail);

      if (orderData?.shipment?.method === 1) {
        const addressArr = orderData?.shipment?.address?.split(', ');
        setCity(addressArr[3]);
        setDistrict(addressArr[2]);
        setWard(addressArr[1]);
        setDetailAddress(addressArr[0]);
      } else {
        setShopAddress(orderData?.shipment?.address);
      }

      formik.setFieldValue('shipment.method', orderData?.shipment?.method);
      formik.setFieldValue(
        'shipment.delivery_date',
        orderData?.shipment?.delivery_date
      );
      formik.setFieldValue('note', orderData?.note);
      setOrderItems(orderData?.items);
    }
  }, [orderData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize='small' />}
        aria-label='breadcrumb'
        sx={{ mb: 2 }}>
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
          onClick={() => navigate(ROUTES.ORDER)}
          sx={{ cursor: 'pointer' }}>
          Đơn hàng
        </Link>
        <Typography color='text.primary'>
          {isEdit ? 'Chỉnh sửa đơn hàng' : 'Thêm đơn hàng mới'}
        </Typography>
      </Breadcrumbs>
      <Typography sx={{ mb: 2, fontSize: 20, fontWeight: 600 }}>
        {isEdit ? 'Chỉnh sửa đơn hàng' : 'Thêm đơn hàng mới'}:
      </Typography>
      <Divider />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography mb={1}>Thông tin:</Typography>
        <CustomerForm
          values={formik?.values.customer}
          errors={formik?.errors.customer || {}}
          handleChange={handleChange}
        />
        <ShipmentForm
          formik={formik}
          city={city}
          district={district}
          ward={ward}
          shopAddress={shopAddress}
          detailAddress={detailAddress}
          setCity={setCity}
          setDistrict={setDistrict}
          setWard={setWard}
          setDetailAddress={setDetailAddress}
          setShopAddress={setShopAddress}
          handleChange={handleChange}
        />
        <Grid2 mb={4} container rowSpacing={2} columnSpacing={4}>
          <Grid2 size={6}>
            <FormControl>
              <Typography sx={{ mb: 2, fontWeight: 600 }}>
                Phương thức thanh toán
              </Typography>
              <RadioGroup
                name='payment.method'
                onChange={handleChange}
                value={formik?.values?.payment?.method}>
                <FormControlLabel
                  value={payment?.id}
                  control={<Radio size='small' />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <img
                        src={payment?.image ?? ''}
                        alt=''
                        style={{
                          width: '100%',
                          maxWidth: '36px',
                          height: '36px',
                          objectFit: 'contain',
                        }}
                      />
                      <Typography sx={{ ml: 1, fontSize: 14 }}>
                        {payment?.name}
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
              <>{formik?.errors?.payment?.method}</>
            </FormControl>
          </Grid2>
          <Grid2 size={6} />
          {/* <ProductSelector
            isEdit={isEdit}
            orderData={orderData}
            orderItems={orderItems}
            setOrderItems={setOrderItems}
          /> */}
        </Grid2>
        <Box sx={{ textAlign: 'end' }}>
          <Button
            sx={{ mr: 2 }}
            variant='contained'
            onClick={() => formik.handleSubmit()}>
            {isEdit ? 'Lưu' : 'Thêm'}
          </Button>
          <Button onClick={() => navigate(ROUTES.ORDER)}>Trở lại</Button>
        </Box>
      </Box>
      {(isCreatePending || isUpdatePending) && <SuspenseLoader />}
    </Box>
  );
};

export default OrderUpsert;
