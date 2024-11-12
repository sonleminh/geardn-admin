import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import MultipleFileUpload from '@/components/MultipleImageUpload';
import SuspenseLoader from '@/components/SuspenseLoader';
import ImageUpload from '@/components/ImageUpload';
import CKEditor from '@/components/CKEditor';
import Input from '@/components/Input';

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
import AddIcon from '@mui/icons-material/Add';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RemoveIcon from '@mui/icons-material/Remove';
import UploadIcon from '@mui/icons-material/Upload';
import { createSchema, updateSchema } from '../utils/schema/productSchema';

type DetailKey = 'guarantee' | 'weight' | 'material';

interface IVariant {
  name: string;
  options: string[];
  images?: string[];
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
  const [isEditOption, setIsEditOption] = useState<boolean>(false);
  const [editOptionIndex, setEditOptionIndex] = useState<number | null>(null);

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
      // discount: {
      //   discountPrice: '',
      //   startDate: '',
      //   endDate: '',
      // },
      category: '',
      tags: [],
      // attributes: [],
      sku_name: '',
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
        tier_variations: variants,

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
      formik.setFieldValue('sku_name', productData?.sku_name);
      // formik.setFieldValue('attributes', productData?.attributes);
      setTags(productData?.tags);
      setVariants(productData?.tier_variations);
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

  const handleDelBtn = () => {
    setVariantName('');
    setOption('');
    setOptionImage('');
    setOptionList([]);
    setOptionImageList([]);
  };

  const handleSaveVariant = () => {
    if (option) {
      setOptionError('Thêm hoặc xoá tuỳ chọn trước khi lưu biến thể!');
    } else {
      if (isEditOption && editOptionIndex !== null) {
        setOptionError('');
        if (variantName && optionList.length > 0) {
          const updatedVariant: IVariant = {
            name: variantName,
            options: optionList,
            ...(optionImageList &&
              optionImageList.length > 0 && { images: optionImageList }),
          };

          // Update existing variant
          setVariants((prev) => {
            const newVariants = [...prev];
            newVariants[editOptionIndex] = updatedVariant;
            return newVariants;
          });
        }

        setVariantName('');
        setOptionList([]);
        setOptionImageList([]);
        setEditOptionIndex(null);
      } else {
        setOptionError('');
        if (variantName && optionList.length > 0) {
          const newVariant: IVariant = {
            name: variantName,
            options: optionList,
            ...(optionImageList &&
              optionImageList.length > 0 && { images: optionImageList }),
          };

          // Add new variant
          setVariants((prev) => [...prev, newVariant]);
        }

        setVariantName('');
        setOptionList([]);
        setOptionImageList([]);
        setEditOptionIndex(null);
      }
    }
  };

  const handleEditVariant = (variant: IVariant, index: number) => {
    setIsEditOption(true);
    setEditOptionIndex(index);
    setVariantName(variant?.name);
    setOptionList(variant?.options);
    if (variant?.images) {
      setOptionImageList(variant?.images);
    }
  };

  const handleDelAllVariant = () => {
    setVariants([]);
    setShowVariantForm(false);
  };

  const handleDeleteVariant = (variantIndex: number) => {
    setShowVariantForm(true);
    setVariants(variants?.filter((_, index) => index !== variantIndex));
  };

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
        <Grid2 container rowSpacing={2} columnSpacing={4}>
          <Grid2 size={12}>
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
          <Grid2 size={6}>
            <FormControl fullWidth>
              <Input
                label='Mã hàng'
                name='sku_name'
                variant='filled'
                size='small'
                helperText={
                  <Box component={'span'} sx={helperTextStyle}>
                    {formik.errors.sku_name}
                  </Box>
                }
                value={formik?.values.sku_name}
                onChange={handleChangeValue}
              />
            </FormControl>
          </Grid2>
        </Grid2>
        <Box>
          <Box display={'flex'}>
            <Typography sx={{ width: 80, mr: 2, mb: 2 }}>Biến thể:</Typography>
            {!showVariantForm && variants?.length === 0 && (
              <Button
                sx={{ height: 32 }}
                variant={'contained'}
                size='small'
                onClick={handleAddVariant}>
                <AddIcon />
              </Button>
            )}
          </Box>
          {(showVariantForm || variants?.length > 0) && (
            <Grid2 container spacing={4}>
              <Grid2 size={6}>
                <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
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
                    <Grid2 size={2}>
                      <Typography>Tuỳ chọn:</Typography>
                    </Grid2>
                    <Grid2 size={10}>
                      {optionList?.length !== 0 ? (
                        optionList?.map((item, index) => (
                          <Box
                            key={item}
                            display={'flex'}
                            alignItems={'center'}
                            mt={index !== 0 ? 2 : 0}>
                            <Input
                              sx={{
                                width: '38%',
                                mr: 5,
                                '& .Mui-disabled': {
                                  backgroundColor: '#eee',
                                },
                              }}
                              size='small'
                              disabled
                              value={item}
                            />
                            {optionImageList?.length > 0 &&
                              (optionImageList[index] ? (
                                <>
                                  <RemoveIcon sx={{ mr: 3, fontSize: 16 }} />
                                  <Box
                                    sx={{
                                      position: 'relative',
                                      ml: 3,
                                      '.thumbnail': {
                                        maxWidth: 60,
                                        maxHeight: 60,
                                        mr: 5,
                                        border: '1px solid #aaaaaa',
                                        objectFit: 'contain',
                                      },
                                    }}>
                                    <img
                                      src={optionImageList[index]}
                                      className='thumbnail'
                                    />
                                  </Box>
                                </>
                              ) : (
                                <>
                                  <RemoveIcon sx={{ mr: 3, fontSize: 16 }} />
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      width: 60,
                                      height: 60,
                                      ml: 3,
                                      mr: 5,
                                      fontSize: 13,
                                    }}>
                                    Không có
                                  </Box>
                                </>
                              ))}
                            <RemoveCircleOutlineIcon
                              onClick={() => handleRemoveOption(index)}
                            />
                          </Box>
                        ))
                      ) : (
                        <>Không có</>
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
                      {option ? (
                        <ImageUpload
                          title={'Ảnh:'}
                          value={optionImage}
                          onUploadChange={handleOptionImageUpload}
                        />
                      ) : (
                        <Box display={'flex'}>
                          <Typography mr={2}>Ảnh:</Typography>
                          <Button
                            disabled
                            sx={{
                              width: 80,
                              height: 30,
                              mr: 0,
                            }}
                            variant='contained'>
                            <UploadIcon />
                          </Button>
                        </Box>
                      )}
                    </Grid2>
                    <Grid2 size={1}>
                      <AddCircleOutlineOutlinedIcon
                        sx={{
                          fontSize: 30,
                          color: option ? '' : '#ccc',
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
                        sx={{ ml: 2, textTransform: 'initial' }}
                        variant='contained'
                        disabled={
                          !variantName || optionList?.length === 0
                            ? true
                            : false
                        }
                        onClick={handleSaveVariant}>
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
                        onClick={handleDelAllVariant}>
                        Xoá tất cả
                      </Button>
                    </Box>
                  </Grid2>
                </Box>
              </Grid2>
              <Grid2
                sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2 }}
                size={6}
                container
                rowSpacing={2}>
                <Typography>Danh sách biến thể:</Typography>
                {/* <Grid2 size={4}></Grid2> */}
                {variants?.length > 0 ? (
                  variants?.map((variant, index) => (
                    <Grid2
                      sx={{
                        padding: 2,
                        border: '1px solid #ccc',
                        borderRadius: 2,
                      }}
                      key={variant?.name}
                      size={12}>
                      <Box>
                        <Grid2 container>
                          <Grid2 size={3} fontSize={15}>
                            Tên:
                          </Grid2>
                          <Grid2 size={2} fontSize={15}>
                            <Typography>{variant?.name}</Typography>
                          </Grid2>
                          <Grid2
                            sx={{
                              justifyContent: 'end',
                              display: 'flex',
                            }}
                            size={7}>
                            <Button
                              sx={{
                                minWidth: 40,
                                width: 40,
                                height: 30,
                                mb: 1,
                                mr: 1,
                              }}
                              variant='outlined'
                              onClick={() => handleEditVariant(variant, index)}>
                              <EditOutlinedIcon sx={{ fontSize: 20 }} />
                            </Button>
                            <Button
                              sx={{ minWidth: 40, width: 40, height: 30 }}
                              variant='outlined'
                              onClick={() => handleDeleteVariant(index)}>
                              <DeleteOutlineOutlinedIcon
                                sx={{ fontSize: 20 }}
                              />
                            </Button>
                          </Grid2>
                          <Grid2 size={12}>
                            <Box>
                              <Grid2 container>
                                <Grid2 size={3}>
                                  <Typography fontSize={15}>
                                    Tuỳ chọn:
                                  </Typography>
                                </Grid2>
                                <Grid2 size={9}>
                                  <Box>
                                    {variant?.options?.map((option, index) => (
                                      <Box
                                        display={'flex'}
                                        alignItems={'center'}
                                        key={option}>
                                        <Typography sx={{ width: 100 }}>
                                          {option}
                                        </Typography>
                                        {variant?.images !== undefined &&
                                          variant?.images?.length > 0 && (
                                            <Box
                                              display={'flex'}
                                              alignItems={'center'}>
                                              <RemoveIcon
                                                sx={{ mr: 3, fontSize: 14 }}
                                              />
                                              {variant?.images?.[index] ? (
                                                <Box
                                                  sx={{
                                                    position: 'relative',
                                                    '.thumbnail': {
                                                      width: 40,
                                                      height: 40,
                                                      border:
                                                        '1px solid #aaaaaa',
                                                      objectFit: 'contain',
                                                    },
                                                  }}>
                                                  <img
                                                    src={
                                                      variant?.images?.[index]
                                                    }
                                                    className='thumbnail'
                                                  />
                                                </Box>
                                              ) : (
                                                <Box
                                                  sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    height: 40,
                                                    fontSize: 14,
                                                  }}>
                                                  Không có
                                                </Box>
                                              )}
                                            </Box>
                                          )}
                                      </Box>
                                    ))}
                                  </Box>
                                </Grid2>
                              </Grid2>
                            </Box>
                          </Grid2>
                        </Grid2>
                      </Box>
                    </Grid2>
                  ))
                ) : (
                  <Grid2 size={12} textAlign={'center'}>
                    Trống
                  </Grid2>
                )}
              </Grid2>
            </Grid2>
          )}
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
