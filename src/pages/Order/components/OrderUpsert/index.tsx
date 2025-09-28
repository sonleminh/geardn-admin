import axios, { AxiosError } from 'axios';
import { useFormik } from 'formik';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid2,
  Link,
  Typography,
} from '@mui/material';

import { useQueryClient } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/AuthContext';
import { useAlertContext } from '@/contexts/AlertContext';

import {
  useCreateOrder,
  useGetOrderById,
  useUpdateOrder,
} from '@/services/order';

import { QueryKeys } from '@/constants/query-key';

import { ICheckoutItem, ICreateOrder, IOrder } from '@/interfaces/IOrder';

import SuspenseLoader from '@/components/SuspenseLoader';
import CustomerForm from './components/CustomerForm';
import ProductSelector from './components/ProductSelector';
import ShipmentForm from './components/ShipmentForm';
import { ROUTES } from '@/constants/route';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface AddressState {
  city: string;
  district: string;
  ward: string;
  detailAddress: string;
  shopAddress: string;
}

interface OrderFormValues {
  fullName: string;
  phoneNumber: string;
  email: string;
  shipment: {
    method: number;
    deliveryDate: Date | null;
  };
  paymentMethodId: number;
  flag: {
    isOnlineOrder: boolean;
  };
  note: string;
  completedAt: Date | null;
}

const useOrderForm = (orderData: { data: IOrder } | undefined) => {
  const [orderItems, setOrderItems] = useState<ICheckoutItem[]>([]);
  const [address, setAddress] = useState<AddressState>({
    city: '',
    district: '',
    ward: '',
    detailAddress: '',
    shopAddress: '',
  });

  const formik = useFormik<OrderFormValues>({
    initialValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
      shipment: {
        method: 1,
        deliveryDate: null,
      },
      paymentMethodId: 1,
      flag: {
        isOnlineOrder: false,
      },
      note: '',
      completedAt: null,
    },
    validateOnChange: false,
    onSubmit: () => {}, // Will be set in the component
  });

  useEffect(() => {
    if (orderData) {
      formik.setFieldValue('fullName', orderData.data.fullName);
      formik.setFieldValue('phoneNumber', orderData.data.phoneNumber);
      formik.setFieldValue('email', orderData.data.email);

      if (orderData.data.shipment?.method === 1) {
        const addressArr = orderData.data.shipment?.address?.split(', ');
        setAddress({
          city: addressArr[3] || '',
          district: addressArr[2] || '',
          ward: addressArr[1] || '',
          detailAddress: addressArr[0] || '',
          shopAddress: '',
        });
      } else {
        setAddress((prev) => ({
          ...prev,
          shopAddress: orderData.data.shipment?.address || '',
        }));
      }

      formik.setFieldValue('shipment.method', orderData.data.shipment?.method);
      formik.setFieldValue(
        'shipment.deliveryDate',
        orderData.data.shipment?.deliveryDate
      );
      formik.setFieldValue('note', orderData.data.note);
      setOrderItems(orderData.data.orderItems);
    }
  }, [orderData]);

  return {
    formik,
    orderItems,
    setOrderItems,
    address,
    setAddress,
  };
};

const OrderUpsert = () => {
  const { id } = useParams();
  const isEdit = !!id;

  const { user } = useAuthContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showAlert } = useAlertContext();

  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const { data: orderData } = useGetOrderById(id as string);

  const { mutate: createOrderMutate, isPending: isCreatePending } =
    useCreateOrder();
  const { mutate: updateOrderMutate, isPending: isUpdatePending } =
    useUpdateOrder();

  const { formik, orderItems, setOrderItems, address, setAddress } =
    useOrderForm(orderData);

  const handleSubmit = useCallback(
    (values: OrderFormValues) => {
      if (!user?.id) {
        return showAlert('Không tìm thấy tài khoản', 'error');
      }

      if (!orderItems?.length) {
        return showAlert('Không có sản phẩm nào để tạo đơn hàng', 'error');
      }

      const { city, district, ward, detailAddress, shopAddress } = address;
      if (
        (values.shipment.method === 1 && !ward && !detailAddress) ||
        (values.shipment.method === 2 && !shopAddress)
      ) {
        return showAlert('Vui lòng chọn địa chỉ nhận hàng', 'error');
      }

      // Process form values - trim whitespace and convert empty strings to null for API
      const processField = (value: string) => {
        const trimmed = value?.trim();
        return trimmed === '' ? null : trimmed;
      };

      const processedValues = {
        ...values,
        fullName: processField(values.fullName),
        phoneNumber: processField(values.phoneNumber),
        email: processField(values.email),
        note: processField(values.note),
      };

      const payload = {
        ...processedValues,
        userId: +user.id,
        orderItems: orderItems?.map((item) => ({
          skuId: +item.skuId,
          quantity: item.quantity,
        })),
        shipment: {
          ...processedValues.shipment,
          address:
            values.shipment.method == 1
              ? `${detailAddress}, ${ward}, ${district}, ${city}`
              : shopAddress,
          deliveryDate: values.shipment.deliveryDate,
        },
        totalPrice: orderItems.reduce(
          (acc, item) => acc + (item.sellingPrice ?? 0) * (item.quantity ?? 0),
          0
        ),
      };

      if (isEdit) {
        const { userId, ...updatePayload } = payload;
        updateOrderMutate(
          { id: +id, ...updatePayload },
          {
            onSuccess() {
              queryClient.invalidateQueries({
                queryKey: [QueryKeys.Order],
              });
              showAlert('Cập nhật đơn hàng thành công', 'success');
              navigate(-1);
            },
            onError: handleError,
          }
        );
      } else {
        createOrderMutate(payload as ICreateOrder, {
          onSuccess() {
            queryClient.invalidateQueries({ queryKey: [QueryKeys.Order] });
            showAlert('Tạo đơn hàng thành công', 'success');
            navigate(-1);
          },
          onError: handleError,
        });
      }
    },
    [
      user?.id,
      orderItems,
      address,
      isEdit,
      id,
      createOrderMutate,
      updateOrderMutate,
      queryClient,
      showAlert,
      navigate,
    ]
  );

  const handleError = useCallback(
    (err: Error | AxiosError) => {
      if (axios.isAxiosError(err)) {
        showAlert(err.response?.data?.message, 'error');
      } else {
        showAlert(err.message, 'error');
      }
    },
    [showAlert]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      formik.setFieldValue(name, value);
    },
    [formik]
  );

  const handleAddressChange = useCallback(
    (field: keyof AddressState, value: string) => {
      setAddress((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleCityChange = useCallback(
    (value: React.SetStateAction<string>) => {
      if (typeof value === 'function') {
        setAddress((prev) => ({
          ...prev,
          city: value(prev.city),
        }));
      } else {
        handleAddressChange('city', value);
      }
    },
    [handleAddressChange]
  );

  const handleDistrictChange = useCallback(
    (value: React.SetStateAction<string>) => {
      if (typeof value === 'function') {
        setAddress((prev) => ({
          ...prev,
          district: value(prev.district),
        }));
      } else {
        handleAddressChange('district', value);
      }
    },
    [handleAddressChange]
  );

  const handleWardChange = useCallback(
    (value: React.SetStateAction<string>) => {
      if (typeof value === 'function') {
        setAddress((prev) => ({
          ...prev,
          ward: value(prev.ward),
        }));
      } else {
        handleAddressChange('ward', value);
      }
    },
    [handleAddressChange]
  );

  const handleDetailAddressChange = useCallback(
    (value: React.SetStateAction<string>) => {
      if (typeof value === 'function') {
        setAddress((prev) => ({
          ...prev,
          detailAddress: value(prev.detailAddress),
        }));
      } else {
        handleAddressChange('detailAddress', value);
      }
    },
    [handleAddressChange]
  );

  const handleShopAddressChange = useCallback(
    (value: React.SetStateAction<string>) => {
      if (typeof value === 'function') {
        setAddress((prev) => ({
          ...prev,
          shopAddress: value(prev.shopAddress),
        }));
      } else {
        handleAddressChange('shopAddress', value);
      }
    },
    [handleAddressChange]
  );

  const breadcrumbs = useMemo(
    () => [
      {
        icon: <HomeOutlinedIcon sx={{ fontSize: 24 }} />,
        label: '',
        onClick: () => navigate(ROUTES.DASHBOARD),
      },
      {
        label: 'Danh sách đơn hàng',
        onClick: () => navigate(ROUTES.ORDER_LIST),
      },
      {
        label: isEdit ? 'Chỉnh sửa đơn hàng' : 'Thêm đơn hàng mới',
      },
    ],
    [isEdit, navigate]
  );

  if (isEdit && !orderData) {
    return <SuspenseLoader />;
  }

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize='small' />}
          aria-label='breadcrumb'>
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={index}
              underline='hover'
              color='inherit'
              onClick={crumb.onClick}
              sx={{
                cursor: crumb.onClick ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
              }}>
              {crumb.icon}
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      </Box>

      <Typography sx={{ mb: 2, fontSize: 20, fontWeight: 600 }}>
        {isEdit ? 'Chỉnh sửa đơn hàng' : 'Thêm đơn hàng mới'}:
      </Typography>

      <Grid2 container spacing={4}>
        <Grid2 size={{ xs: 12, md: 6 }}>
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
              <CustomerForm
                formik={formik}
                handleChange={handleChange}
                isCompleted={isCompleted}
                setIsCompleted={setIsCompleted}
              />
            </CardContent>
          </Card>
          {/* <Card>
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
                <RadioGroup
                  name='paymentMethodId'
                  value={formik.values.paymentMethodId}
                  onChange={handleChange}>
                  <FormControlLabel
                    value={1}
                    control={<Radio />}
                    label='Thanh toán khi nhận hàng'
                  />
                  <FormControlLabel
                    value={2}
                    control={<Radio />}
                    label='Chuyển khoản ngân hàng'
                  />
                </RadioGroup>
              </FormControl>
            </CardContent>
          </Card> */}
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              title='Thông tin vận chuyển'
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
                handleChange={handleChange}
                city={address.city}
                district={address.district}
                ward={address.ward}
                detailAddress={address.detailAddress}
                shopAddress={address.shopAddress}
                setCity={handleCityChange}
                setDistrict={handleDistrictChange}
                setWard={handleWardChange}
                setDetailAddress={handleDetailAddressChange}
                setShopAddress={handleShopAddressChange}
              />
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12 }}>
          <ProductSelector
            orderData={orderData?.data}
            orderItems={orderItems}
            setOrderItems={setOrderItems}
            isEdit={isEdit}
          />
        </Grid2>
      </Grid2>

      <Grid2 size={{ xs: 12 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            mt: 2,
          }}>
          <Button onClick={() => navigate(ROUTES.ORDER_LIST)} sx={{ mr: 2 }}>
            Trở lại
          </Button>
          <Button
            variant='contained'
            onClick={() => handleSubmit(formik.values)}
            sx={{ minWidth: 100 }}>
            {isEdit ? 'Lưu' : 'Tạo'}
          </Button>
        </Box>
      </Grid2>

      {(isCreatePending || isUpdatePending) && <SuspenseLoader />}
    </>
  );
};

export default OrderUpsert;
