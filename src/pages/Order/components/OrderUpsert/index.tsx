import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import SuspenseLoader from '@/components/SuspenseLoader';

import { useNotificationContext } from '@/contexts/NotificationContext';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import Input from '@/components/Input';
import { QueryKeys } from '@/constants/query-key';
import { ICategory } from '@/interfaces/ICategory';
import {
  useCreateModel,
  useGetInitialForCreate,
  useGetModelById,
  useUpdateModel,
} from '@/services/model';
import { useGetProductByCategory, useGetProductById } from '@/services/product';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid2,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Theme,
  Typography,
} from '@mui/material';
import { createSchema, updateSchema } from '../utils/schema/orderSchema';
import { IOrderItem } from '@/interfaces/IOrder';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import {
  getProvinces,
  useCreateOrder,
  useGetDistrict,
  useGetDistrictByCode,
  useGetOrderById,
  useGetProvinces,
  useUpdateOrder,
} from '@/services/order';
import { formatPrice } from '@/utils/format-price';
import axios, { AxiosError } from 'axios';
import { useGetPaymentById } from '@/services/payment';
import { useAuthContext } from '@/contexts/AuthContext';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment, { Moment } from 'moment';

const OrderUpsert = () => {
  const { id } = useParams();
  const isEdit = !!id;

  const { user } = useAuthContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [categoryId, setCategoryId] = useState<string>('');
  const [productId, setProductId] = useState<string>('');
  const [quantity, setQuantity] = useState('');
  const [orderItems, setOrderItems] = useState<IOrderItem[]>([]);
  const [selectedModel, setSelectedModel] = useState<(number | undefined)[]>(
    []
  );
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isOrderItemEdit, setIsOrderItemEdit] = useState<boolean>(false);
  const [modelIdEdit, setModelIdEdit] = useState<string>('');
  const [itemIndex, setItemIndex] = useState<number | null>(null);
  const [shopAddress, setShopAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [ward, setWard] = useState<string>('');
  const [detailAddress, setDetailAddress] = useState<string>('');

  console.log('productId:', productId);
  // console.log('categoryId:', categoryId);

  const { data: orderData } = useGetOrderById(id as string);
  const { data: productsByCategory } = useGetProductByCategory(categoryId);
  const { data: product } = useGetProductById(productId);
  const { data: initData } = useGetInitialForCreate();
  const { data: provinces } = useGetProvinces();
  const { data: payment } = useGetPaymentById('673c8947d6a67118f380f4ab');

  console.log('selectedModel:', selectedModel);

  // const { data: district } = useGetDistrictByCode(districtCode);
  // console.log('district:', districtCode);
  // console.log('provinces:', provinces);

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
        delivery_date: moment(),
      },
      payment: {
        method: '673c8947d6a67118f380f4ab',
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
          // method: values?.shipment?.method === 1 ? 1 : 2,
          address:
            values?.shipment?.method === 1
              ? `${detailAddress}, ${ward}, ${district}, ${city}`
              : shopAddress,
          // receive_name: formik?.values?.customer?.name,
          // receiver_phone: formik?.values?.customer?.phone,
          // delivery_date: formik?.values?.shipment?.delivery_date,
        },
        flag: {
          is_online_order: false,
        },
      };
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

  const { data: districtData } = useGetDistrict(
    provinces
      ?.find((item) => item?.name === city)
      ?.districts?.find((item) => item?.name === district)
      ?.code.toString() ?? ''
  );

  useEffect(() => {
    if (product?.tier_variations.length === 0) {
      setSelectedImage(product.images[0]);
      return;
    }

    // Find the model based on selected indices
    const matchedModel = product?.models.find((model) =>
      model?.extinfo?.tier_index?.every(
        (tierIdx, idx) => tierIdx === selectedModel[idx]
      )
    );

    // If an image exists for the selected tier index, use it; otherwise, fallback to the default image
    if (matchedModel) {
      const tierIndex = matchedModel?.extinfo?.tier_index?.[0];
      const image =
        product?.tier_variations[0]?.images?.[tierIndex ?? 0] ||
        product?.images[0];
      setSelectedImage(image ?? '');
    }
  }, [selectedModel, product]);

  useEffect(() => {
    if (
      (isOrderItemEdit && product && modelIdEdit) ||
      (isOrderItemEdit && product)
    ) {
      setSelectedModel(
        product?.models?.find((item) => item._id === modelIdEdit)?.extinfo
          .tier_index ?? []
      );
      setCategoryId(product?.category?._id);
    }
  }, [isOrderItemEdit, product, modelIdEdit]);
  console.log('ward:', ward);

  useEffect(() => {
    if (orderData) {
      formik.setFieldValue('customer.name', orderData?.customer?.name);
      formik.setFieldValue('customer.phone', orderData?.customer?.phone);
      formik.setFieldValue('customer.mail', orderData?.customer?.mail);

      const addressArr = orderData?.shipment?.address?.split(', ');
      // const isValidCity = provinces?.some(
      //   (province) => province.name === addressArr[3]
      // );
      // const isValidWard = districtData?.wards?.some(
      //   (item) => item.name === addressArr[1]
      // );
      // setCity(isValidCity ? addressArr[3] : '');
      // setDistrict(addressArr[2]);
      // setWard(isValidWard ? addressArr[1] : '');
      setCity(addressArr[3]);
      setDistrict(addressArr[2]);
      setWard(addressArr[1]);
      setDetailAddress(addressArr[0]);

      formik.setFieldValue('shipment.method', orderData?.shipment?.method);
      formik.setFieldValue('note', orderData?.note);

      // formik.setFieldValue('address.city', orderData?.address?.city);
      // formik.setFieldValue('address.district', orderData?.address?.district);
      // formik.setFieldValue('address.ward', orderData?.address?.ward);
      // formik.setFieldValue(
      //   'address.detail_address',
      //   orderData?.address?.detail_address
      // );
      // formik.setFieldValue('stock', modelData?.stock);
      // formik.setFieldValue(
      //   'extinfo.tier_index',
      //   modelData?.extinfo?.tier_index
      // );
      // formik.setFieldValue(
      //   'extinfo.is_pre_order',
      //   modelData?.extinfo?.is_pre_order
      // );
      setOrderItems(orderData?.items);
    }
  }, [orderData, districtData]);

  console.log();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };
  const handleCityChange = (e: SelectChangeEvent<string>) => {
    setCity(e?.target?.value);
  };

  const handleDistrictChange = (e: SelectChangeEvent<string>) => {
    setDistrict(e?.target?.value);
  };

  const handleWardChange = (e: SelectChangeEvent<string>) => {
    setWard(e?.target?.value);
  };

  const handleDetailAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDetailAddress(e?.target?.value);
  };

  // const handleSelectChange = (e: SelectChangeEvent<string>) => {
  //   const { name, value } = e.target;
  //   formik.setFieldValue(name, value);
  //   setProductId(value);
  // };

  // const handleIsPreOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, checked } = e.target;
  //   formik.setFieldValue(name, checked);
  // };

  const handleVariantChange = (event: SelectChangeEvent, vIndex: number) => {
    const selectedOptionIndex = product?.tier_variations[
      vIndex
    ]?.options.indexOf(event.target.value);
    const updatedSelectedModel = [...selectedModel];
    updatedSelectedModel[vIndex] = selectedOptionIndex;
    setSelectedModel(updatedSelectedModel);
    setSelectedImage('');
    setQuantity('');
  };

  const getFilteredOptions = (vIndex: number) => {
    // If no previous option selected, show all options
    if (vIndex === 0) {
      return (
        product?.tier_variations[vIndex].options.filter((_, optionIndex) =>
          product.models.some(
            (model) => model?.extinfo?.tier_index?.[0] === optionIndex
          )
        ) ?? []
      );
    }

    // Filter options based on previous selections
    return (
      product?.tier_variations[vIndex]?.options.filter((_, optionIndex) =>
        product.models.some(
          (model) =>
            model?.extinfo?.tier_index?.[vIndex - 1] ===
              selectedModel?.[vIndex - 1] &&
            model?.extinfo?.tier_index?.[vIndex] === optionIndex
        )
      ) ?? []
    );
  };

  const hanleUpsertOrderItem = () => {
    let matchedModel;
    if (!product?.tier_variations?.length) {
      matchedModel = product?.models[0];
    } else {
      matchedModel = product?.models?.find(
        (model) =>
          JSON.stringify(model?.extinfo?.tier_index) ===
          JSON.stringify(selectedModel)
      );
    }

    // console.log(matchedModel);

    if (
      !isOrderItemEdit &&
      orderItems?.find((item) => item?.model_id === matchedModel?._id)
    ) {
      return showNotification('Sản phẩm đã có trong danh sách!', 'error');
    }
    console.log(2, matchedModel && matchedModel?.stock + +quantity);
    if (
      matchedModel &&
      +quantity >
        (isOrderItemEdit
          ? matchedModel?.stock + +quantity
          : matchedModel?.stock)
    ) {
      return showNotification('Số lượng vượt quá hàng trong kho!!', 'error');
    }

    const newItem = {
      model_id: matchedModel?._id ?? '',
      product_id: productId,
      product_name: product?.name ?? '',
      name: matchedModel?.name ?? '',
      image: selectedImage,
      price: matchedModel?.price ?? 0,
      quantity: +quantity,
    };
    if (itemIndex !== null) {
      const updatedOrderItems = [...orderItems];
      updatedOrderItems[itemIndex] = newItem;
      setOrderItems(updatedOrderItems);
      setItemIndex(null);
    } else {
      setOrderItems((prev) => [...prev, newItem]);
    }

    setCategoryId('');
    setProductId('');
    setSelectedImage('');
    setQuantity('');
  };

  const handleCancelUpsertOrderItem = () => {
    setIsOrderItemEdit(false);
    setCategoryId('');
    setProductId('');
    setSelectedImage('');
    setModelIdEdit('');
    setQuantity('');
  };

  const handleEditOrderItem = (item: IOrderItem, index: number) => {
    setIsOrderItemEdit(true);
    // setCategoryId(item?.category_id);
    setProductId(item?.product_id);
    setModelIdEdit(item?.model_id);
    setQuantity(`${item?.quantity}`);
    setItemIndex(index);
    // setIsOrderItemEdit(true); // Set edit mode
    // setProductId(item.product_id); // Set productId
    // setCategoryId(item.product_id); // Set categoryId
    // // Find the model based on item details to pre-fill variant selections
    // const matchedProduct = product?.models?.find(
    //   (model) => model._id === item.product_id
    // );
    // if (matchedProduct) {
    //   const selectedModelIndices = matchedProduct.models.find(
    //     (model) => model._id === item.model_id
    //   )?.extinfo?.tier_index;
    //   if (selectedModelIndices) {
    //     setSelectedModel(selectedModelIndices);
    //   }
    // }
    // setQuantity(item.quantity.toString());
  };

  const handleDeleteOrderItem = (index: number) => {
    const updatedOrderItems = [...orderItems];
    updatedOrderItems.splice(index, 1);
    setOrderItems(updatedOrderItems);
  };

  function showOrderItemStock() {
    if (product && selectedModel.length > 0) {
      const matchedModel = product?.models?.find(
        (model) =>
          JSON.stringify(model?.extinfo?.tier_index) ===
          JSON.stringify(selectedModel)
      );
      return matchedModel?.stock;
    } else if (
      product &&
      selectedModel.length === 0 &&
      product?.models?.length === 1
    ) {
      return product?.models?.[0]?.stock;
    } else {
      return null;
    }
  }

  const totalAmount = () => {
    return orderItems?.reduce(
      (acc, item) => acc + (item?.price ?? 0) * (item?.quantity ?? 0),
      0
    );
  };

  const handleDateChange = (newValue: Moment | null) => {
    formik.setFieldValue('shipment.delivery_date', newValue);
  };

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
            {isEdit ? 'Sửa đơn hàng' : 'Thêm đơn hàng'}:{' '}
          </Typography>
        }
      />
      <Divider />

      <CardContent>
        {/* {!isEdit && (
          <> */}
        <Typography mb={1}>Thông tin:</Typography>
        <Grid2 container rowSpacing={2} columnSpacing={4} mb={2}>
          <Grid2 size={6}>
            <FormControl fullWidth>
              <Input
                label='Tên khách hàng'
                name='customer.name'
                variant='filled'
                size='small'
                helperText={
                  <Box component={'span'} sx={helperTextStyle}>
                    {formik?.errors?.customer?.name}
                  </Box>
                }
                value={formik?.values?.customer?.name}
                onChange={handleChange}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={6}>
            <FormControl fullWidth>
              <Input
                label='Mail'
                name='customer.mail'
                variant='filled'
                size='small'
                helperText={
                  <Box component={'span'} sx={helperTextStyle}>
                    {formik?.errors?.customer?.mail}
                  </Box>
                }
                value={formik?.values?.customer?.mail}
                onChange={handleChange}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={6}>
            <FormControl fullWidth>
              <Input
                label='Số điện thoại'
                name='customer.phone'
                variant='filled'
                size='small'
                helperText={
                  <Box component={'span'} sx={helperTextStyle}>
                    {formik?.errors?.customer?.phone}
                  </Box>
                }
                value={formik?.values?.customer?.phone}
                onChange={handleChange}
              />
            </FormControl>
          </Grid2>
        </Grid2>
        <RadioGroup
          sx={{ mb: 1 }}
          row
          name='shipment.method'
          onChange={handleChange}
          value={formik?.values?.shipment?.method}>
          <FormControlLabel
            value={1}
            control={<Radio size='small' />}
            label={
              <Typography sx={{ fontSize: 14 }}>Giao hàng tận nơi</Typography>
            }
          />
          <FormControlLabel
            value={2}
            control={<Radio size='small' />}
            label={
              <Typography sx={{ fontSize: 14 }}>Nhận tại cửa hàng</Typography>
            }
          />
        </RadioGroup>
        <Grid2 mb={4} container rowSpacing={2} columnSpacing={4}>
          {formik?.values?.shipment?.method === 1 ? (
            <>
              <Grid2 size={6}>
                <FormControl
                  variant='filled'
                  fullWidth
                  sx={{
                    '& .MuiFilledInput-root': {
                      overflow: 'hidden',
                      borderRadius: 1,
                      backgroundColor: '#fff !important',
                      border: '1px solid',
                      borderColor: 'rgba(0,0,0,0.23)',
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'transparent',
                        border: '2px solid',
                      },
                    },
                    '& .MuiInputLabel-asterisk': {
                      color: 'red',
                    },
                  }}>
                  <InputLabel>Tỉnh/Thành phố</InputLabel>
                  <Select
                    disableUnderline
                    size='small'
                    onChange={handleCityChange}
                    value={city ?? ''}>
                    {provinces &&
                      provinces?.map((item) => (
                        <MenuItem key={item?.code} value={item?.name}>
                          {item?.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid2>
              <Grid2 size={6}>
                <FormControl
                  variant='filled'
                  fullWidth
                  sx={{
                    '& .MuiFilledInput-root': {
                      overflow: 'hidden',
                      borderRadius: 1,
                      backgroundColor: '#fff !important',
                      border: '1px solid',
                      borderColor: 'rgba(0,0,0,0.23)',
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'transparent',
                        border: '2px solid',
                      },
                    },
                    '& .MuiInputLabel-asterisk': {
                      color: 'red',
                    },
                    '& .Mui-disabled': {
                      cursor: 'not-allowed',
                    },
                  }}>
                  <InputLabel>Quận/Huyện</InputLabel>
                  <Select
                    disableUnderline
                    size='small'
                    onChange={handleDistrictChange}
                    value={district ?? ''}
                    disabled={!city}>
                    {provinces
                      ?.find((item) => item?.name === city)
                      ?.districts?.map((item) => (
                        <MenuItem key={item?.code} value={item?.name}>
                          {item?.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid2>
              <Grid2 size={6}>
                <FormControl
                  variant='filled'
                  fullWidth
                  sx={{
                    '& .MuiFilledInput-root': {
                      overflow: 'hidden',
                      borderRadius: 1,
                      backgroundColor: '#fff !important',
                      border: '1px solid',
                      borderColor: 'rgba(0,0,0,0.23)',
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'transparent',
                        border: '2px solid',
                      },
                    },
                    '& .MuiInputLabel-asterisk': {
                      color: 'red',
                    },
                    '& .Mui-disabled': {
                      cursor: 'not-allowed',
                    },
                  }}>
                  <InputLabel>Phường/Xã</InputLabel>
                  <Select
                    disableUnderline
                    size='small'
                    onChange={handleWardChange}
                    value={ward ?? ''}
                    disabled={!district}>
                    {districtData?.wards?.map((item) => (
                      <MenuItem key={item?.code} value={item?.name}>
                        {item?.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid2>
              <Grid2 size={6}>
                <FormControl fullWidth>
                  <Input
                    label='Địa chỉ cụ thể'
                    variant='filled'
                    size='small'
                    rows={3}
                    onChange={handleDetailAddressChange}
                    value={detailAddress}
                  />
                </FormControl>
              </Grid2>
              <Grid2 size={6}>
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DateTimePicker
                      name='shipment.delivery_date'
                      ampm={false}
                      shouldDisableTime={(timeValue, clockType) => {
                        if (clockType === 'hours') {
                          const hour = timeValue.hour();
                          return hour < 8 || hour > 23;
                        }
                        return false;
                      }}
                      minDate={moment()}
                      onChange={handleDateChange}
                      value={formik?.values?.shipment?.delivery_date}
                    />
                  </LocalizationProvider>
                </FormControl>
              </Grid2>
            </>
          ) : (
            <Grid2 size={12}>
              <FormControl
                variant='filled'
                fullWidth
                sx={{
                  '& .MuiFilledInput-root': {
                    overflow: 'hidden',
                    borderRadius: 1,
                    backgroundColor: '#fff !important',
                    border: '1px solid',
                    borderColor: 'rgba(0,0,0,0.23)',
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'transparent',
                      border: '2px solid',
                    },
                  },
                  '& .MuiInputLabel-asterisk': {
                    color: 'red',
                  },
                }}>
                <InputLabel>Chọn shop có hàng gần nhất</InputLabel>
                <Select
                  disableUnderline
                  size='small'
                  onChange={(e) => setShopAddress(e?.target?.value)}
                  value={shopAddress}>
                  <MenuItem
                    value={
                      '39/48 Cù Chính Lan, P.Hòa Khê, Q.Thanh Khê, TP.Đà Nẵng'
                    }>
                    39/48 Cù Chính Lan, P.Hòa Khê, Q.Thanh Khê, TP.Đà Nẵng
                  </MenuItem>
                  <MenuItem
                    value={
                      '02 Tô Hiến Thành, P.Phước Mỹ, Q.Sơn Trà, TP.Đà Nẵng'
                    }>
                    02 Tô Hiến Thành, P.Phước Mỹ, Q.Sơn Trà, TP.Đà Nẵng
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid2>
          )}
          <Grid2 size={12}>
            <FormControl
              variant='filled'
              fullWidth
              sx={{
                textarea: {
                  fontFamily: 'Roboto, sans-serif',
                  '::placeholder': {
                    fontSize: 14,
                  },
                },
              }}>
              <textarea
                placeholder='Ghi chú (Ví dụ: Hãy gọi cho tôi khi chuẩn bị hàng xong)'
                name='note'
                rows={4}
                onChange={handleChange}
                value={formik?.values?.note}
                style={{
                  width: '100%',
                  padding: '8.5px 14px',
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  borderRadius: '4px',
                  fontSize: 16,
                }}
                onFocus={(e) => (e.target.style.outline = '1px solid #000')}
                onBlur={(e) => (e.target.style.outline = 'none')}
              />
              <FormHelperText sx={helperTextStyle}>
                {formik?.errors?.note}
              </FormHelperText>
            </FormControl>
          </Grid2>
        </Grid2>
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
                  value={payment?._id}
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
          <Grid2 size={6}>
            <Typography mb={1}>Thêm sản phẩm:</Typography>
            <FormControl
              variant='filled'
              fullWidth
              sx={{
                mb: 2,
                '& .MuiFilledInput-root': {
                  overflow: 'hidden',
                  borderRadius: 1,
                  backgroundColor: '#fff !important',
                  border: '1px solid',
                  borderColor: 'rgba(0,0,0,0.23)',
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'transparent',
                    border: '2px solid',
                  },
                },
                '& .MuiInputLabel-asterisk': {
                  color: 'red',
                },
              }}>
              <InputLabel>Danh mục</InputLabel>
              <Select
                disableUnderline
                size='small'
                onChange={(e) => {
                  setCategoryId(e?.target?.value as string);
                  setProductId('');
                  setSelectedModel([]);
                  setSelectedImage('');
                  setQuantity('');
                }}
                value={categoryId ?? ''}>
                {initData?.categoryList?.map((item: ICategory) => (
                  <MenuItem key={item?._id} value={item?._id}>
                    {item?.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl
              variant='filled'
              fullWidth
              sx={{
                mb: 2,
                '& .MuiFilledInput-root': {
                  overflow: 'hidden',
                  borderRadius: 1,
                  backgroundColor: categoryId ? '#fff' : '',
                  border: '1px solid',
                  borderColor: 'rgba(0,0,0,0.23)',

                  '&.Mui-focused': {
                    border: '2px solid',
                  },
                },
                '& .MuiInputLabel-asterisk': {
                  color: 'red',
                },
              }}>
              <InputLabel>Sản phẩm</InputLabel>
              <Select
                // disableUnderline
                size='small'
                name='product'
                disabled={!categoryId && !isOrderItemEdit}
                onChange={(e) => {
                  setProductId(e.target.value);
                  setSelectedModel([]);
                  setSelectedImage('');
                  setQuantity('');
                }}
                value={productId ?? ''}>
                {productsByCategory?.map((item) => (
                  <MenuItem
                    key={item?._id}
                    value={item?._id}
                    disabled={
                      !item?.original_price
                      //  ||
                      // orderItems?.find((orderItem) =>
                      //   item?.models?.some(
                      //     (item) => item._id === orderItem?.model_id
                      //   )
                    }>
                    {item?.name} {!item?.original_price && '- (Hết hàng)'}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                <Box component={'span'} sx={helperTextStyle}>
                  {/* {formik.errors?.product} */}
                </Box>
              </FormHelperText>
            </FormControl>
            {product?.tier_variations?.map((item, vIndex) => (
              <FormControl
                sx={{
                  mb: 2,
                  '& .MuiFilledInput-root': {
                    overflow: 'hidden',
                    borderRadius: 1,
                    backgroundColor: '#fff !important',
                    border: '1px solid',
                    borderColor: 'rgba(0,0,0,0.23)',
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'transparent',
                      border: '2px solid',
                    },
                  },
                  '& .MuiInputLabel-asterisk': {
                    color: 'red',
                  },
                }}
                key={item?.name}
                variant='filled'
                fullWidth>
                <InputLabel>{item?.name}</InputLabel>
                <Select
                  disableUnderline
                  size='small'
                  onChange={(e) => {
                    handleVariantChange(e, vIndex);
                  }}
                  value={
                    selectedModel[vIndex] !== undefined
                      ? product?.tier_variations[vIndex]?.options[
                          selectedModel[vIndex] as number
                        ]
                      : ''
                  }>
                  {getFilteredOptions(vIndex).map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
            {categoryId && productId && (
              <Box>
                <Grid2 container spacing={4} mb={1}>
                  <Grid2 sx={{ display: 'flex' }} size={6}>
                    <Typography mr={2}>Ảnh:</Typography>
                    {selectedImage && (
                      <img
                        src={selectedImage}
                        alt=''
                        style={{
                          width: '100%',
                          maxWidth: '80px',
                          height: '80px',
                          marginBottom: '4px',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          objectFit: 'contain',
                        }}
                      />
                    )}
                  </Grid2>
                  <Grid2 size={6}>
                    <Typography>Kho: {showOrderItemStock()}</Typography>
                  </Grid2>
                </Grid2>
              </Box>
            )}
            <FormControl sx={{ mb: 2 }} fullWidth>
              <Input
                // sx={{
                //   '& .MuiFilledInput-root': {
                //     ':hover': {
                //       backgroundColor: '#E0E0E0 !important',
                //     },
                //   },
                // }}
                label='Số lượng'
                name='quantity'
                variant='filled'
                size='small'
                type='number'
                helperText={
                  <Box component={'span'} sx={helperTextStyle}>
                    {/* {formik.errors.name} */}
                  </Box>
                }
                disabled={!isEdit && showOrderItemStock() === 0 ? true : false}
                onChange={(e) => setQuantity(e.target.value)}
                value={quantity}
              />
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant='contained'
                onClick={hanleUpsertOrderItem}
                disabled={!selectedImage || !quantity}>
                {isOrderItemEdit ? 'Lưu' : 'Thêm'}
              </Button>
              <Button
                sx={{ ml: 2 }}
                variant='outlined'
                disabled={!categoryId || !productId}
                onClick={handleCancelUpsertOrderItem}>
                Hủy
              </Button>
            </Box>
          </Grid2>
          <Grid2 size={6}>
            <Typography mb={1}>Sản phẩm:</Typography>
            <TableContainer component={Paper}>
              <Table sx={{}} aria-label='simple table'>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '3%', px: 1 }} align='center'>
                      Stt
                    </TableCell>
                    <TableCell sx={{ width: '5%', px: 0 }} align='center'>
                      Ảnh
                    </TableCell>
                    <TableCell sx={{ width: '20%', px: 1 }} align='center'>
                      Tên
                    </TableCell>
                    <TableCell sx={{ width: '5%', px: 1 }} align='center'>
                      SL
                    </TableCell>
                    <TableCell sx={{ width: '8%', px: 1 }} align='center'>
                      Giá
                    </TableCell>
                    <TableCell sx={{ width: '16%' }} align='center'>
                      Tuỳ chọn
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderItems?.length ? (
                    orderItems.map((item, index) => (
                      <TableRow
                        key={item.model_id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}>
                        <TableCell
                          sx={{ px: 1 }}
                          component='th'
                          scope='row'
                          align='center'>
                          {index + 1}
                        </TableCell>
                        <TableCell sx={{ px: 0 }} align='center'>
                          <img
                            src={item?.image}
                            alt='Selected Product'
                            style={{
                              width: '48px',
                              maxWidth: '48px',
                              height: '48px',
                              objectFit: 'contain',
                              border: '1px solid #ccc',
                              borderRadius: '2px',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: 13 }}>
                          {item.product_name}
                        </TableCell>
                        <TableCell sx={{ px: 1 }} align='center'>
                          {item.quantity}
                        </TableCell>
                        <TableCell sx={{ fontSize: 12 }} align='center'>
                          {formatPrice(item?.price)}
                        </TableCell>
                        <TableCell align='center'>
                          <Button
                            sx={{
                              minWidth: 20,
                              width: 20,
                              height: 30,
                              mr: 1,
                            }}
                            variant='outlined'
                            onClick={() => {
                              handleEditOrderItem(item, index);
                            }}>
                            <EditOutlinedIcon sx={{ fontSize: 14 }} />
                          </Button>
                          <Button
                            sx={{ minWidth: 20, width: 20, height: 30 }}
                            variant='outlined'
                            onClick={() => handleDeleteOrderItem(index)}>
                            <DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow
                      sx={{
                        height: '80px',
                        '& td': { border: 0 },
                      }}>
                      <TableCell
                        colSpan={6}
                        align='center'
                        sx={{
                          textAlign: 'center',
                          color: '#999',
                        }}>
                        Empty
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Divider />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'end',
                  alignItems: 'center',
                  width: '100%',
                  px: 4,
                  py: 1,
                }}>
                <Typography sx={{ mr: 4, fontSize: 14 }}>Tổng tiền:</Typography>
                <Typography>{formatPrice(totalAmount())}</Typography>
              </Box>
            </TableContainer>
            {/* <Typography mb={1}>Sản phẩm:</Typography> */}
            {/* {orderItems?.map((item, index) => (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: index !== 0 ? 2 : 0,
                }}
                key={item?.model_id}>
                <Box sx={{ display: 'flex' }}>
                  <img
                    src={item?.image}
                    alt='Selected Product'
                    style={{
                      width: '50px',
                      maxWidth: '50px',
                      height: '50px',
                      objectFit: 'contain',
                      marginRight: '12px',
                      border: '1px solid #ccc',
                      borderRadius: '2px',
                    }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}>
                    <Typography sx={{ fontSize: 15 }}>
                      {item?.product_name}
                    </Typography>
                    {item?.name && (
                      <Typography
                        sx={{
                          display: 'inline-block',
                          px: '6px',
                          py: '2px',
                          bgcolor: '#f3f4f6',
                          fontSize: 11,
                          borderRadius: 0.5,
                        }}>
                        {item?.name}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex' }}>
                  <Typography sx={{ width: 40, mr: 1, fontSize: 14 }}>
                    x {item?.quantity}
                  </Typography>
                  <Typography
                    sx={{ width: 80, mr: 3, fontSize: 14, textAlign: 'end' }}>
                    {formatPrice(item?.price)}
                  </Typography>
                  <Button
                    sx={{
                      minWidth: 40,
                      width: 40,
                      height: 30,
                      mr: 1,
                    }}
                    variant='outlined'
                    onClick={() => {
                      handleEditOrderItem(item, index);
                    }}>
                    <EditOutlinedIcon sx={{ fontSize: 20 }} />
                  </Button>
                  <Button
                    sx={{ minWidth: 40, width: 40, height: 30 }}
                    variant='outlined'
                    onClick={() => handleDeleteOrderItem(index)}>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 20 }} />
                  </Button>
                </Box>
              </Box>
            ))} */}
            {/* <Divider sx={{ mt: 2 }} /> */}
          </Grid2>
        </Grid2>
        <Box sx={{ textAlign: 'end' }}>
          <Button
            sx={{ mr: 2 }}
            variant='contained'
            onClick={() => formik.handleSubmit()}>
            {isEdit ? 'Lưu' : 'Thêm'}
          </Button>
          <Button onClick={() => navigate(-1)}>Trở lại</Button>
        </Box>
      </CardContent>
      {/* {(isCreatePending || isUpdatePending) && <SuspenseLoader />} */}
    </Card>
  );
};

export default OrderUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
