import { ChangeEvent, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import SuspenseLoader from '@/components/SuspenseLoader';

import { useNotificationContext } from '@/contexts/NotificationContext';
import { useGetProductById, useGetProductBySlug } from '@/services/product';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';

import ImageUpload from '@/components/ImageUpload';
import Input from '@/components/Input';
import { ProductAttributeType } from '@/constants/attribuite-type';
import { QueryKeys } from '@/constants/query-key';
import {
  useGetAttributeList,
  useGetAttributesByType,
} from '@/services/attribute';
import {
  useCreateSku,
  useGetSkuByProductSku,
  useGetSkusByProductSku,
  useUpdateSku,
} from '@/services/sku';
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
import { truncateTextByLine } from '@/utils/css-helper.util';

const ProductSkuUpsert = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { sku } = useParams<{ sku: string }>();

  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [isEditAttribute, setIsEditAttribute] = useState<boolean>(false);
  const [editAttIndex, setEditAttIndex] = useState<number | null>(null);

  const [attributeType, setAttributeType] = useState<string>('');
  const [attributeId, setAttributeId] = useState<number | null>(null);
  console.log('attributeId', attributeId);
  const [attributeList, setAttributeList] = useState<{ attributeId: number }[]>(
    []
  );
  const [showAttributeForm, setShowAttributeForm] = useState<boolean>(false);

  const isEdit = location?.pathname.includes('update');

  const { data: productData } = useGetProductBySlug(
    !isEdit ? (sku as string) : ''
  );
  const { data: skusData } = useGetSkuByProductSku(
    isEdit ? (sku as string) : ''
  );
  const { data: attributesByTypeData } = useGetAttributesByType(attributeType);
  const { data: attributesData } = useGetAttributeList();
  console.log('attributesData', attributesData);
  const { mutate: createSkuMutate, isPending: isCreatePending } =
    useCreateSku();
  const { mutate: updateSkuMutate, isPending: isUpdatePending } =
    useUpdateSku();

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
      const payload = {
        ...values,
        productId: isEdit
          ? (skusData?.data?.productid as number)
          : (productData?.data?.id as number),
        price: +values.price,
        quantity: +values.quantity,
        attributes: attributeList,
      };
      if (isEdit) {
        updateSkuMutate(
          { id: +id, ...payload },
          {
            onSuccess() {
              queryClient.invalidateQueries({ queryKey: [QueryKeys.Sku] });
              showNotification('Cập nhật sản phẩm thành công', 'success');
              navigate(-1);
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

  const handleAttributeTypeChange = (e: SelectChangeEvent<string>) => {
    setAttributeType(e?.target?.value);
  };

  const handleAttributeValueChange = (e: SelectChangeEvent<number>) => {
    setAttributeId(+e?.target?.value);
  };

  const handleUploadResult = (result: string) => {
    formik.setFieldValue('imageUrl', result);
  };

  const handleAddAttribute = () => {
    setShowAttributeForm(!showAttributeForm);
  };

  const handleSaveAttribute = () => {
    const selectedAttribute = attributesData?.data?.find(
      (attr) => attr.id === attributeId
    );
    if (!selectedAttribute) return;
    const isAlreadySelected = attributeList.some((id) => {
      const existingAttribute = attributesData?.data?.find(
        (attr) => attr.id === id.attributeId
      );
      return existingAttribute?.type === selectedAttribute.type;
    });

    if (isAlreadySelected && !isEditAttribute) {
      return showNotification('Bạn đã chọn loại thuộc tính này!', 'error');
    }

    // if (
    //   attributeId &&
    //   !attributeList.some((attr) => attr.attributeId === attributeId) &&
    //   !isEditAttribute
    // ) {
    //   setAttributeList((prev) => [...prev, { attributeId: attributeId }]);
    //   setAttributeId(null);
    //   setAttributeType('');
    // } else {
    //   console.log('3:', editAttIndex);
    //   console.log('4:', attributeId);

    //   if (editAttIndex !== null && attributeId) {
    //     const updatedAttributeList = attributeList;
    //     console.log('2');
    //     updatedAttributeList[editAttIndex] = { attributeId: attributeId };
    //     setAttributeList(updatedAttributeList);
    //   }
    // }
    if (editAttIndex !== null && attributeId) {
      const updatedAttributeList = attributeList;
      console.log('2');
      updatedAttributeList[editAttIndex] = { attributeId: attributeId };
      setAttributeList(updatedAttributeList);
      setAttributeId(null);
      setAttributeType('');
    } else {
      if (attributeId) {
        setAttributeList((prev) => [...prev, { attributeId: attributeId }]);
      }
      setAttributeId(null);
      setAttributeType('');
    }
  };
  console.log('attributeList:', attributeList);
  const handleDelBtn = () => {
    setAttributeId(null);
    setAttributeType('');
  };

  const handleDeleteAttribute = (attributeIndex: number) => {
    setAttributeList(
      attributeList?.filter((_, index) => index !== attributeIndex)
    );
  };

  const getAttributeLabel = (attributeId: number) => {
    const attribute = attributesData?.data?.find(
      (attr) => attr.id === attributeId
    );
    return attribute;
  };

  const handleEditAttribute = (attributeId: number, index: number) => {
    setIsEditAttribute(true);
    setEditAttIndex(index);
    setAttributeId(attributeId);
    const attr = attributesData?.data?.find((attr) => attr.id === attributeId);
    if (attr) {
      setAttributeType(attr.type);
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
          {showAttributeForm && (
            <>
              <Grid2 size={12}>
                {attributeList.length > 0 && (
                  <Box
                    sx={{
                      width: '300px',
                      p: '12px 20px',
                      border: '1px solid #ccc',
                      borderRadius: 1,
                    }}>
                    {attributeList.map((item, index) => {
                      const attributeItem = getAttributeLabel(item.attributeId);
                      return (
                        <Box
                          key={item.attributeId}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            my: 1.5,
                          }}>
                          <Typography key={item.attributeId}>
                            {attributeItem?.type} - {attributeItem?.value}
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
                                handleEditAttribute(item.attributeId, index)
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
                )}
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
                    value={attributeType}>
                    {Object.values(ProductAttributeType)?.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
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
                    onChange={handleAttributeValueChange}
                    value={attributeId ?? ''}
                    disabled={!attributesByTypeData}>
                    {attributesByTypeData?.map((item) => (
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
                    disabled={!attributeId}
                    onClick={handleSaveAttribute}>
                    Lưu
                  </Button>
                  <Button
                    sx={{ ml: 2, textTransform: 'initial' }}
                    variant='outlined'
                    onClick={handleDelBtn}>
                    Xóa
                  </Button>
                  <Button
                    sx={{
                      ml: 2,
                      textTransform: 'initial',
                      color: '#D03739',
                      border: '1px solid #D03739',
                    }}
                    variant='outlined'
                    // onClick={handleDelAllVariant}
                  >
                    Xóa tất cả
                  </Button>
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
