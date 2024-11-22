import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Input from '@/components/Input';
import { QueryKeys } from '@/constants/query-key';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { ICategory } from '@/interfaces/ICategory';
import { IModel } from '@/interfaces/IModel';
import { IOrderItem } from '@/interfaces/IOrder';
import { useGetInitialForCreate } from '@/services/model';
import {
  useCreateOrder,
  useGetDistrict,
  useGetOrderById,
  useGetProvinces,
  useUpdateOrder,
} from '@/services/order';
import { useGetPaymentById } from '@/services/payment';
import { useGetProductByCategory, useGetProductById } from '@/services/product';
import { formatPrice } from '@/utils/format-price';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
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
  TableHead,
  TableRow,
  Theme,
  Typography,
} from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useFormik } from 'formik';
import moment, { Moment } from 'moment';
import { createSchema, updateSchema } from '../utils/schema/orderSchema';
import SuspenseLoader from '@/components/SuspenseLoader';

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
  const [matchedModel, setMatchedModel] = useState<IModel>();

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isOrderItemEdit, setIsOrderItemEdit] = useState<boolean>(false);
  const [modelIdEdit, setModelIdEdit] = useState<string>('');
  const [itemIndex, setItemIndex] = useState<number | null>(null);

  const [shopAddress, setShopAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [ward, setWard] = useState<string>('');
  const [detailAddress, setDetailAddress] = useState<string>('');

  const { data: orderData } = useGetOrderById(id as string);
  const { data: productsByCategory } = useGetProductByCategory(categoryId);
  const { data: product } = useGetProductById(productId);
  const { data: initData } = useGetInitialForCreate();
  const { data: provinces } = useGetProvinces();
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
        flag: {
          is_online_order: false,
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

  useEffect(() => {
    if (product && selectedModel.length > 0) {
      const matchedModel = product?.models?.find(
        (model) =>
          JSON.stringify(model?.extinfo?.tier_index) ===
          JSON.stringify(selectedModel)
      );
      setMatchedModel(matchedModel);
      // return matchedModel && isOrderItemEdit
      //   ? matchedModel?.stock
      //   : matchedModel?.stock;
    } else if (
      product &&
      selectedModel.length === 0 &&
      product?.models?.length === 1
    ) {
      setMatchedModel(product?.models?.[0]);
    }
  }, [product, selectedModel]);

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
  }, [orderData, districtData]);

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
    if (
      !isOrderItemEdit &&
      orderItems?.find((item) => item?.model_id === matchedModel?._id)
    ) {
      return showNotification('Sản phẩm đã có trong danh sách!', 'error');
    }
    if (
      matchedModel &&
      +quantity >
        (orderData &&
        isOrderItemEdit &&
        itemIndex &&
        itemIndex < orderData?.items?.length
          ? matchedModel?.stock + orderData?.items?.[itemIndex ?? 0]?.quantity
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
    setProductId(item?.product_id);
    setModelIdEdit(item?.model_id);
    setQuantity(`${item?.quantity}`);
    setItemIndex(index);
  };

  const handleDeleteOrderItem = (index: number) => {
    const updatedOrderItems = [...orderItems];
    updatedOrderItems.splice(index, 1);
    setOrderItems(updatedOrderItems);
  };

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
                <FormControl sx={selectStyle} variant='filled' fullWidth>
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
                <FormControl variant='filled' fullWidth sx={selectStyle}>
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
                <FormControl variant='filled' fullWidth sx={selectStyle}>
                  <InputLabel>Phường/Xã</InputLabel>
                  <Select
                    disableUnderline
                    size='small'
                    onChange={handleWardChange}
                    value={
                      district &&
                      districtData?.wards?.some((item) => item.name === ward)
                        ? ward
                        : ''
                    }
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
                <FormControl
                  fullWidth
                  sx={{
                    '.MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0,0,0,0.23) !important',
                    },
                  }}>
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
                      value={moment(formik?.values?.shipment?.delivery_date)}
                    />
                  </LocalizationProvider>
                </FormControl>
              </Grid2>
            </>
          ) : (
            <Grid2 size={12}>
              <FormControl variant='filled' fullWidth sx={selectStyle}>
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
            <Typography>Thêm sản phẩm:</Typography>
            <FormControl
              variant='filled'
              margin='dense'
              fullWidth
              sx={selectStyle}>
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
              margin='dense'
              fullWidth
              sx={selectStyle}>
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
                    disabled={!item?.original_price}>
                    {item?.name} {!item?.original_price && '- (Hết hàng)'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {product?.tier_variations?.map((item, vIndex) => (
              <FormControl
                sx={selectStyle}
                key={item?.name}
                variant='filled'
                margin='dense'
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
                    <Typography>
                      Kho:{' '}
                      {isEdit &&
                      orderData &&
                      matchedModel &&
                      isOrderItemEdit &&
                      itemIndex &&
                      itemIndex > orderData?.items?.length &&
                      !orderData?.items[itemIndex]
                        ? matchedModel?.stock +
                          orderData?.items?.[itemIndex ?? 0]?.quantity
                        : matchedModel?.stock}
                    </Typography>
                  </Grid2>
                </Grid2>
              </Box>
            )}
            <FormControl sx={{ mb: 2 }} fullWidth>
              <Input
                label='Số lượng'
                name='quantity'
                variant='filled'
                margin='dense'
                size='small'
                type='number'
                disabled={!isEdit && matchedModel?.stock === 0 ? true : false}
                onKeyDown={(e) => {
                  if (e.key === '-') {
                    e.preventDefault();
                  }
                  if (quantity === '' && (e.key === '0' || e.key === 'Enter')) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  if (matchedModel && +value > matchedModel?.stock) {
                    console.log('>');
                    setQuantity(matchedModel?.stock.toString());
                  } else {
                    setQuantity(value ? parseInt(value, 10)?.toString() : '');
                  }
                }}
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
                        <TableCell sx={{ fontSize: 12 }} align='right'>
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
      {(isCreatePending || isUpdatePending) && <SuspenseLoader />}
    </Card>
  );
};

export default OrderUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};

const selectStyle: SxProps<Theme> = {
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
};
