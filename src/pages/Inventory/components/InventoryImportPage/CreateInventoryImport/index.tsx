import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';

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
import { useNotificationContext } from '@/contexts/NotificationContext';
import { ROUTES } from '@/constants/route';
import { IProductSku } from '@/interfaces/IProductSku';

import { useGetEnumByContext } from '@/services/enum';
import { useCreateImportLog } from '@/services/inventory';
import { useGetProductList } from '@/services/product';
import { useGetSkusByProductId } from '@/services/sku';
import { useGetWarehouseList } from '@/services/warehouse';

import { truncateTextByLine } from '@/utils/css-helper.util';
import { formatPrice } from '@/utils/format-price';

interface IImportItem {
  sku: IProductSku;
  quantity: string;
  costPrice: string;
}

const CreateInventoryImportPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();

  const [productId, setProductId] = useState<number>();
  const [skuId, setSkuId] = useState<string>('');
  const [costPrice, setCostPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [isEditItem, setIsEditItem] = useState<boolean>(false);
  const [editItemIndex, setEditItemIndex] = useState<number | null>(null);
  const [transferFromWarehouseId, setTransferFromWarehouseId] = useState<
    number | null
  >(null);
  const [importItems, setImportItems] = useState<IImportItem[]>([]);

  const { data: warehousesData } = useGetWarehouseList();
  const { data: enumData } = useGetEnumByContext('import-type');

  const { data: productsData } = useGetProductList();
  const { data: skusData } = useGetSkusByProductId(productId);

  const { mutate: createImportLogMutate, isPending: isCreatePending } =
    useCreateImportLog();

  const formik = useFormik({
    initialValues: {
      warehouseId: '',
      type: '',
      note: '',
    },
    // validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      const payload = {
        warehouseId: +values.warehouseId,
        type: values.type,
        note: values.note,
        items: importItems?.map((item) => ({
          skuId: +item.sku.id,
          costPrice: +item.costPrice,
          quantity: +item.quantity,
        })),
      };

      createImportLogMutate(payload, {
        onSuccess() {
          queryClient.invalidateQueries({ queryKey: [QueryKeys.ImportLog] });
          showNotification('Tạo nhập hàng thành công', 'success');
          navigate(`${ROUTES.INVENTORY}/import`);
        },
      });
    },
  });

  useEffect(() => {
    if (transferFromWarehouseId && skuId) {
      setCostPrice(
        skusData?.data
          ?.find((sku) => sku?.id === +skuId)
          ?.stocks?.find(
            (stock) => stock?.warehouseId === +transferFromWarehouseId
          )
          ?.costPrice?.toString() ?? ''
      );
    }
  }, [transferFromWarehouseId, skuId]);

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
    const isAlreadySelected = importItems.some((item) => {
      return item?.sku?.id === +skuId;
    });
    if (isAlreadySelected && !isEditItem) {
      return showNotification('Sku đã tồn tại', 'error');
    }

    const sku = skusData?.data?.find((sku) => sku?.id === +skuId);

    if (editItemIndex !== null && sku && skuId) {
      const updatedImportItems = importItems;
      updatedImportItems[editItemIndex] = {
        sku: sku,
        costPrice: costPrice,
        quantity: quantity,
      };
      setImportItems(updatedImportItems);
      setProductId(undefined);
      setSkuId('');
      setCostPrice('');
      setQuantity('');
    } else {
      if (sku && skuId && quantity && costPrice) {
        setImportItems((prev) => [
          ...prev,
          { sku: sku, quantity: quantity, costPrice: costPrice },
        ]);
      }
      setProductId(undefined);
      setSkuId('');
      setCostPrice('');
      setQuantity('');
    }
  };

  const handleEditImportItem = (item: IImportItem, index: number) => {
    setIsEditItem(true);
    setProductId(item?.sku?.product?.id);
    setSkuId(item?.sku?.id?.toString() ?? '');
    setCostPrice(item?.costPrice.toString() ?? '');
    setQuantity(item?.quantity.toString() ?? '');
    setEditItemIndex(index);
  };

  const handleDeleteImportItem = (itemIndex: number) => {
    const updAttributeList = importItems?.filter(
      (_, index) => index !== itemIndex
    );
    if (updAttributeList?.length === 0) {
      setIsEditItem(false);
    }
    setImportItems(updAttributeList);
  };

  const handleDeleteCurrentItem = () => {
    setProductId(undefined);
    setSkuId('');
    setCostPrice('');
    setQuantity('');
  };

  const handleTransferFromWarehouseSelect = (
    event: SelectChangeEvent<string>
  ) => {
    setTransferFromWarehouseId(+event.target.value);
  };

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={() => navigate(`${ROUTES.INVENTORY}/import`)}
              sx={{ mr: 1 }}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
              Nhập hàng
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
          <InputLabel>Loại nhập</InputLabel>
          <Select
            disableUnderline
            required
            size='small'
            name='type'
            onChange={handleSelectChange}
            value={formik?.values?.type ?? ''}>
            {enumData?.data?.map((item) => (
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
        {formik?.values?.type === 'TRANSFER' && (
          <FormControl variant='filled' fullWidth>
            <InputLabel>Chuyển từ kho</InputLabel>
            <Select
              disableUnderline
              required
              size='small'
              name='type'
              onChange={handleTransferFromWarehouseSelect}
              value={transferFromWarehouseId?.toString() ?? ''}>
              {warehousesData?.data
                ?.filter((item) => item?.id !== +formik?.values?.warehouseId)
                ?.map((item) => (
                  <MenuItem key={item?.name} value={item?.id}>
                    {item?.name}
                  </MenuItem>
                ))}
            </Select>
            <FormHelperText>
              <Box component={'span'} sx={helperTextStyle}>
                {formik.errors?.type}
              </Box>
            </FormHelperText>
          </FormControl>
        )}
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
                      {skusData?.data?.length ? (
                        skusData?.data?.map((item) => (
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
                        ))
                      ) : (
                        <MenuItem value=''>
                          <Typography sx={{ fontSize: 14 }}>
                            Không có loại sản phấm
                          </Typography>
                        </MenuItem>
                      )}
                    </Select>
                    <FormHelperText>
                      <Box component={'span'} sx={helperTextStyle}>
                        {formik.errors?.type}
                      </Box>
                    </FormHelperText>
                  </FormControl>
                </Grid2>
                <Grid2 size={12}>
                  <FormControl fullWidth>
                    <Input
                      id='costPrice'
                      label='Giá nhập'
                      name='costPrice'
                      variant='filled'
                      type='number'
                      required
                      disabled={formik?.values?.type === 'TRANSFER'}
                      // helperText={
                      //   <Box component={'span'} sx={helperTextStyle}>
                      //     {formik.errors.price}
                      //   </Box>
                      // }
                      value={costPrice}
                      onChange={(e) => setCostPrice(e?.target?.value)}
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={12}>
                  <FormControl fullWidth>
                    <Input
                      id='quantity'
                      label='Số lượng'
                      name='quantity'
                      variant='filled'
                      type='number'
                      required
                      // helperText={
                      //   <Box component={'span'} sx={helperTextStyle}>
                      //     {formik.errors.price}
                      //   </Box>
                      // }
                      value={quantity}
                      onChange={(e) => setQuantity(e?.target?.value)}
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
                    disabled={!productId || !skuId || !costPrice || !quantity}
                    onClick={handleSaveItem}>
                    Lưu
                  </Button>
                  <Button
                    sx={{ ml: 2, textTransform: 'initial' }}
                    variant='outlined'
                    onClick={handleDeleteCurrentItem}
                    disabled={!productId || !skuId || !costPrice || !quantity}>
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
                      <TableCell sx={{ width: '3%', px: 1 }} align='center'>
                        STT
                      </TableCell>
                      <TableCell sx={{ width: '30%', px: 0 }} align='center'>
                        Sản phẩm
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
                    {importItems?.length ? (
                      importItems.map((item, index) => (
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
                            {item.quantity}
                          </TableCell>
                          <TableCell sx={{ fontSize: 12 }} align='right'>
                            {formatPrice(+item?.costPrice)}
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
                {/* <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'end',
                    alignItems: 'center',
                    width: '100%',
                    px: 4,
                    py: 1,
                  }}>
                  <Typography sx={{ mr: 4, fontSize: 14 }}>
                    Tổng tiền:
                  </Typography>
                  <Typography>{formatPrice(totalAmount())}</Typography>
                </Box> */}
              </TableContainer>
              {/* <Box>
                {importItems?.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          position: 'relative',
                          height: '48px',
                          mr: 1,
                          '.thumbnail': {
                            maxWidth: 48,
                            maxHeight: 48,
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
                      <Typography sx={{ fontSize: 14 }}>
                        {item?.sku?.productSkuAttributes
                          ?.map((item) => item?.attributeValue?.value)
                          .join('- ')}
                      </Typography>
                    </Box>
                    <Typography>{item?.sku?.sku}</Typography>
                    <Typography>{item?.quantity}</Typography>
                  </Box>
                ))}
              </Box> */}
            </Box>
          </Grid2>
        </Grid2>

        <Box sx={{ textAlign: 'end' }}>
          <Button onClick={() => navigate(ROUTES.INVENTORY)} sx={{ mr: 2 }}>
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

export default CreateInventoryImportPage;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
