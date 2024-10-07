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
  useGetproductSkuById,
  useUpdateProductSku,
} from '@/services/product-sku';
import { ICategory } from '@/interfaces/ICategory';
import { IAttribute } from '@/interfaces/IAttribute';
import { useGetProductByCategory } from '@/services/product';

const ProductSkuUpsert = () => {
  const { id } = useParams();
  const isEdit = !!id;

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [categoryId, setCategoryId] = useState<string>('');
  const [attributes, setAttributes] = useState<string[]>([]);

  const { data: productsByCategory } = useGetProductByCategory(categoryId);
  const { data: productSkuData } = useGetproductSkuById(id as string);
  const { data: initData } = useGetInitialForCreate();

  const { mutate: createProductSkuMutate, isPending: isCreatePending } =
    useCreateproductSku();
  const { mutate: updateProductSkuMutate, isPending: isUpdatePending } =
    useUpdateProductSku();
  const formik = useFormik({
    initialValues: {
      productId: '',
      attributes: '',
      price: '',
    },
    // validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      const payload = {
        ...values,
        productName: productsByCategory?.find(
          (item) => item._id === values.productId
        )?.name,
        attributes: attributes?.map((item) =>
          initData?.attributeList.find((i) => i._id === item)
        ),
      };
      console.log('pl:', payload);
      if (isEdit) {
        updateProductSkuMutate(
          { _id: id, ...payload },
          {
            onSuccess() {
              queryClient.invalidateQueries({
                queryKey: [QueryKeys.ProductSku],
              });
              showNotification('Cập nhật SKU thành công', 'success');
              navigate('/product-sku');
            },
          }
        );
      } else {
        createProductSkuMutate(payload, {
          onSuccess() {
            queryClient.invalidateQueries({ queryKey: [QueryKeys.ProductSku] });
            showNotification('Tạo SKU thành công', 'success');
            navigate('/product-sku');
          },
        });
      }
    },
  });

  useEffect(() => {
    if (productSkuData) {
      formik.setFieldValue('productId', productSkuData?.productId);
      formik.setFieldValue('price', productSkuData?.price);
      setAttributes(productSkuData?.attributes?.map((v) => v?._id));
    }
  }, [productSkuData]);

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
          <Typography variant='h5' sx={{ fontWeight: 600 }}>
            {isEdit ? 'Sửa phân loại' : 'Thêm phân loại'}
          </Typography>
        }
      />
      <Divider />

      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {isEdit ? (
          <Typography>Tên sản phẩm: {productSkuData?.productName}</Typography>
        ) : (
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
                name='productId'
                onChange={handleSelectChange}
                value={formik?.values?.productId}>
                {productsByCategory?.map((item) => (
                  <MenuItem key={item?._id} value={item?._id}>
                    {item?.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                <Box component={'span'} sx={helperTextStyle}>
                  {formik.errors?.productId}
                </Box>
              </FormHelperText>
            </FormControl>
          </>
        )}
        <Typography>Phân loại:</Typography>
        {productsByCategory
          ?.find((item) => item?._id === formik?.values?.productId)
          ?.attributes?.map((item: string, index: number) => (
            <Box key={item} sx={{ display: 'flex' }}>
              <Typography>{item}:</Typography>
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
                <InputLabel>Giá trị</InputLabel>
                <Select
                  disableUnderline
                  size='small'
                  onChange={(e) => {
                    handleAttributeChange(e, index);
                  }}
                  value={attributes[index]}>
                  {initData?.attributeList
                    ?.filter((a) => a?.name === item)
                    ?.map((item: IAttribute) => (
                      <MenuItem key={item?._id} value={item?._id}>
                        {item?.value}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          ))}
        {productSkuData?.attributes?.map((item: IAttribute, index: number) => (
          <Box key={item?._id} sx={{ display: 'flex' }}>
            <Typography>{item?.name}:</Typography>
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
              <InputLabel>Giá trị</InputLabel>
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
          </Box>
        ))}
        <FormControl>
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
        <Box sx={{ textAlign: 'end' }}>
          <Button onClick={() => navigate('/product-sku')} sx={{ mr: 2 }}>
            Trở lại
          </Button>
          <Button variant='contained' onClick={() => formik.handleSubmit()}>
            Thêm
          </Button>
        </Box>
      </CardContent>
      {/* {(isCreatePending || isUpdatePending) && <SuspenseLoader />} */}
    </Card>
  );
};

export default ProductSkuUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
