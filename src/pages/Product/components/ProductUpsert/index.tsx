import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import CKEditor from '@/components/CKEditor';
import Input from '@/components/Input';
import MultipleFileUpload from '@/components/MultipleImageUpload';
import SuspenseLoader from '@/components/SuspenseLoader';

import { QueryKeys } from '@/constants/query-key';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { IProductPayload, ITagOptions } from '@/interfaces/IProduct';
import {
  useCreateProduct,
  useGetProductById,
  useGetProductInitial,
  useUpdateProduct,
} from '@/services/product';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';

import {
  Autocomplete,
  Box,
  Button,
  ButtonGroup,
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
  TextField,
  Theme,
  Typography,
} from '@mui/material';
// import { TYPE_ATTRIBUTE } from '@/constants/type-attribute';
import { createSchema, updateSchema } from '../utils/schema/productSchema';
import AddIcon from '@mui/icons-material/Add';
import ImageUpload from '@/components/ImageUpload';
import RemoveIcon from '@mui/icons-material/Remove';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';

type DetailKey = 'guarantee' | 'weight' | 'material';

interface IVariant {
  name: string;
  options: string[];
  images: string[];
}

const ProductUpsert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  // const [attributes, setAttributes] = useState<string[]>([]);
  const [tags, setTags] = useState<ITagOptions[]>([]);
  const [showDetailForm, setShowDetailForm] = useState<boolean>(false);
  const [showVariantForm, setShowVariantForm] = useState<boolean>(false);
  const [variants, setVariants] = useState<IVariant[]>([]);
  const [variantName, setVariantName] = useState<string>();
  const [option, setOption] = useState<string>('');
  const [optionList, setOptionList] = useState<string[]>([]);
  const [optionImage, setOptionImage] = useState<string>('');
  const [optionImageList, setOptionImageList] = useState<string[]>([]);
  const [optionError, setOptionError] = useState<string>();

  const isEdit = !!id;

  const { data: initData } = useGetProductInitial();
  const { data: productData } = useGetProductById(id as string);

  const { mutate: createProductMutate, isPending: isCreatePending } =
    useCreateProduct();
  const { mutate: updateProductMutate, isPending: isUpdatePending } =
    useUpdateProduct();

  const formik = useFormik({
    initialValues: {
      name: '',
      discount: {
        discountPrice: '',
        startDate: '',
        endDate: '',
      },
      category: '',
      tags: [],
      // attributes: [],
      // sku_name: '',
      images: [],
      brand: '',
      details: {
        guarantee: '',
        weight: '',
        material: '',
      },
      description: '',
    },
    validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      // const hasDiscount =
      //   values.discount.discountPrice !== '' ||
      //   values.discount.startDate !== '' ||
      //   values.discount.endDate !== '';

      const details = { ...values.details };
      (Object.keys(details) as DetailKey[]).forEach((key) => {
        if (details[key] === '') {
          delete details[key];
        }
      });

      const payload: IProductPayload = {
        ...values,
        details,
        tags: tags,
        // discount: hasDiscount
        //   ? {
        //       discountPrice: Number(values.discount.discountPrice),
        //       startDate: formatDateToIOS(values.discount.startDate),
        //       endDate: formatDateToIOS(values.discount.endDate),
        //     }
        //   : undefined,
      };
      // if (!hasDiscount) {
      //   delete payload.discount;
      // }
      // if (!payload.attributes || payload?.attributes?.length === 0) {
      //   delete payload.attributes;
      // }
      if (isEdit) {
        updateProductMutate(
          { _id: id, ...payload },
          {
            onSuccess() {
              queryClient.invalidateQueries({ queryKey: [QueryKeys.Product] });
              showNotification('Cập nhật sản phẩm thành công', 'success');
              navigate('/product');
            },
          }
        );
      } else {
        createProductMutate(payload, {
          onSuccess() {
            queryClient.invalidateQueries({ queryKey: [QueryKeys.Product] });
            showNotification('Tạo sản phẩm thành công', 'success');
            navigate('/product');
          },
        });
      }
    },
  });
  useEffect(() => {
    if (productData) {
      formik.setFieldValue('name', productData?.name);
      // formik.setFieldValue(
      //   'discount.discountPrice',
      //   productData?.discount?.discountPrice
      // );
      // formik.setFieldValue(
      //   'discount.startDate',
      //   formatDateToNormal(productData?.discount?.startDate)
      // );
      // formik.setFieldValue(
      //   'discount.endDate',
      //   formatDateToNormal(productData?.discount?.endDate)
      // );
      formik.setFieldValue('name', productData?.name);
      formik.setFieldValue('category', productData?.category?._id);
      formik.setFieldValue('tags', productData?.tags);
      formik.setFieldValue('images', productData?.images);
      formik.setFieldValue('brand', productData?.brand);
      formik.setFieldValue('description', productData?.description);
      // formik.setFieldValue('attributes', productData?.attributes);
      // formik.setFieldValue('sku_name', productData?.sku_name);
      setTags(productData?.tags);
      // setAttributes(productData?.attributes);
    }
  }, [productData, initData]);

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  const handleTagChange = (
    _: React.ChangeEvent<unknown>,
    val: ITagOptions[]
  ) => {
    setTags(val);
    formik.setFieldValue('tags', val);
  };

  // const handleAttributeChange = (
  //   _: React.ChangeEvent<unknown>,
  //   val: string[]
  // ) => {
  //   setAttributes(val);
  //   formik.setFieldValue('attributes', val);
  // };

  const handleSelectChange = (e: SelectChangeEvent<unknown>) => {
    formik.setFieldValue('category', e.target.value);
  };

  const handleUploadResult = (result: string[]) => {
    formik.setFieldValue('images', result);
  };

  const handleAddVariant = () => {
    setShowVariantForm(!showVariantForm);
  };

  const handleOptionImageUpload = (result: string) => {
    setOptionImage(result);
  };

  const handleAddOption = () => {
    if (option !== '') {
      setOptionList((prev) => [...prev, option]);
      if (optionImage !== '') {
        setOptionImageList((prev) => [...prev, optionImage]);
      }
      setOption('');
      setOptionImage('');
    }
  };

  const handleRemoveOption = (index: number) => {
    setOptionList((prev) => prev.filter((_, i) => i !== index));
    setOptionImageList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveVariant = () => {
    if (option) {
      setOptionError('Thêm hoặc xoá tuỳ chọn trước khi lưu biến thể!');
    } else {
      setOptionError('');
      if (variantName && optionList)
        setVariants((prev) => [
          ...prev,
          { name: variantName, options: optionList, images: optionImageList },
        ]);
      setVariantName('');
      setOptionList([]);
      setOptionImageList([]);
    }
  };

  console.log('variants:', variants);
  console.log('optionImageList:', optionImageList);

  // const handleDeleteVariant = () => {
  //     setVariants((prev) => [
  //       ...prev,
  //       { name: variantName, options: optionList, images: optionImageList },
  //     ]);
  // };

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
            {isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
          </Typography>
        }
      />
      <Divider />

      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Grid2 container rowSpacing={1.5} columnSpacing={4}>
          <Grid2 size={6}>
            <FormControl fullWidth>
              <Input
                label='Tên'
                name='name'
                variant='filled'
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
          </Grid2>
          <Grid2 size={6}>
            <FormControl>
              <MultipleFileUpload
                title={'Ảnh'}
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
          </Grid2>
          <Grid2 size={6}>
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
                name='category'
                onChange={handleSelectChange}
                value={formik?.values?.category}>
                {initData?.categories?.map((item) => (
                  <MenuItem key={item._id} value={item?._id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                <Box component={'span'} sx={helperTextStyle}>
                  {formik.errors?.category}
                </Box>
              </FormHelperText>
            </FormControl>
          </Grid2>

          <Grid2 size={6}>
            <FormControl fullWidth>
              <Autocomplete
                multiple
                fullWidth
                options={initData?.tags ?? []}
                disableCloseOnSelect
                value={tags}
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
              />
              <FormHelperText>
                <Box component={'span'} sx={helperTextStyle}>
                  {formik.errors?.tags}
                </Box>
              </FormHelperText>
            </FormControl>
          </Grid2>

          {/* <Grid2 size={6}>
            <FormControl fullWidth>
              <Autocomplete
                multiple
                fullWidth
                options={TYPE_ATTRIBUTE ?? []}
                disableCloseOnSelect
                value={attributes ?? []}
                onChange={(e, val) => handleAttributeChange(e, val)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder='Phân loại ...'
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
              />
            </FormControl>
          </Grid2> */}
          {/* <Grid2 size={6}>
            <FormControl fullWidth>
              <Input
                label='Mã sản phẩm'
                name='sku_name'
                variant='filled'
                size='small'
                required
                helperText={
                  <Box component={'span'} sx={helperTextStyle}>
                    {formik.errors.sku_name}
                  </Box>
                }
                value={formik?.values.sku_name}
                onChange={handleChangeValue}
              />
            </FormControl>
          </Grid2> */}
          <Grid2 size={6}>
            <FormControl fullWidth>
              <Input
                label='Hãng'
                name='brand'
                variant='filled'
                size='small'
                helperText={
                  <Box component={'span'} sx={helperTextStyle}>
                    {formik.errors.brand}
                  </Box>
                }
                value={formik?.values.brand}
                onChange={handleChangeValue}
              />
            </FormControl>
          </Grid2>
        </Grid2>
        <Box>
          <Box display={'flex'}>
            <Typography sx={{ width: 80, mr: 2, mb: 2 }}>Biến thể:</Typography>
            {!showVariantForm && (
              <Button
                variant={'contained'}
                size='small'
                onClick={handleAddVariant}>
                <AddIcon />
              </Button>
            )}
          </Box>
          <Grid2 container sx={{ width: '100%' }} spacing={4}>
            <Grid2 size={6}>
              {showVariantForm && (
                <>
                  <Grid2 container spacing={2}>
                    <Grid2 size={2}>
                      <Typography>Tên:</Typography>
                    </Grid2>
                    <Grid2 size={10}>
                      <TextField
                        variant='outlined'
                        size='small'
                        fullWidth
                        placeholder='Màu sắc'
                        onChange={(e) => setVariantName(e.target.value)}
                        value={variantName ?? ''}
                      />
                    </Grid2>
                    {/* <Grid2 size={5}>
                      {optionList &&
                        optionList?.map((item, index) => (
                          <Grid2 size={12} key={item} display={'flex'}>
                            <Typography>{item}</Typography>
                            <Box
                              sx={{
                                position: 'relative',
                                mr: 1.5,
                                '.thumbnail': {
                                  maxWidth: 60,
                                  maxHeight: 60,
                                  mr: 1,
                                  border: '1px solid #aaaaaa',
                                },
                              }}>
                              <img
                                src={optionImageList[index]}
                                className='thumbnail'
                              />
                            </Box>
                          </Grid2>
                        ))}
                    </Grid2> */}
                    <Grid2 size={2}>
                      <Typography>Tuỳ chọn:</Typography>
                    </Grid2>
                    <Grid2 size={10}>
                      {optionList?.length !== 0 ? (
                        optionList?.map((item, index) => (
                          <Box
                            key={item}
                            display={'flex'}
                            mt={index !== 0 ? 2 : 0}>
                            <Input
                              sx={{
                                width: '38%',
                                '& .Mui-disabled': {
                                  backgroundColor: '#eee',
                                },
                              }}
                              size='small'
                              disabled
                              value={item}
                            />
                            <Box
                              sx={{
                                position: 'relative',
                                ml: 3,
                                '.thumbnail': {
                                  maxWidth: 60,
                                  maxHeight: 60,
                                  mr: 5,
                                  border: '1px solid #aaaaaa',
                                },
                              }}>
                              <img
                                src={optionImageList[index]}
                                className='thumbnail'
                              />
                            </Box>
                            <RemoveCircleOutlineIcon
                              onClick={() => handleRemoveOption(index)}
                            />
                          </Box>
                        ))
                      ) : (
                        <>Empty</>
                      )}
                    </Grid2>
                    <Grid2 size={2}>
                      <Typography>Thêm:</Typography>
                    </Grid2>
                    <Grid2 size={4}>
                      <TextField
                        variant='outlined'
                        size='small'
                        fullWidth
                        placeholder='Đen'
                        onChange={(e) => setOption(e.target.value)}
                        value={option}
                      />
                    </Grid2>
                    <Grid2
                      size={5}
                      sx={{
                        button: {
                          width: 80,
                          mr: 0,
                        },
                      }}>
                      <ImageUpload
                        title={'Ảnh:'}
                        value={optionImage}
                        onUploadChange={handleOptionImageUpload}
                      />
                    </Grid2>
                    <Grid2 size={1}>
                      <AddCircleOutlineOutlinedIcon
                        sx={{
                          ':hover': {
                            color: '#696969 ',
                            cursor: 'pointer',
                          },
                        }}
                        onClick={handleAddOption}
                      />
                    </Grid2>

                    <Box sx={{ display: 'flex', ml: 'auto' }}>
                      <Typography sx={helperTextStyle}>
                        {optionError}
                      </Typography>
                      <Button
                        sx={{ ml: 2 }}
                        variant='contained'
                        onClick={handleSaveVariant}>
                        <SaveOutlinedIcon />
                      </Button>
                      <Button sx={{ ml: 2 }} variant='outlined'>
                        <CloseOutlinedIcon />
                      </Button>
                    </Box>
                  </Grid2>
                </>
              )}
            </Grid2>
            <Grid2 size={6} container display={'flex'}>
              <Grid2 size={4}>
                <Typography mr={2}>Danh sách biến thể:</Typography>
              </Grid2>
              <Grid2 size={8}>
                {variants?.map((variant) => (
                  <Box key={variant?.name}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Typography mr={2}>Tên:</Typography>
                      <Typography>{variant?.name}</Typography>
                    </Box>
                    {variant?.options?.map((option, index) => (
                      <Box key={option} display={'flex'}>
                        <Typography sx={{ width: 100 }}>{option}</Typography>
                        {variant?.images?.length > 0 && (
                          <Box
                            sx={{
                              position: 'relative',
                              '.thumbnail': {
                                maxWidth: 60,
                                maxHeight: 60,
                                border: '1px solid #aaaaaa',
                              },
                            }}>
                            <img
                              src={variant?.images?.[index]}
                              className='thumbnail'
                            />
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Grid2>
            </Grid2>
          </Grid2>
        </Box>

        <Box sx={{ display: 'flex' }}>
          <Typography sx={{ width: 80, mr: 2 }}>Chi tiết:</Typography>
          <Button
            variant={showDetailForm ? 'outlined' : 'contained'}
            size='small'
            onClick={() => setShowDetailForm(!showDetailForm)}>
            {showDetailForm ? <RemoveIcon /> : <AddIcon />}
          </Button>
        </Box>
        {showDetailForm && (
          <FormControl>
            <Grid2 container spacing={4}>
              <Grid2>
                <Input
                  label='Thời gian bảo hành'
                  name='details.guarantee'
                  variant='filled'
                  size='small'
                  fullWidth
                  helperText={
                    <Box component={'span'} sx={helperTextStyle}>
                      {formik?.errors?.details?.guarantee}
                    </Box>
                  }
                  value={formik?.values?.details.guarantee}
                  onChange={handleChangeValue}
                />
              </Grid2>
              <Grid2 size={3}>
                <Input
                  label='Trọng lượng'
                  name='details.weight'
                  variant='filled'
                  size='small'
                  fullWidth
                  helperText={
                    <Box component={'span'} sx={helperTextStyle}>
                      {formik?.errors?.details?.weight}
                    </Box>
                  }
                  value={formik?.values?.details?.weight}
                  onChange={handleChangeValue}
                />
              </Grid2>
              <Grid2 size={3}>
                <Input
                  label='Chất liệu'
                  name='details.material'
                  variant='filled'
                  size='small'
                  fullWidth
                  helperText={
                    <Box component={'span'} sx={helperTextStyle}>
                      {formik?.errors?.details?.material}
                    </Box>
                  }
                  value={formik?.values?.details?.material}
                  onChange={handleChangeValue}
                />
              </Grid2>
            </Grid2>
          </FormControl>
        )}
        <FormControl>
          <Typography mb={1}>
            Mô tả:
            <Typography component={'span'} color='red'>
              *
            </Typography>
          </Typography>
          <CKEditor
            onChange={(value: string) =>
              formik.setFieldValue('description', value)
            }
            value={formik.values.description ?? ''}
            helperText={formik?.errors?.description}
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

export default ProductUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
