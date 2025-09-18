import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  Autocomplete,
  Box,
  Breadcrumbs,
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
  Link,
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
import { useAlertContext } from '@/contexts/AlertContext';
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
  unitCost: string;
}

const schema = Yup.object().shape({
  warehouseId: Yup.string().required('Vui lòng chọn kho hàng'),
  type: Yup.string().required('Vui lòng chọn loại nhập hàng'),
  note: Yup.string().optional(),
});

const CreateInventoryImportPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showAlert } = useAlertContext();

  const [productId, setProductId] = useState<number>();
  const [skuId, setSkuId] = useState<string>('');
  const [unitCost, setunitCost] = useState<string>('');
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
  const { data: skusData } = useGetSkusByProductId({
    id: productId,
    state: 'active',
  });

  const { mutate: createImportLogMutate, isPending: isCreatePending } =
    useCreateImportLog();

  const formik = useFormik({
    initialValues: {
      warehouseId: '',
      type: '',
      note: '',
      importDate: new Date(),
    },
    validationSchema: schema,
    validateOnChange: false,
    onSubmit(values) {
      const payload = {
        warehouseId: +values.warehouseId,
        type: values.type,
        note: values.note,
        importDate: formik?.values?.importDate,
        items: importItems?.map((item) => ({
          skuId: +item.sku.id,
          unitCost: +item.unitCost,
          quantity: +item.quantity,
        })),
      };

      createImportLogMutate(payload, {
        onSuccess() {
          queryClient.invalidateQueries({ queryKey: [QueryKeys.ImportLog] });
          showAlert('Tạo nhập hàng thành công', 'success');
          navigate(`${ROUTES.INVENTORY}/import`);
        },
      });
    },
  });

  useEffect(() => {
    if (transferFromWarehouseId && skuId) {
      setunitCost(
        skusData?.data
          ?.find((sku) => sku?.id === +skuId)
          ?.stocks?.find(
            (stock) => stock?.warehouseId === +transferFromWarehouseId
          )
          ?.unitCost?.toString() ?? ''
      );
    }
  }, [skusData?.data, transferFromWarehouseId, skuId]);

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
      return showAlert('Sku đã tồn tại', 'error');
    }

    const sku = skusData?.data?.find((sku) => sku?.id === +skuId);

    if (editItemIndex !== null && sku && skuId) {
      const updatedImportItems = importItems;
      updatedImportItems[editItemIndex] = {
        sku: sku,
        unitCost: unitCost,
        quantity: quantity,
      };
      setImportItems(updatedImportItems);
      setProductId(undefined);
      setSkuId('');
      setunitCost('');
      setQuantity('');
    } else {
      if (sku && skuId && quantity && unitCost) {
        setImportItems((prev) => [
          ...prev,
          { sku: sku, quantity: quantity, unitCost: unitCost },
        ]);
      }
      setProductId(undefined);
      setSkuId('');
      setunitCost('');
      setQuantity('');
    }
  };

  const handleEditImportItem = (item: IImportItem, index: number) => {
    setIsEditItem(true);
    setProductId(item?.sku?.product?.id);
    setSkuId(item?.sku?.id?.toString() ?? '');
    setunitCost(item?.unitCost.toString() ?? '');
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
    setunitCost('');
    setQuantity('');
  };

  const handleTransferFromWarehouseSelect = (
    event: SelectChangeEvent<string>
  ) => {
    setTransferFromWarehouseId(+event.target.value);
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
          onClick={() => navigate(`${ROUTES.INVENTORY}/import`)}
          sx={{ cursor: 'pointer' }}>
          Nhập hàng
        </Link>
        <Typography color='text.primary'>Tạo nhập hàng</Typography>
      </Breadcrumbs>
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
            <InputLabel>Loại nhập hàng</InputLabel>
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
            </FormControl>
          )}

          <FormControl
            sx={{
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0,0,0,0.23) !important',
              },
              '.date-picker': {
                width: '100%',
                height: 50,
                pl: 5,
                fontSize: 15,
              },
              '.react-datepicker__calendar-icon': {
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
              },
            }}
            fullWidth
            margin='dense'>
            <Typography sx={{ mb: 1 }}>Thời gian nhập hàng:</Typography>
            <DatePicker
              showTimeSelect
              showIcon
              icon={<CalendarTodayOutlinedIcon />}
              selected={formik?.values?.importDate}
              onChange={(e) => formik.setFieldValue('importDate', e)}
              dateFormat='dd/MM/yyyy HH:mm'
              timeFormat='HH:mm'
              className='date-picker'
            />
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
                        onChange={(_, value) => setProductId(value?.id)}
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
                                    : 'Không có phân loại'}
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
                    </FormControl>
                  </Grid2>
                  <Grid2 size={12}>
                    <FormControl fullWidth>
                      <Input
                        id='unitCost'
                        label='Giá nhập'
                        name='unitCost'
                        variant='filled'
                        type='number'
                        disabled={formik?.values?.type === 'TRANSFER'}
                        value={unitCost}
                        onChange={(e) => setunitCost(e?.target?.value)}
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
                      disabled={!productId || !skuId || !unitCost || !quantity}
                      onClick={handleSaveItem}>
                      Lưu
                    </Button>
                    <Button
                      sx={{ ml: 2, textTransform: 'initial' }}
                      variant='outlined'
                      onClick={handleDeleteCurrentItem}
                      disabled={!productId || !skuId || !unitCost || !quantity}>
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
                  <Table aria-label='simple table'>
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
                              <Box
                                sx={{ display: 'flex', alignItems: 'center' }}>
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
                                  sx={{
                                    fontSize: 13,
                                    ...truncateTextByLine(1),
                                  }}>
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
                              {formatPrice(+item?.unitCost)}
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
    </>
  );
};

export default CreateInventoryImportPage;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
