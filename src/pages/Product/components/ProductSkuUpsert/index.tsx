import { ChangeEvent, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import Input from '@/components/Input';
import MultipleFileUpload from '@/components/MultipleImageUpload';
import SuspenseLoader from '@/components/SuspenseLoader';

import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  useCreateProduct,
  useGetProductById,
  useUpdateProduct,
} from '@/services/product';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';

import { ProductAttributeType } from '@/constants/attribuite-type';
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
import AddIcon from '@mui/icons-material/Add';
import {
  useGetAttributeList,
  useGetAttributesByType,
} from '@/services/attribute';

const ProductSkuUpsert = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [attributeType, setAttributeType] = useState<string>('');
  const [attributeId, setAttributeId] = useState<number | ''>('');
  const [attributeList, setAttributeList] = useState<{ attributeId: number }[]>(
    []
  );
  const [showAttributeForm, setShowAttributeForm] = useState<boolean>(false);

  const isEdit = location?.pathname.includes('update');

  const { data: productData } = useGetProductById(id as string);
  const { data: attributesByTypeData } = useGetAttributesByType(attributeType);
  const { data: attributesData } = useGetAttributeList();
  console.log('att:', attributesData);
  const { mutate: createProductMutate, isPending: isCreatePending } =
    useCreateProduct();
  const { mutate: updateProductMutate, isPending: isUpdatePending } =
    useUpdateProduct();

  const formik = useFormik({
    initialValues: {
      name: '',
      categoryId: '',
      tags: [],
      images: [],
      brand: '',
      details: {
        guarantee: '',
        weight: '',
        material: '',
      },
      description: '',
    },
    // validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      const { details, ...rest } = values;

      const isDetailsEmpty = Object.values(details).every((value) => !value);

      // const payload: IProductPayload = {
      //   ...rest,
      //   ...(isDetailsEmpty ? {} : { details }),
      //   tags,
      //   categoryId: +values.categoryId,
      // } as IProductPayload;

      // if (isEdit) {
      //   updateProductMutate(
      //     { id: +id, ...payload },
      //     {
      //       onSuccess() {
      //         queryClient.invalidateQueries({ queryKey: [QueryKeys.Product] });
      //         showNotification('Cập nhật sản phẩm thành công', 'success');
      //         navigate('/product');
      //       },
      //     }
      //   );
      // } else {
      //   createProductMutate(payload, {
      //     onSuccess() {
      //       queryClient.invalidateQueries({ queryKey: [QueryKeys.Product] });
      //       showNotification('Tạo sản phẩm thành công', 'success');
      //       navigate('/product');
      //     },
      //   });
      // }
    },
  });
  // useEffect(() => {
  //   if (productData) {
  //     formik.setFieldValue('name', productData?.name);
  //     formik.setFieldValue('name', productData?.name);
  //     formik.setFieldValue('categoryId', productData?.categoryId);
  //     formik.setFieldValue('tags', productData?.tags);
  //     formik.setFieldValue('images', productData?.images);
  //     formik.setFieldValue('brand', productData?.brand);
  //     formik.setFieldValue('description', productData?.description);
  //   }
  // }, [productData, initData]);

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

  const handleUploadResult = (result: string[]) => {
    formik.setFieldValue('images', result);
  };

  const handleAddAttribute = () => {
    setShowAttributeForm(!showAttributeForm);
  };

  const handleSaveAttribute = () => {
    if (
      attributeId &&
      !attributeList.some((attr) => attr.attributeId === attributeId)
    ) {
      setAttributeList((prev) => [...prev, { attributeId: attributeId }]);
    }
  };
  console.log('attributes:', attributeList);
  console.log(
    'existed:',
    attributeList.some((attr) => attr.attributeId === 1)
  );
  const handleDelBtn = () => {
    setAttributeType('');
  };
  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
            {isEdit ? 'Sửa mã hàng' : 'Thêm mã hàng'}: {productData?.name}
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
                    Xoá
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
                    Xoá tất cả
                  </Button>
                </Box>
              </Grid2>
            </>
          )}
          {/* <Grid2 size={12}>
            <FormControl fullWidth>
              <Input
                label='Tên'
                name='name'
                variant='filled'
                size='small'
                required
                helperText={
                  <Box component={'span'} sx={helperTextStyle}>
                    {formik.errors.name}
                  </Box>
                }
                value={formik?.values.name}
                onChange={handleChangeValue}
              />
            </FormControl>
          </Grid2> */}

          {/* <Grid2 size={6}>
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
                onChange={handleSelectChange}
                value={attributeType}>
                {Object.values(ProductAttributeType)?.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                <Box component={'span'} sx={helperTextStyle}>
                  {formik.errors?.categoryId}
                </Box>
              </FormHelperText>
            </FormControl>
          </Grid2> */}

          <Grid2 size={6}>
            <FormControl fullWidth>
              {/* <Autocomplete
                multiple
                fullWidth
                options={initData?.tags ?? []}
                disableCloseOnSelect
                // value={tags}
                onChange={(e, val) => handleTagChange(e, val)}
                isOptionEqualToValue={(option, value) =>
                  option?.value === value?.value
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder='Tag ...'
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      bgcolor: '#fff',
                      color: 'red',
                      borderRadius: '10px',
                    }}
                  />
                )}
                size='small'
              /> */}
              <FormHelperText>
                <Box component={'span'} sx={helperTextStyle}>
                  {formik.errors?.tags}
                </Box>
              </FormHelperText>
            </FormControl>
          </Grid2>
        </Grid2>
        <FormControl>
          <MultipleFileUpload
            title={'Ảnh:'}
            required
            helperText={
              <Box component={'span'} sx={helperTextStyle}>
                {formik.errors.images}
              </Box>
            }
            value={formik?.values?.images}
            onUploadChange={handleUploadResult}
          />
        </FormControl>
        <Box sx={{ textAlign: 'end' }}>
          <Button onClick={() => navigate('/product')} sx={{ mr: 2 }}>
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
