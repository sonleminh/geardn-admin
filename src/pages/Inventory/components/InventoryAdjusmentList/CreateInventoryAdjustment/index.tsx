import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormHelperText,
  Grid2,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Popper,
  Select,
  SelectChangeEvent,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Theme,
  Typography,
} from '@mui/material';

import Input from '@/components/Input';
import SuspenseLoader from '@/components/SuspenseLoader';

import { QueryKeys } from '@/constants/query-key';
import { ROUTES } from '@/constants/route';
import { useNotificationContext } from '@/contexts/NotificationContext';

import { IProductSku } from '@/interfaces/IProductSku';

import { useGetEnumByContext } from '@/services/enum';
import { useGetProductList } from '@/services/product';
import { useGetSkusByProductId } from '@/services/sku';
import { useGetWarehouseList } from '@/services/warehouse';

import { useCreateAdjustmentLog } from '@/services/inventory';
import { truncateTextByLine } from '@/utils/css-helper.util';
import { formatPrice } from '@/utils/format-price';

interface IAdjustmentItem {
  sku: IProductSku;
  quantityBefore: string;
  quantityChange: string;
  costPriceBefore: string;
}

const schema = Yup.object().shape({
  warehouseId: Yup.string().required('Vui lòng chọn kho hàng'),
  type: Yup.string().required('Vui lòng chọn loại điều chỉnh'),
  reason: Yup.string().required('Vui lòng chọn lý do điều chỉnh'),
  note: Yup.string().optional(),
});

const CreateInventoryAdjustmentPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();

  const [productId, setProductId] = useState<number>();
  const [skuId, setSkuId] = useState<string>('');
  const [quantityBefore, setQuantityBefore] = useState<string>('');
  const [quantityChange, setQuantityChange] = useState<string>('');
  const [isEditItem, setIsEditItem] = useState<boolean>(false);
  const [editItemIndex, setEditItemIndex] = useState<number | null>(null);
  const [adjustmentItems, setAdjustmentItems] = useState<IAdjustmentItem[]>([]);

  const { data: warehousesData } = useGetWarehouseList();
  const { data: adjustmentTypeData } = useGetEnumByContext('adjustment-type');
  const { data: adjustmentReasonData } =
    useGetEnumByContext('adjustment-reason');

  const { data: productsData } = useGetProductList();
  const { data: skusData } = useGetSkusByProductId(productId);

  const { mutate: createAdjustmentLogMutate, isPending: isCreatePending } =
    useCreateAdjustmentLog();

  const formik = useFormik({
    initialValues: {
      warehouseId: '',
      type: '',
      reason: '',
      note: '',
    },
    validationSchema: schema,
    validateOnChange: false,
    onSubmit(values) {
      const payload = {
        warehouseId: +values.warehouseId,
        type: values.type,
        reason: values.reason,
        note: values.note,
        items: adjustmentItems?.map((item) => ({
          skuId: +item.sku.id,
          costPriceBefore: +item.costPriceBefore,
          quantityBefore: +item.quantityBefore,
          quantityChange: +item.quantityChange,
        })),
      };

      createAdjustmentLogMutate(payload, {
        onSuccess() {
          queryClient.invalidateQueries({
            queryKey: [QueryKeys.AdjustmentLog],
          });
          showNotification('Tạo điều chỉnh thành công', 'success');
          navigate(`${ROUTES.INVENTORY}/adjustment`);
        },
      });
    },
  });

  useEffect(() => {
    if (skuId) {
      setQuantityBefore(
        skusData?.data
          ?.find((sku) => sku?.id === +skuId)
          ?.stocks?.find(
            (stock) => stock?.warehouseId === +formik?.values?.warehouseId
          )
          ?.quantity?.toString() ?? ''
      );
    }
  }, [skusData?.data, formik?.values?.warehouseId, skuId]);

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    formik.setFieldValue(name, value);
  };

  const handleSkuSelect = (event: SelectChangeEvent<string>) => {
    setSkuId(event.target.value);
  };

  const handleSaveItem = () => {
    const isAlreadySelected = adjustmentItems.some((item) => {
      return item?.sku?.id === +skuId;
    });
    if (isAlreadySelected && !isEditItem) {
      return showNotification('Sku đã tồn tại', 'error');
    }

    const sku = skusData?.data?.find((sku) => sku?.id === +skuId);

    if (editItemIndex !== null && sku && skuId) {
      const updatedAdjustmentItems = adjustmentItems;
      updatedAdjustmentItems[editItemIndex] = {
        sku: sku,
        costPriceBefore:
          sku?.stocks
            ?.find(
              (stock) => stock?.warehouseId === +formik?.values?.warehouseId
            )
            ?.costPrice?.toString() ?? '',
        quantityBefore:
          sku?.stocks
            ?.find(
              (stock) => stock?.warehouseId === +formik?.values?.warehouseId
            )
            ?.quantity?.toString() ?? '',
        quantityChange: quantityChange,
      };
      setAdjustmentItems(updatedAdjustmentItems);
      setProductId(undefined);
      setSkuId('');
      setQuantityChange('');
    } else {
      if (sku && skuId && quantityChange) {
        setAdjustmentItems((prev) => [
          ...prev,
          {
            sku: sku,
            quantityBefore:
              sku?.stocks
                ?.find(
                  (stock) => stock?.warehouseId === +formik?.values?.warehouseId
                )
                ?.quantity?.toString() ?? '',
            quantityChange: quantityChange,
            costPriceBefore:
              sku?.stocks
                ?.find(
                  (stock) => stock?.warehouseId === +formik?.values?.warehouseId
                )
                ?.costPrice?.toString() ?? '',
          },
        ]);
      }
      setProductId(undefined);
      setSkuId('');
      setQuantityChange('');
    }
  };

  const handleEditImportItem = (item: IAdjustmentItem, index: number) => {
    setIsEditItem(true);
    setProductId(item?.sku?.product?.id);
    setSkuId(item?.sku?.id?.toString() ?? '');
    setQuantityChange(item?.quantityBefore.toString() ?? '');
    setEditItemIndex(index);
  };

  const handleDeleteImportItem = (itemIndex: number) => {
    const updAttributeList = adjustmentItems?.filter(
      (_, index) => index !== itemIndex
    );
    if (updAttributeList?.length === 0) {
      setIsEditItem(false);
    }
    setAdjustmentItems(updAttributeList);
  };

  const handleDeleteCurrentItem = () => {
    setProductId(undefined);
    setSkuId('');
    setQuantityChange('');
  };

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={() => navigate(`${ROUTES.INVENTORY}/adjustment`)}
              sx={{ mr: 1 }}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
              Tạo điều chỉnh
            </Typography>
          </Box>
        }
      />
      <Divider />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl variant='filled' fullWidth>
          <InputLabel>Kho hàng</InputLabel>
          <Select
            disableUnderline
            required
            size='small'
            name='warehouseId'
            onChange={handleSelectChange}
            value={formik?.values?.warehouseId ?? ''}>
            {warehousesData?.data?.map((item) => (
              <MenuItem key={item?.name} value={item?.id}>
                {item?.name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            <Box component={'span'} sx={helperTextStyle}>
              {formik.errors?.warehouseId}
            </Box>
          </FormHelperText>
        </FormControl>
        <FormControl variant='filled' fullWidth>
          <InputLabel>Loại điều chỉnh</InputLabel>
          <Select
            disableUnderline
            required
            size='small'
            name='type'
            onChange={handleSelectChange}
            value={formik?.values?.type ?? ''}>
            {adjustmentTypeData?.data?.map((item) => (
              <MenuItem key={item?.value} value={item?.value}>
                {item?.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            <Box component={'span'} sx={helperTextStyle}>
              {formik.errors?.type}
            </Box>
          </FormHelperText>
        </FormControl>
        <FormControl variant='filled' fullWidth>
          <InputLabel>Lý do điều chỉnh</InputLabel>
          <Select
            disableUnderline
            required
            size='small'
            name='reason'
            onChange={handleSelectChange}
            value={formik?.values?.reason ?? ''}>
            {adjustmentReasonData?.data?.map((item) => (
              <MenuItem key={item?.value} value={item?.value}>
                {item?.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            <Box component={'span'} sx={helperTextStyle}>
              {formik.errors?.reason}
            </Box>
          </FormHelperText>
        </FormControl>
        <Grid2 container spacing={2}>
          <Grid2 size={6}>
            <Box>
              <Typography sx={{ mb: 2 }}>Thêm loại hàng:</Typography>
              <Grid2 container spacing={2}>
                <Grid2 size={12}>
                  <FormControl variant='filled' fullWidth>
                    <Autocomplete
                      disablePortal
                      options={productsData?.data ?? []}
                      renderInput={(params) => (
                        <TextField {...params} label='Sản phẩm' />
                      )}
                      onChange={(e, value) => setProductId(value?.id)}
                      value={
                        productsData?.data.find(
                          (item) => item.id === productId
                        ) ?? null
                      }
                      getOptionLabel={(option) => option?.name ?? ''}
                      PopperComponent={(props) => (
                        <Popper
                          {...props}
                          placement='bottom-start'
                          modifiers={[
                            {
                              name: 'flip',
                              enabled: false,
                            },
                          ]}
                        />
                      )}
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={12}>
                  <FormControl variant='filled' fullWidth>
                    <InputLabel>Loại sản phấm</InputLabel>
                    <Select
                      disableUnderline
                      required
                      size='small'
                      name='skuId'
                      onChange={handleSkuSelect}
                      value={skuId ?? ''}
                      disabled={!productId || !skusData}>
                      {skusData?.data?.map((item) => (
                        <MenuItem key={item?.id} value={item?.id}>
                          <Typography
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              width: '100%',
                              fontSize: 14,
                            }}>
                            <Typography component={'span'}>
                              {item?.productSkuAttributes?.length
                                ? item?.productSkuAttributes
                                    ?.map(
                                      (item) =>
                                        `${item?.attributeValue?.attribute?.label}:
                                  ${item?.attributeValue?.value}
                                `
                                    )
                                    .join('- ')
                                : ''}
                            </Typography>
                            <Typography
                              component={'span'}
                              sx={{ fontWeight: 500 }}>
                              {item?.sku}
                            </Typography>
                          </Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid2>
                <Grid2 size={12}>
                  <FormControl fullWidth>
                    <Input
                      id='quantityBefore'
                      label='Số lượng cũ'
                      variant='filled'
                      type='number'
                      disabled
                      value={quantityBefore}
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={12}>
                  <FormControl fullWidth>
                    <Input
                      id='quantityChange'
                      label='Số lượng điều chỉnh'
                      name='quantityChange'
                      variant='filled'
                      type='number'
                      required
                      value={quantityChange}
                      onChange={(e) => setQuantityChange(e?.target?.value)}
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={12}>
                  <FormControl fullWidth>
                    <Input
                      id='note'
                      label='Ghi chú'
                      name='note'
                      variant='filled'
                      helperText={
                        <Box component={'span'} sx={helperTextStyle}>
                          {formik?.errors?.note}
                        </Box>
                      }
                      value={formik?.values?.note ?? ''}
                      onChange={handleChangeValue}
                    />
                  </FormControl>
                </Grid2>
                <Box sx={{ display: 'flex', ml: 'auto' }}>
                  <Typography sx={helperTextStyle}></Typography>
                  <Button
                    sx={{ ml: 2, textTransform: 'initial' }}
                    variant='contained'
                    disabled={!productId || !skuId || !quantityChange}
                    onClick={handleSaveItem}>
                    Lưu
                  </Button>
                  <Button
                    sx={{ ml: 2, textTransform: 'initial' }}
                    variant='outlined'
                    onClick={handleDeleteCurrentItem}
                    disabled={!productId || !skuId || !quantityChange}>
                    Xóa
                  </Button>
                </Box>
              </Grid2>
            </Box>
          </Grid2>
          <Grid2 size={6}>
            <Box>
              <Typography sx={{ mb: 2 }}>Danh sách hàng:</Typography>
              <TableContainer component={Paper}>
                <Table sx={{}} aria-label='simple table'>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: '5%', px: 1 }} align='center'>
                        STT
                      </TableCell>
                      <TableCell sx={{ width: '35%', px: 0 }} align='center'>
                        Sản phẩm
                      </TableCell>
                      <TableCell sx={{ width: '12%', px: 1 }} align='center'>
                        SL cũ
                      </TableCell>
                      <TableCell sx={{ width: '12%', px: 1 }} align='center'>
                        SL mới
                      </TableCell>
                      <TableCell sx={{ width: '15%', px: 1 }} align='center'>
                        Giá
                      </TableCell>
                      <TableCell sx={{ width: '25%' }} align='center'>
                        Tuỳ chọn
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {adjustmentItems?.length ? (
                      adjustmentItems.map((item, index) => (
                        <TableRow
                          key={item?.sku?.id}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                          }}>
                          <TableCell
                            sx={{ px: 1, fontSize: 13 }}
                            component='th'
                            scope='row'
                            align='center'>
                            {index + 1}
                          </TableCell>
                          <TableCell sx={{ px: 0 }} align='center'>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  position: 'relative',
                                  height: '42px',
                                  '.thumbnail': {
                                    maxWidth: 42,
                                    maxHeight: 42,
                                    mr: 1,
                                    border: '1px solid #dadada',
                                  },
                                }}>
                                <img
                                  src={
                                    item?.sku?.imageUrl ??
                                    item?.sku?.product?.images?.[0]
                                  }
                                  className='thumbnail'
                                />
                              </Box>
                              <Typography
                                sx={{ fontSize: 13, ...truncateTextByLine(1) }}>
                                {item?.sku?.productSkuAttributes
                                  ?.map((item) => item?.attributeValue?.value)
                                  .join(' - ')}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ px: 1 }} align='center'>
                            {item.quantityBefore}
                          </TableCell>
                          <TableCell sx={{ px: 1 }} align='center'>
                            {item.quantityChange}
                          </TableCell>
                          <TableCell sx={{ fontSize: 12 }} align='right'>
                            {formatPrice(+item?.costPriceBefore)}
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
                                handleEditImportItem(item, index);
                              }}>
                              <EditOutlinedIcon sx={{ fontSize: 14 }} />
                            </Button>
                            <Button
                              sx={{ minWidth: 20, width: 20, height: 30 }}
                              variant='outlined'
                              onClick={() => handleDeleteImportItem(index)}>
                              <DeleteOutlineOutlinedIcon
                                sx={{ fontSize: 14 }}
                              />
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
              </TableContainer>
            </Box>
          </Grid2>
        </Grid2>

        <Box sx={{ textAlign: 'end' }}>
          <Button
            onClick={() => navigate(`${ROUTES.INVENTORY}/adjustment`)}
            sx={{ mr: 2 }}>
            Trở lại
          </Button>
          <Button variant='contained' onClick={() => formik.handleSubmit()}>
            Thêm
          </Button>
        </Box>
      </CardContent>
      {isCreatePending && <SuspenseLoader />}
    </Card>
  );
};

export default CreateInventoryAdjustmentPage;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
