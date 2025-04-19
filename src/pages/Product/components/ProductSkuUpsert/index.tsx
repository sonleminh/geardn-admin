import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { ChangeEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import AddIcon from '@mui/icons-material/Add';
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
  Grid2,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';

import { QueryKeys } from '@/constants/query-key';

import ImageUpload from '@/components/ImageUpload';
import Input from '@/components/Input';
import SuspenseLoader from '@/components/SuspenseLoader';

import { useNotificationContext } from '@/contexts/NotificationContext';

import { truncateTextByLine } from '@/utils/css-helper.util';

import { IAttributeValue } from '@/interfaces/IAttributeValue';
import { useGetAttributeList } from '@/services/attribute';
import {
  useGetAttributeValueList,
  useGetAttributeValuesByAttributeId,
} from '@/services/attribute-value';
import { useGetProductBySlug } from '@/services/product';
import {
  useCreateSku,
  useGetSkuByProductSku,
  useUpdateSku,
} from '@/services/sku';

const ProductSkuUpsert = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = location?.pathname.includes('update');
  const { sku } = useParams<{ sku: string }>();

  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [isEditAttribute, setIsEditAttribute] = useState<boolean>(false);
  const [editAttIndex, setEditAttIndex] = useState<number | null>(null);

  const [attributeId, setAttributeId] = useState<string>('');
  const [attributeValueId, setAttributeValueId] = useState<string>('');
  const [attributeValue, setAttributeValue] = useState<IAttributeValue | null>(
    null
  );
  const [attributeList, setAttributeList] = useState<
    { attributeId: string; attributeValueId: string }[]
  >([]);
  const [showAttributeForm, setShowAttributeForm] = useState<boolean>(true);

  const { data: productData } = useGetProductBySlug(
    !isEdit ? (sku as string) : ''
  );
  const { data: skuData } = useGetSkuByProductSku(
    isEdit ? (sku as string) : ''
  );
  const { data: attributeListData } = useGetAttributeList();
  const { data: attributeValueByAttIdListData } =
    useGetAttributeValuesByAttributeId(+attributeId);
  console.log(
    'attributeValueByTypattributeValueByAttIdListDataeListData',
    attributeValueByAttIdListData
  );
  const { data: attributeValuesData } = useGetAttributeValueList();
  const { mutate: createSkuMutate, isPending: isCreatePending } =
    useCreateSku();
  const { mutate: updateSkuMutate, isPending: isUpdatePending } =
    useUpdateSku();

  useEffect(() => {
    if (skuData) {
      formik.setFieldValue('price', skuData?.data?.price);
      formik.setFieldValue('imageUrl', skuData?.data?.imageUrl);
      setAttributeList(
        skuData?.data?.productSkuAttributes?.map((item) => ({
          attributeId: String(item?.attributeValue?.attributeId),
          attributeValueId: String(item?.attributeValue?.id),
        }))
      );
    }
  }, [sku, skuData]);

  const formik = useFormik({
    initialValues: {
      price: '',
      imageUrl: '',
    },
    // validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      if (!sku) {
        throw new Error('sku is missing');
      }
      if (attributeId || attributeValueId) {
        return showNotification('Chưa lưu phân loại hàng', 'error');
      }
      const payload = {
        ...values,
        price: +values.price,
        imageUrl: values.imageUrl === '' ? null : values.imageUrl,
        attributeValues: attributeList?.map((item) => ({
          attributeValueId: +item.attributeValueId,
        })),
        productId: isEdit ? skuData?.data?.productId : productData?.data?.id,
      };
      if (isEdit && skuData) {
        updateSkuMutate(
          { id: skuData?.data?.id, ...payload },
          {
            onSuccess() {
              queryClient.invalidateQueries({ queryKey: [QueryKeys.Sku] });
              showNotification('Cập nhật sản phẩm thành công', 'success');
              navigate(-1);
            },
            onError() {
              showNotification('Đã có lỗi xảy ra', 'error');
            },
          }
        );
      } else {
        createSkuMutate(payload, {
          onSuccess() {
            queryClient.invalidateQueries({ queryKey: [QueryKeys.Sku] });
            showNotification('Tạo sản phẩm thành công', 'success');
            navigate(-1);
          },
        });
      }
    },
  });

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  const handleAttributeChange = (e: SelectChangeEvent<string>) => {
    setAttributeId(e?.target?.value);
  };

  const handleAttributeValueValueChange = (e: SelectChangeEvent<string>) => {
    setAttributeValueId(e?.target?.value);
    const selectedAttributeValue = attributeValuesData?.data?.find(
      (attr) => attr.id === +e?.target?.value
    );
    if (selectedAttributeValue) {
      setAttributeValue(selectedAttributeValue);
    }
  };

  const handleUploadResult = (result: string) => {
    formik.setFieldValue('imageUrl', result);
  };

  const handleAddAttribute = () => {
    setShowAttributeForm(!showAttributeForm);
  };

  const handleSaveAttribute = () => {
    const selectedAttributeValue = attributeValuesData?.data?.find(
      (attr) => attr.id === +attributeValueId
    );

    if (!selectedAttributeValue) return;
    const isAlreadySelected = attributeList.some((item) => {
      const existingAttribute = attributeValuesData?.data?.find(
        (attr) => attr.id === +item.attributeValueId
      );
      return (
        existingAttribute?.attributeId === selectedAttributeValue.attributeId
      );
    });

    if (isAlreadySelected && !isEditAttribute) {
      return showNotification('Bạn đã chọn loại thuộc tính này!', 'error');
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
    setIsEditAttribute(false);
  };

  const handleDelBtn = () => {
    setAttributeId('');
    setAttributeValueId('');
  };

  const handleDeleteAttribute = (attributeIndex: number) => {
    const updAttributeList = attributeList?.filter(
      (_, index) => index !== attributeIndex
    );
    console.log('updAttributeList', updAttributeList);
    if (updAttributeList?.length === 0) {
      setIsEditAttribute(false);
    }
    setAttributeList(updAttributeList);
  };

  const getAttributeLabel = (attributeId: string, attributeValueId: string) => {
    const attribute = attributeListData?.data?.find(
      (attr) => attr.id === +attributeId
    );
    const attributeValue = attributeValuesData?.data?.find(
      (attr) => attr.id === +attributeValueId
    );
    return {
      attribute: attribute?.label,
      attributeValue: attributeValue?.value,
    };
  };

  const handleEditAttribute = (
    attributeId: string,
    attributeValueId: string,
    index: number
  ) => {
    // const handleEditAttribute = (attributeValueId: string, index: number) => {
    setIsEditAttribute(true);
    setEditAttIndex(index);
    setAttributeId(attributeId);
    setAttributeValueId(attributeValueId);
    // const attributeValue = attributeValuesData?.data?.find(
    //   (prdAttr) => prdAttr.id === +attributeValueId
    // );
    // if (attributeValue) {
    //   setAttributeValueId(String(attributeValue.attributeId));
    // }
  };

  console.log('attributeId', attributeId?.length <= 0);
  console.log('attributeValueId', attributeValueId?.length <= 0);

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
              {attributeList?.length > 0 && (
                <Grid2 size={12} className='attribute-list'>
                  <Box
                    sx={{
                      width: '400px',
                      p: '12px 20px',
                      border: '1px solid #ccc',
                      borderRadius: 1,
                    }}>
                    {attributeList?.map((item, index) => {
                      const attributeValueItem = getAttributeLabel(
                        item?.attributeId,
                        item?.attributeValueId
                      );
                      return (
                        <Box
                          key={item?.attributeValueId}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            my: 1.5,
                          }}>
                          <Typography key={item?.attributeValueId}>
                            {attributeValueItem?.attribute ?? ''} -{' '}
                            {attributeValueItem?.attributeValue ?? ''}
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
                                  String(item.attributeId),
                                  String(item.attributeValueId),
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
                    onChange={handleAttributeChange}
                    value={attributeId ?? ''}
                    disabled={isEditAttribute}>
                    {attributeListData?.data?.map((item) => (
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
                    onChange={handleAttributeValueValueChange}
                    value={attributeValueId ?? ''}
                    disabled={!attributeValueByAttIdListData}>
                    {attributeValueByAttIdListData?.data?.map((item) => (
                      <MenuItem key={item?.id} value={String(item?.id)}>
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
                    disabled={!attributeValueId}
                    onClick={handleSaveAttribute}>
                    Lưu
                  </Button>
                  <Button
                    sx={{ ml: 2, textTransform: 'initial' }}
                    variant='outlined'
                    onClick={handleDelBtn}
                    disabled={
                      attributeId?.length <= 0 && attributeValueId?.length <= 0
                    }>
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
            </>
          )}
          <Grid2 size={6}>
            <FormControl fullWidth>
              <Input
                label='Giá'
                name='price'
                variant='filled'
                type='number'
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
