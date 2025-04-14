import { ChangeEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import { useQueryClient } from '@tanstack/react-query';

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  Grid2,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddIcon from '@mui/icons-material/Add';

import { QueryKeys } from '@/constants/query-key';

import SuspenseLoader from '@/components/SuspenseLoader';
import ImageUpload from '@/components/ImageUpload';
import Input from '@/components/Input';

import { useNotificationContext } from '@/contexts/NotificationContext';

import { truncateTextByLine } from '@/utils/css-helper.util';

import {
  useGetAttributesByType,
  useGetProductAttributeList,
  useGetProductAttributesByType,
} from '@/services/product-attribute';
import {
  useCreateSku,
  useGetSkuByProductSku,
  useUpdateSku,
} from '@/services/sku';
import { useGetProductBySlug } from '@/services/product';
import { useGetAttributeTypeList } from '@/services/attribute-type';
import { IProductAttribute } from '@/interfaces/IProductAttribute';

const ProductSkuUpsert = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = location?.pathname.includes('update');
  const { sku } = useParams<{ sku: string }>();

  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [isEditAttribute, setIsEditAttribute] = useState<boolean>(false);
  const [editAttIndex, setEditAttIndex] = useState<number | null>(null);

  const [attributeTypeId, setAttributeTypeId] = useState<string>('');
  const [productAttributeId, setProductAttributeId] = useState<string>('');
  const [productAttribute, setProductAttribute] =
    useState<IProductAttribute | null>(null);
  const [productAttributeList, setProductAttributeList] = useState<
    { productAttributeId: number }[]
  >([]);
  const [showAttributeForm, setShowAttributeForm] = useState<boolean>(true);

  const { data: productData } = useGetProductBySlug(
    !isEdit ? (sku as string) : ''
  );
  const { data: skuData } = useGetSkuByProductSku(
    isEdit ? (sku as string) : ''
  );
  const { data: attributeTypeListData } = useGetAttributeTypeList();
  const { data: productAttributeByTypeListData } =
    useGetProductAttributesByType(+attributeTypeId);
  const { data: productAttributesData } = useGetProductAttributeList();
  const { mutate: createSkuMutate, isPending: isCreatePending } =
    useCreateSku();
  const { mutate: updateSkuMutate, isPending: isUpdatePending } =
    useUpdateSku();

  useEffect(() => {
    if (skuData) {
      formik.setFieldValue('price', skuData?.data?.price);
      formik.setFieldValue('quantity', skuData?.data?.quantity);
      formik.setFieldValue('imageUrl', skuData?.data?.imageUrl);
      // setProductAttributeList(
      //   skuData?.data?.productSkuAttributes?.map((item) => ({
      //     attributeId: item?.attribute?.id,
      //   }))
      // );
    }
  }, [sku, skuData]);

  const formik = useFormik({
    initialValues: {
      price: '',
      quantity: '',
      imageUrl: '',
    },
    // validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      if (!sku) {
        throw new Error('sku is missing');
      }
      if (attributeTypeId || productAttributeId) {
        return showNotification('Chưa lưu phân loại hàng', 'error');
      }
      const payload = {
        ...values,
        price: +values.price,
        quantity: +values.quantity,
        imageUrl: values.imageUrl === '' ? null : values.imageUrl,
        attributes: productAttributeList,
        productId: isEdit ? skuData?.data?.productId : productData?.data?.id,
      };
      console.log('payload', payload);
      // if (isEdit && skuData) {
      //   updateSkuMutate(
      //     { id: skuData?.data?.id, ...payload },
      //     {
      //       onSuccess() {
      //         queryClient.invalidateQueries({ queryKey: [QueryKeys.Sku] });
      //         showNotification('Cập nhật sản phẩm thành công', 'success');
      //         navigate(-1);
      //       },
      //       onError() {
      //         showNotification('Đã có lỗi xảy ra', 'error');
      //       },
      //     }
      //   );
      // } else {
      //   createSkuMutate(payload, {
      //     onSuccess() {
      //       queryClient.invalidateQueries({ queryKey: [QueryKeys.Sku] });
      //       showNotification('Tạo sản phẩm thành công', 'success');
      //       navigate(-1);
      //     },
      //   });
      // }
    },
  });

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  const handleAttributeTypeChange = (e: SelectChangeEvent<string>) => {
    setAttributeTypeId(e?.target?.value);
  };

  const handleProductAttributeValueChange = (e: SelectChangeEvent<string>) => {
    setProductAttributeId(e?.target?.value);
    const selectedProductAttribute = productAttributesData?.data?.find(
      (attr) => attr.id === +e?.target?.value
    );
    if (selectedProductAttribute) {
      setProductAttribute(selectedProductAttribute);
    }
  };

  const handleUploadResult = (result: string) => {
    formik.setFieldValue('imageUrl', result);
  };

  const handleAddAttribute = () => {
    setShowAttributeForm(!showAttributeForm);
  };

  const handleSaveAttribute = () => {
    const selectedProductAttribute = productAttributesData?.data?.find(
      (attr) => attr.id === +productAttributeId
    );

    if (!selectedProductAttribute) return;
    const isAlreadySelected = productAttributeList.some((item) => {
      const existingAttribute = productAttributesData?.data?.find(
        (attr) => attr.id === item.productAttributeId
      );
      return existingAttribute?.typeId === selectedProductAttribute.typeId;
    });

    if (isAlreadySelected && !isEditAttribute) {
      return showNotification('Bạn đã chọn loại thuộc tính này!', 'error');
    }

    if (editAttIndex !== null && productAttributeId) {
      const updatedAttributeList = productAttributeList;
      updatedAttributeList[editAttIndex] = {
        productAttributeId: +productAttributeId,
      };
      setProductAttributeList(updatedAttributeList);
      setProductAttributeId('');
      setAttributeTypeId('');
    } else {
      if (productAttributeId) {
        setProductAttributeList((prev) => [
          ...prev,
          { productAttributeId: +productAttributeId },
        ]);
      }
      setProductAttributeId('');
      setAttributeTypeId('');
    }
  };
  // const handleDelBtn = () => {
  //   setAttributeId(null);
  //   setAttributeType('');
  // };

  const handleDeleteAttribute = (attributeIndex: number) => {
    setProductAttributeList(
      productAttributeList?.filter((_, index) => index !== attributeIndex)
    );
  };

  const getProductAttributeLabel = (attributeId: number) => {
    const attribute = productAttributesData?.data?.find(
      (attr) => attr.id === attributeId
    );
    return attribute;
  };

  const handleEditAttribute = (productAttributeId: string, index: number) => {
    setIsEditAttribute(true);
    setEditAttIndex(index);
    setProductAttributeId(productAttributeId);
    const productAttribute = productAttributesData?.data?.find(
      (prdAttr) => prdAttr.id === +productAttributeId
    );
    if (productAttribute) {
      setProductAttributeId(String(productAttribute.typeId));
    }
  };

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Typography
            sx={{ fontSize: 20, fontWeight: 500, ...truncateTextByLine(1) }}>
            {isEdit ? 'Sửa mã hàng' : 'Thêm mã hàng'}:{' '}
            {productData?.data?.name ?? sku}
          </Typography>
        }
      />
      <Divider />

      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Grid2 container rowSpacing={2} columnSpacing={4}>
          <Grid2 size={12}>
            <Box display={'flex'}>
              <Typography sx={{ width: 80, mr: 2, mb: 2 }}>
                Loại hàng:
              </Typography>
              {!showAttributeForm && (
                <Button
                  sx={{ height: 32 }}
                  variant={'contained'}
                  size='small'
                  onClick={handleAddAttribute}>
                  <AddIcon />
                </Button>
              )}
            </Box>
          </Grid2>
          {(showAttributeForm || isEdit) && (
            <>
              {productAttributeList.length > 0 && (
                <Grid2 size={12} className='attribute-list'>
                  <Box
                    sx={{
                      width: '400px',
                      p: '12px 20px',
                      border: '1px solid #ccc',
                      borderRadius: 1,
                    }}>
                    {productAttributeList.map((item, index) => {
                      const productAttributeItem = getProductAttributeLabel(
                        item.productAttributeId
                      );
                      return (
                        <Box
                          key={item.productAttributeId}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            my: 1.5,
                          }}>
                          <Typography key={item.productAttributeId}>
                            {productAttributeItem?.typeId} -{' '}
                            {productAttributeItem?.value}
                          </Typography>
                          <Box>
                            <Button
                              sx={{
                                minWidth: 40,
                                width: 40,
                                height: 30,
                              }}
                              variant='outlined'
                              onClick={() =>
                                handleEditAttribute(
                                  String(item.productAttributeId),
                                  index
                                )
                              }>
                              <EditOutlinedIcon sx={{ fontSize: 20 }} />
                            </Button>
                            <Button
                              sx={{
                                minWidth: 40,
                                width: 40,
                                height: 30,
                                ml: 2,
                              }}
                              variant='outlined'
                              onClick={() => handleDeleteAttribute(index)}>
                              <DeleteOutlineOutlinedIcon
                                sx={{ fontSize: 20 }}
                              />
                            </Button>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Grid2>
              )}
              <Grid2 size={4}>
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
                      '& .Mui-disabled': {
                        backgroundColor: '#eee',
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
                    onChange={handleAttributeTypeChange}
                    value={attributeTypeId ?? ''}
                    disabled={isEditAttribute}>
                    {attributeTypeListData?.data?.map((item) => (
                      <MenuItem key={item?.id} value={String(item.id)}>
                        {item?.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid2>
              <Grid2 size={4}>
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
                      '& .Mui-disabled': {
                        backgroundColor: '#eee',
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
                    onChange={handleProductAttributeValueChange}
                    value={productAttributeId ?? ''}
                    disabled={!productAttributeByTypeListData}>
                    {productAttributeByTypeListData?.data?.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid2>
              <Grid2 size={4}>
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
                    disabled={!productAttributeId}
                    onClick={handleSaveAttribute}>
                    Lưu
                  </Button>
                  {/* <Button
                    sx={{ ml: 2, textTransform: 'initial' }}
                    variant='outlined'
                    onClick={() => handleDelBtn}>
                    Xóa
                  </Button> */}
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
            </>
          )}
          <Grid2 size={6}>
            <FormControl fullWidth>
              <Input
                label='Giá'
                name='price'
                variant='filled'
                size='small'
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
                label='Số lượng'
                name='quantity'
                variant='filled'
                size='small'
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
        <FormControl>
          <ImageUpload
            title={'Ảnh:'}
            helperText={
              <Box component={'span'} sx={helperTextStyle}>
                {formik.errors.imageUrl}
              </Box>
            }
            value={formik?.values?.imageUrl}
            onUploadChange={handleUploadResult}
          />
        </FormControl>
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

export default ProductSkuUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
