import { ChangeEvent, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Input from '@/components/Input';
import SuspenseLoader from '@/components/SuspenseLoader';

import { QueryKeys } from '@/constants/query-key';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';

import { ROUTES } from '@/constants/route';
import {
  useCreateWarehouse,
  useGetWarehouseById,
  useGetWarehouseList,
  useUpdateWarehouse,
} from '@/services/warehouse';
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
  InputLabel,
  MenuItem,
  Popper,
  Select,
  SelectChangeEvent,
  SxProps,
  TextField,
  Theme,
  Typography,
} from '@mui/material';
import { createSchema, updateSchema } from '../utils/schema/warehouseSchema';
import { useGetEnumByContext } from '@/services/enum';
import { useGetProductList } from '@/services/product';
import { useGetSkusByProductId } from '@/services/sku';

const ImportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();

  const isEdit = !!id;

  const numericId = id ? Number(id) : undefined;

  const [productId, setProductId] = useState<number>();
  const [skuId, setSkuId] = useState<number>();
  const [price, setPrice] = useState<number>();
  const [quantity, setQuantity] = useState<number>();
  const [isEditItem, setIsEditItem] = useState<boolean>(false);
  const [editItemIndex, setEditItemIndex] = useState<number>();
  const [importItems, setImportItems] =
    useState<{ skuId: number; quantity: number; price: number }[]>();

  const { data: warehousesData } = useGetWarehouseList();
  const { data: warehouseData } = useGetWarehouseById(numericId as number);
  const { data: enumData } = useGetEnumByContext('import-type');

  const { data: productsData } = useGetProductList();
  const { data: skusData } = useGetSkusByProductId(productId);

  const { mutate: createImportMutate, isPending: isCreatePending } =
    useCreateWarehouse();

  const formik = useFormik({
    initialValues: {
      warehouseId: '',
      type: '',
      note: '',
    },
    validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      // if (isEdit) {
      //   updateWarehouseMutate(
      //     { id: +id, ...values },
      //     {
      //       onSuccess() {
      //         queryClient.invalidateQueries({
      //           queryKey: [QueryKeys.Warehouse],
      //         });
      //         showNotification('Cập nhật kho hàng thành công', 'success');
      //         navigate(ROUTES.WAREHOUSE);
      //       },
      //     }
      //   );
      // } else {
      //   createWarehouseMutate(values, {
      //     onSuccess() {
      //       queryClient.invalidateQueries({ queryKey: [QueryKeys.Warehouse] });
      //       showNotification('Tạo kho hàng thành công', 'success');
      //       navigate(ROUTES.WAREHOUSE);
      //     },
      //   });
      // }
    },
  });

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    formik.setFieldValue(name, value);
  };

  const handleSaveItem = () => {
    if (importItems?.find((item) => item.skuId === skuId)) {
      return showNotification('Sku đã tồn tại', 'error');
    }

    if (editAttIndex !== null && attributeValueId) {
      const updatedAttributeList = attributeList;
      updatedAttributeList[editAttIndex] = {
        attributeId: attributeId,
        attributeValueId: attributeValueId,
      };
      setAttributeList(updatedAttributeList);
      setAttributeValueId('');
      setAttributeId('');
    } else {
      if (attributeValueId) {
        setAttributeList((prev) => [
          ...prev,
          { attributeId: attributeId, attributeValueId: attributeValueId },
        ]);
      }
      setAttributeValueId('');
      setAttributeId('');
    }
    setImportItems([
      ...importItems,
      {
        skuId: skuId as number,
        quantity: quantity as number,
        price: price as number,
      },
    ]);
    setSkuId(undefined);
    setQuantity(undefined);
    setPrice(undefined);
  };

  console.log('skusData:', skusData?.data?.[0]);

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
            Nhập hàng
          </Typography>
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
                      name='type'
                      onChange={handleSelectChange}
                      value={formik?.values?.type ?? ''}
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
                      id='price'
                      label='Giá nhập'
                      name='name'
                      variant='filled'
                      required
                      // helperText={
                      //   <Box component={'span'} sx={helperTextStyle}>
                      //     {formik.errors.price}
                      //   </Box>
                      // }
                      value={price}
                      onChange={() => setQuantity(price)}
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
                      required
                      // helperText={
                      //   <Box component={'span'} sx={helperTextStyle}>
                      //     {formik.errors.price}
                      //   </Box>
                      // }
                      value={quantity}
                      onChange={() => setQuantity(quantity)}
                    />
                  </FormControl>
                </Grid2>
                <Box sx={{ display: 'flex', ml: 'auto' }}>
                  <Typography sx={helperTextStyle}>
                    {/* {optionError} */}
                  </Typography>
                  <Button
                    sx={{ ml: 2, textTransform: 'initial' }}
                    variant='contained'
                    // disabled={
                    //   !variantName || attributeList?.length === 0
                    //     ? true
                    //     : false
                    // }
                    // disabled={!attributeValueId}
                    onClick={() => handleSaveItem}>
                    Lưu
                  </Button>
                  <Button
                    sx={{ ml: 2, textTransform: 'initial' }}
                    variant='outlined'
                    // onClick={handleDelBtn}
                    // disabled={
                    //   attributeId?.length <= 0 && attributeValueId?.length <= 0
                    // }
                  >
                    Xóa
                  </Button>
                  {/* <Button
                      sx={{
                        ml: 2,
                        textTransform: 'initial',
                        color: '#D03739',
                        border: '1px solid #D03739',
                      }}
                      variant='outlined'
                      onClick={handleDelAllVariant}
                    >
                      Xóa tất cả
                    </Button> */}
                </Box>
              </Grid2>
            </Box>
          </Grid2>
          <Grid2 size={6}>
            <Box>
              <Typography sx={{ mb: 2 }}>Danh sách hàng:</Typography>
            </Box>
          </Grid2>
        </Grid2>

        <Box sx={{ textAlign: 'end' }}>
          <Button onClick={() => navigate(ROUTES.WAREHOUSE)} sx={{ mr: 2 }}>
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

export default ImportPage;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
