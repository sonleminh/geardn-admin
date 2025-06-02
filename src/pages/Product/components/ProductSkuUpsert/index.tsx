import { ChangeEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  Grid2,
  InputLabel,
  Link,
  MenuItem,
  Select,
  SelectChangeEvent,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';

import { ROUTES } from '@/constants/route';
import { QueryKeys } from '@/constants/query-key';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { IAttributeValue } from '@/interfaces/IAttributeValue';
import { useGetAttributeList } from '@/services/attribute';
import {
  useGetAttributeValueList,
  useGetAttributeValuesByAttributeId,
} from '@/services/attribute-value';
import { useGetProductById } from '@/services/product';
import {
  useCreateSku,
  useGetSkuByProductSku,
  useUpdateSku,
} from '@/services/sku';
import ImageUpload from '@/components/ImageUpload';
import Input from '@/components/Input';
import SuspenseLoader from '@/components/SuspenseLoader';

const createSchema = Yup.object().shape({
  price: Yup.number()
    .required('Vui lòng nhập giá bán')
    .min(0, 'Giá bán phải lớn hơn hoặc bằng 0')
    .typeError('Giá bán phải là số'),
  imageUrl: Yup.string().nullable(),
});

const updateSchema = Yup.object().shape({
  price: Yup.number()
    .required('Vui lòng nhập giá bán')
    .min(0, 'Giá bán phải lớn hơn hoặc bằng 0')
    .typeError('Giá bán phải là số'),
  imageUrl: Yup.string().nullable(),
});

const ProductSkuUpsert = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = location?.pathname.includes('update');
  const { productId, skuId } = useParams<{
    productId: string;
    skuId: string;
  }>();
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

  const { data: productData } = useGetProductById(productId ? +productId : 0);

  const { data: skuData } = useGetSkuByProductSku(
    isEdit ? (skuId as string) : ''
  );
  const { data: attributeListData } = useGetAttributeList();
  const { data: attributeValueByAttIdListData } =
    useGetAttributeValuesByAttributeId(+attributeId);

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
          attributeId: String(item?.attributeValue?.attribute?.id),
          attributeValueId: String(item?.attributeValue?.id),
        }))
      );
    }
  }, [skuId, skuData]);

  const formik = useFormik({
    initialValues: {
      price: '',
      imageUrl: '',
    },
    validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      if (!skuId) {
        throw new Error('skuId is missing');
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
    setIsEditAttribute(true);
    setEditAttIndex(index);
    setAttributeId(attributeId);
    setAttributeValueId(attributeValueId);
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize='small' />}
          aria-label='breadcrumb'>
          <Link
            underline='hover'
            color='inherit'
            onClick={() => navigate(ROUTES.DASHBOARD)}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}>
            <HomeOutlinedIcon sx={{ fontSize: 24 }} />
          </Link>
          <Link
            underline='hover'
            color='inherit'
            onClick={() => navigate(ROUTES.PRODUCT)}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}>
            Sản phẩm
          </Link>
          <Typography color='text.primary'>
            {isEdit
              ? 'Chỉnh sửa phân loại sản phẩm'
              : 'Thêm phân loại sản phẩm'}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Typography sx={{ mb: 2, fontSize: 20, fontWeight: 600 }}>
        {isEdit
          ? `Chỉnh sửa phân loại sản phẩm: ${
              skuData?.data?.product?.name ?? ''
            }`
          : `Thêm phân loại sản phẩm: ${productData?.data?.name ?? ''}`}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Grid2 container spacing={3}>
          <Grid2 size={6}>
            <Card>
              <CardHeader
                title='Thông tin:'
                sx={{
                  span: {
                    fontSize: 18,
                    fontWeight: 500,
                  },
                }}
              />
              <Divider />
              <CardContent>
                {(showAttributeForm || isEdit) && (
                  <Grid2 container spacing={2} mb={2}>
                    <Grid2 size={6}>
                      <FormControl variant='filled' fullWidth>
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
                          )) ?? []}
                        </Select>
                      </FormControl>
                    </Grid2>
                    <Grid2 size={6}>
                      <FormControl variant='filled' fullWidth>
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
                    <Box sx={{ display: 'flex', ml: 'auto' }}>
                      <Typography sx={helperTextStyle}></Typography>
                      <Button
                        sx={{ ml: 2, textTransform: 'initial' }}
                        variant='contained'
                        disabled={!attributeValueId}
                        onClick={handleSaveAttribute}>
                        Lưu
                      </Button>
                      <Button
                        sx={{ ml: 2, textTransform: 'initial' }}
                        variant='outlined'
                        onClick={handleDelBtn}
                        disabled={
                          attributeId?.length <= 0 &&
                          attributeValueId?.length <= 0
                        }>
                        Xóa
                      </Button>
                    </Box>
                  </Grid2>
                )}
                {!showAttributeForm && (
                  <Button
                    sx={{ height: 32 }}
                    variant={'contained'}
                    size='small'
                    onClick={handleAddAttribute}>
                    <AddIcon />
                  </Button>
                )}
                <FormControl fullWidth>
                  <Input
                    label='Giá bán'
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
                <FormControl fullWidth margin='normal'>
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
              </CardContent>
            </Card>
          </Grid2>
          <Grid2 size={6}>
            <Card>
              <CardHeader
                title='Danh sách thuộc tính:'
                sx={{
                  span: {
                    fontSize: 18,
                    fontWeight: 500,
                  },
                }}
              />
              <Divider />
              <CardContent>
                {attributeList?.length > 0 ? (
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
                ) : (
                  <Typography>Không có phân loại sản phẩm</Typography>
                )}
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>
        <Box sx={{ textAlign: 'end' }}>
          <Button
            onClick={() => navigate(`/product/${skuData?.data?.productId}/sku`)}
            sx={{ mr: 2 }}>
            Trở lại
          </Button>
          <Button
            variant='contained'
            onClick={() => formik.handleSubmit()}
            sx={{ minWidth: 100 }}>
            Lưu
          </Button>
        </Box>
      </Box>
      {(isCreatePending || isUpdatePending) && <SuspenseLoader />}
    </>
  );
};

export default ProductSkuUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
