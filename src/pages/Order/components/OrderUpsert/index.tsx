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

import {
  ICreateOrder,
  ICreateOrderItem,
  IOrderItem,
} from '@/interfaces/IOrder';

import { createSchema, updateSchema } from '../utils/schema/orderSchema';

import SuspenseLoader from '@/components/SuspenseLoader';
import CustomerForm from './components/CustomerForm';
// import ProductSelector from './components/ProductSelector';
import ShipmentForm from './components/ShipmentForm';
import { ROUTES } from '@/constants/route';
import ProductSelector from './components/ProductSelector';
import { useGetCategoryList } from '@/services/category';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

const OrderUpsert = () => {
  const { id } = useParams();
  const isEdit = !!id;

  const { user } = useAuthContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [orderItems, setOrderItems] = useState<ICreateOrderItem[]>([]);

  const [city, setCity] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [ward, setWard] = useState<string>('');
  const [detailAddress, setDetailAddress] = useState<string>('');
  const [shopAddress, setShopAddress] = useState<string>('');

  const { data: orderData } = useGetOrderById(id as string);
  const { data: payment } = useGetPaymentById(1);

  const { mutate: createOrderMutate, isPending: isCreatePending } =
    useCreateOrder();
  const { mutate: updateOrderMutate, isPending: isUpdatePending } =
    useUpdateOrder();

  const formik = useFormik({
    initialValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
      shipment: {
        method: 1,
        deliveryDate: isEdit ? null : moment().toDate(),
      },
      paymentMethodId: 1,
      flag: {
        isOnlineOrder: false,
      },
      note: '',
    },
    // validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      if (!user?.id) {
        return showNotification('Không tìm thấy tài khoản', 'error');
      }
      const payload = {
        ...values,
        userId: +user?.id,
        items: orderItems,
        shipment: {
          ...values?.shipment,
          address:
            values?.shipment?.method === 1
              ? `${detailAddress}, ${ward}, ${district}, ${city}`
              : shopAddress,
        },
        totalPrice: orderItems?.reduce(
          (acc, item) => acc + (item?.price ?? 0) * (item?.quantity ?? 0),
          0
        ),
      };
      console.log('payload:', payload);
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
        // updateOrderMutate(
        //   { id: +id, ...payload },
        //   {
        //     onSuccess() {
        //       queryClient.invalidateQueries({
        //         queryKey: [QueryKeys.Order],
        //       });
        //       showNotification('Cập nhật đơn hàng thành công', 'success');
        //       navigate(-1);
        //     },
        //     onError: (err: Error | AxiosError) => {
        //       if (axios.isAxiosError(err)) {
        //         showNotification(err.response?.data?.message, 'error');
        //       } else {
        //         showNotification(err.message, 'error');
        //       }
        //     },
        //   }
        // );
      } else {
        createOrderMutate(payload as ICreateOrder, {
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
      formik.setFieldValue('fullName', orderData?.data?.fullName);
      formik.setFieldValue('phoneNumber', orderData?.data?.phoneNumber);
      formik.setFieldValue('email', orderData?.data?.email);

      if (orderData?.data?.shipment?.method === 1) {
        const addressArr = orderData?.data?.shipment?.address?.split(', ');
        setCity(addressArr[3]);
        setDistrict(addressArr[2]);
        setWard(addressArr[1]);
        setDetailAddress(addressArr[0]);
      } else {
        setShopAddress(orderData?.data?.shipment?.address);
      }

      formik.setFieldValue(
        'shipment.method',
        orderData?.data?.shipment?.method
      );
      formik.setFieldValue(
        'shipment.delivery_date',
        orderData?.data?.shipment?.deliveryDate
      );
      formik.setFieldValue('note', orderData?.data?.note);
      setOrderItems(orderData?.data?.items);
    }
  }, [orderData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize='small' />}
          aria-label='breadcrumb'>
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
      </Box>
      <Typography sx={{ mb: 2, fontSize: 20, fontWeight: 600 }}>
        {isEdit ? 'Chỉnh sửa đơn hàng' : 'Thêm đơn hàng mới'}:
      </Typography>
      <Grid2 container spacing={3}>
        <Grid2 size={6}>
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title='Thông tin khách hàng'
              sx={{
                span: {
                  fontSize: 18,
                  fontWeight: 500,
                },
              }}
            />
            <Divider />
            <CardContent>
              <CustomerForm formik={formik} handleChange={handleChange} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader
              title='Phương thức thanh toán'
              sx={{
                span: {
                  fontSize: 18,
                  fontWeight: 500,
                },
              }}
            />
            <Divider />
            <CardContent>
              <FormControl>
                <Typography sx={{ mb: 2, fontWeight: 600 }}>
                  Phương thức thanh toán
                </Typography>
                <RadioGroup
                  name='paymentMethodId'
                  onChange={handleChange}
                  value={formik?.values?.paymentMethodId}>
                  <FormControlLabel
                    value={payment?.data?.id}
                    control={<Radio size='small' />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <img
                          src={payment?.data?.image ?? ''}
                          alt=''
                          style={{
                            width: '100%',
                            maxWidth: '36px',
                            height: '36px',
                            objectFit: 'contain',
                          }}
                        />
                        <Typography sx={{ ml: 1, fontSize: 14 }}>
                          {payment?.data?.name}
                        </Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
                <>{formik?.errors?.paymentMethodId}</>
              </FormControl>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={6}>
          <Card>
            <CardHeader
              title='Địa chỉ giao hàng'
              sx={{
                span: {
                  fontSize: 18,
                  fontWeight: 500,
                },
              }}
            />
            <Divider />
            <CardContent>
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
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={12}>
          <ProductSelector
            isEdit={isEdit}
            orderData={orderData?.data}
            orderItems={orderItems}
            setOrderItems={setOrderItems}
          />
        </Grid2>
        <Grid2 size={12}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              width: '100%',
              mt: 2,
            }}>
            <Button onClick={() => navigate(ROUTES.PRODUCT)} sx={{ mr: 2 }}>
              Trở lại
            </Button>
            <Button
              variant='contained'
              onClick={() => formik.handleSubmit()}
              // disabled={!orderItems?.length}
              sx={{ minWidth: 100 }}>
              {isEdit ? 'Lưu' : 'Tạo'}
            </Button>
          </Box>
        </Grid2>
      </Grid2>
      {(isCreatePending || isUpdatePending) && <SuspenseLoader />}
    </>
  );
};

export default OrderUpsert;
