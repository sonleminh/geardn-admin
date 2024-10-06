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
import { TYPE_ATTRIBUTE } from '@/constants/type-attribute';
import { IAttribute } from '@/interfaces/IAttribute';

const ProductSkuUpsert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [categoryId, setCategoryId] = useState<string>('');
  const [attribute, setAttribute] = useState<string>('');
  const [variant, setVariant] = useState<string>();
  const [variantList, setVariantList] = useState<IAttribute[]>([]);

  const isEdit = !!id;

  const { data: productSkuData } = useGetproductSkuById(id as string);

  const { data: initData } = useGetInitialForCreate();

  const { mutate: createProductSkuMutate, isPending: isCreatePending } =
    useCreateproductSku();
  const { mutate: updateProductSkuMutate, isPending: isUpdatePending } =
    useUpdateProductSku();
  const formik = useFormik({
    initialValues: {
      productId: '',
      // variant: '',
      price: '',
    },
    // validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      console.log(values);
      // if (isEdit) {
      //   updateProductSkuMutate(
      //     { _id: id, ...values },
      //     {
      //       onSuccess() {
      //         queryClient.invalidateQueries({
      //           queryKey: [QueryKeys.ProductSku],
      //         });
      //         showNotification('Cập nhật danh mục thành công', 'success');
      //         navigate('/ProductSku');
      //       },
      //     }
      //   );
      // } else {
      //   createProductSkuMutate(values, {
      //     onSuccess() {
      //       queryClient.invalidateQueries({ queryKey: [QueryKeys.ProductSku] });
      //       showNotification('Tạo danh mục thành công', 'success');
      //       navigate('/ProductSku');
      //     },
      //   });
      // }
    },
  });

  // useEffect(() => {
  //   if (ProductSkuData) {
  //     formik.setFieldValue('type', ProductSkuData?.type);
  //     formik.setFieldValue('value', ProductSkuData?.value);
  //   }
  // }, [ProductSkuData]);

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    formik.setFieldValue(name, value);
  };

  const handleVariantChange = (event: SelectChangeEvent<string>) => {
    setVariant(event?.target?.value);
  };

  const handleAddVariant = () => {
    const newVariant = initData?.attributeList?.find((v) => v?._id === variant);
    if (newVariant) {
      setVariantList([...variantList, newVariant]);
      setAttribute('');
    }
  };
  console.log(variant);
  console.log(variantList);

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
            {initData?.productList
              ?.filter((item) => item?.category?._id === categoryId)
              ?.map((item) => (
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
        <Typography>Phân loại:</Typography>
        {productSkuData?.attributes?.map((item: IAttribute) => (
          <Box sx={{ display: 'flex' }}>
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
              <InputLabel>Loại</InputLabel>
              <Select
                disableUnderline
                size='small'
                // onChange={(e) => {
                //   setAttribute(e?.target?.value);
                // }}
                value={item?.name}>
                {Object.values(TYPE_ATTRIBUTE)?.map((item: string) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                <Box component={'span'} sx={helperTextStyle}>
                  {formik.errors?.productId}
                </Box>
              </FormHelperText>
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
              <InputLabel>Giá trị</InputLabel>
              <Select
                disableUnderline
                size='small'
                // onChange={(e) => {
                //   setAttribute(e?.target?.value);
                // }}
                value={item?.value}>
                {/* {initData?.attributeList
                  ?.filter((item) => item?.name === item?.name)
                  ?.map((item: IAttribute) => (
                    <MenuItem key={item?._id} value={item?._id}>
                      {item?.value}
                    </MenuItem>
                  ))} */}
              </Select>
              <FormHelperText>
                <Box component={'span'} sx={helperTextStyle}>
                  {formik.errors?.productId}
                </Box>
              </FormHelperText>
            </FormControl>
          </Box>
        ))}

        {/* <Box sx={{ display: 'flex' }}>
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
            <InputLabel>Loại</InputLabel>
            <Select
              disableUnderline
              size='small'
              name='productId'
              onChange={(e) => {
                setAttribute(e?.target?.value);
              }}
              value={attribute}>
              {Object.values(TYPE_ATTRIBUTE)?.map((item: string) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              <Box component={'span'} sx={helperTextStyle}>
                {formik.errors?.productId}
              </Box>
            </FormHelperText>
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
            <InputLabel>Giá trị</InputLabel>
            <Select
              disableUnderline
              size='small'
              onChange={handleVariantChange}
              value={variant}>
              {initData?.attributeList
                ?.filter((item) => item?.name === attribute)
                ?.map((item: IAttribute) => (
                  <MenuItem key={item?._id} value={item?._id}>
                    {item?.value}
                  </MenuItem>
                ))}
            </Select>
            <FormHelperText>
              <Box component={'span'} sx={helperTextStyle}>
                {formik.errors?.productId}
              </Box>
            </FormHelperText>
          </FormControl>
          <Button variant='outlined' size='small' onClick={handleAddVariant}>
            Thêm
          </Button>
        </Box> */}
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
