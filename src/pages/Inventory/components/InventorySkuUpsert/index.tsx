import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Input from '@/components/Input';
import SuspenseLoader from '@/components/SuspenseLoader';

import { QueryKeys } from '@/constants/query-key';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
// import {
//   useCreateProductSku,
//   useGetProductSkuById,
//   useUpdateProductSku,
// } from '@/services/ProductSku';
import {
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
  Select,
  SelectChangeEvent,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import {
  useCreateproductSku,
  useGetInitialForCreate,
  useGetProductSkuById,
  useUpdateProductSku,
} from '@/services/product-sku';
import { ICategory } from '@/interfaces/ICategory';
import { IAttribute } from '@/interfaces/IAttribute';
import { useGetProductByCategory } from '@/services/product';

const InventorySkuUpsert = () => {
  const { id } = useParams();
  const isEdit = !!id;

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [categoryId, setCategoryId] = useState<string>('');
  const [attributes, setAttributes] = useState<string[]>([]);
  const [editAttribute, setEditAttribute] = useState<IAttribute[]>([]);

  const { data: productsByCategory } = useGetProductByCategory(categoryId);
  const { data: productSkuData } = useGetProductSkuById(id as string);
  const { data: initData } = useGetInitialForCreate();

  const { mutate: createProductSkuMutate, isPending: isCreatePending } =
    useCreateproductSku();
  const { mutate: updateProductSkuMutate, isPending: isUpdatePending } =
    useUpdateProductSku();

  const formik = useFormik({
    initialValues: {
      product_id: '',
      attributes: '',
      price: '',
      quantity: '',
    },
    // validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      const attributeList = attributes?.map((item) =>
        initData?.attributeList.find((i) => i._id === item)
      );
      const product = productsByCategory?.find(
        (item) => item._id === values.product_id
      );
      const payload = {
        ...values,
        product_name: isEdit ? productSkuData?.product_name : product?.name,
        product_sku: isEdit ? productSkuData?.product_sku : product?.sku_name,
        attributes: attributes,
        sku: `${
          isEdit ? productSkuData?.product_sku : product?.sku_name
        }-${attributeList?.map((item) => item?.atb_sku).join('')}`,
        price: +values.price,
        quantity: +values.quantity,
      };
      if (isEdit) {
        updateProductSkuMutate(
          { _id: id, ...payload },
          {
            onSuccess() {
              queryClient.invalidateQueries({
                queryKey: [QueryKeys.ProductSku],
              });
              showNotification('Cập nhật SKU thành công', 'success');
              navigate(-1);
            },
          }
        );
      } else {
        createProductSkuMutate(payload, {
          onSuccess() {
            queryClient.invalidateQueries({ queryKey: [QueryKeys.ProductSku] });
            showNotification('Tạo SKU thành công', 'success');
            navigate(-1);
          },
        });
      }
    },
  });
  useEffect(() => {
    if (productSkuData) {
      formik.setFieldValue('product_id', productSkuData?.product_id);
      formik.setFieldValue('price', productSkuData?.price);
      formik.setFieldValue('quantity', productSkuData?.quantity);
      setAttributes(productSkuData?.attributes?.map((v) => v));
    }
  }, [productSkuData, initData]);

  useEffect(() => {
    if (isEdit && initData) {
      setEditAttribute(
        initData?.attributeList?.filter((item) =>
          attributes?.includes(item._id)
        )
      );
    }
  }, [attributes, initData, isEdit]);

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    formik.setFieldValue(name, value);
  };

  const handleAttributeChange = (
    e: SelectChangeEvent<string>,
    index: number
  ) => {
    const updatedAtributeList = [...attributes];
    updatedAtributeList[index] = e?.target?.value;
    setAttributes(updatedAtributeList);
  };

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
            {isEdit ? 'Sửa phân loại' : 'Thêm phân loại'}:{' '}
            {isEdit && productSkuData?.product_name}
          </Typography>
        }
      />
      <Divider />

      <CardContent>
        {!isEdit && (
          <>
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
              <InputLabel>Danh mục</InputLabel>
              <Select
                disableUnderline
                size='small'
                onChange={(e) => {
                  setCategoryId(e?.target?.value);
                }}
                value={categoryId}>
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
              <InputLabel>Sản phẩm</InputLabel>
              <Select
                disableUnderline
                size='small'
                name='product_id'
                onChange={handleSelectChange}
                value={formik?.values?.product_id}>
                {productsByCategory?.map((item) => (
                  <MenuItem key={item?._id} value={item?._id}>
                    {item?.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                <Box component={'span'} sx={helperTextStyle}>
                  {formik.errors?.product_id}
                </Box>
              </FormHelperText>
            </FormControl>
          </>
        )}
        <Typography mb={1}>Phân loại:</Typography>
        <Grid2 container rowSpacing={2} columnSpacing={4}>
          {productsByCategory
            ?.find((item) => item?._id === formik?.values?.product_id)
            ?.attributes?.map((item: string, index: number) => (
              <Grid2 size={6} key={item} display={'flex'}>
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
                  <InputLabel>{item}</InputLabel>
                  <Select
                    disableUnderline
                    size='small'
                    onChange={(e) => {
                      handleAttributeChange(e, index);
                    }}
                    value={attributes[index] ?? ''}>
                    {initData?.attributeList
                      ?.filter((a) => a?.name === item)
                      ?.map((item: IAttribute) => (
                        <MenuItem key={item?._id} value={item?._id}>
                          {item?.value}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid2>
            ))}
          {editAttribute?.map((item: IAttribute, index: number) => (
            <Grid2 size={6} key={item?._id} display={'flex'}>
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
                <InputLabel>{item?.name}</InputLabel>
                <Select
                  disableUnderline
                  size='small'
                  onChange={(e) => {
                    handleAttributeChange(e, index);
                  }}
                  value={attributes[index] ?? ''}>
                  {initData?.attributeList
                    ?.filter((a) => a?.name === item?.name)
                    ?.map((item: IAttribute) => (
                      <MenuItem key={item?._id} value={item?._id}>
                        {item?.value}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid2>
          ))}
          <Grid2 size={6}>
            <FormControl fullWidth>
              <Input
                id='price'
                label='Giá'
                name='price'
                variant='filled'
                required
                helperText={
                  <Box component={'span'} sx={helperTextStyle}>
                    {formik.errors.price}
                  </Box>
                }
                value={formik?.values.price}
                onChange={handleChangeValue}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={6}>
            <FormControl fullWidth>
              <Input
                id='quantity'
                label='Số lượng'
                name='quantity'
                variant='filled'
                required
                helperText={
                  <Box component={'span'} sx={helperTextStyle}>
                    {formik.errors.quantity}
                  </Box>
                }
                value={formik?.values.quantity}
                onChange={handleChangeValue}
              />
            </FormControl>
          </Grid2>
        </Grid2>

        <Box sx={{ textAlign: 'end' }}>
          <Button onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            Trở lại
          </Button>
          <Button variant='contained' onClick={() => formik.handleSubmit()}>
            Thêm
          </Button>
        </Box>
      </CardContent>
      {(isCreatePending || isUpdatePending) && <SuspenseLoader />}
    </Card>
  );
};

export default InventorySkuUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
