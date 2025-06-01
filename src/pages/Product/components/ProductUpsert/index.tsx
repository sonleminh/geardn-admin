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

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
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
  TableBody,
  TableRow,
  TableHead,
  Table,
  TableCell,
  TableContainer,
  TextField,
  Theme,
  AutocompleteRenderInputParams,
  Typography,
  Breadcrumbs,
  Link,
  Skeleton,
} from '@mui/material';

import { useGetCategoryList } from '@/services/category';
import { useGetEnumByContext } from '@/services/enum';
import { TableSkeleton } from '@/components/TableSkeleton';
import { formatPrice } from '@/utils/format-price';
import { TableColumn } from '@/interfaces/ITableColumn';
import { ROUTES } from '@/constants/route';
import { useGetWarehouseList } from '@/services/warehouse';

const columns: TableColumn[] = [
  { align: 'center' },
  { align: 'center' },
  {},
  { align: 'center' },
  { align: 'center' },
];

const ProductUpsert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [tags, setTags] = useState<ITagOptions[]>([]);

  const isEdit = !!id;

  const { data: initData } = useGetProductInitial();
  const { data: productData, isLoading: isProductLoading } = useGetProductById(
    id ? +id : 0
  );
  const { data: categoryList } = useGetCategoryList();
  const { data: tagData } = useGetEnumByContext('product-tag');
  const { data: warehousesData, isLoading: isLoadingWarehouses } =
    useGetWarehouseList();

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
      slug: '',
    },
    // validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      const { details, ...rest } = values;

      const isDetailsEmpty = Object.values(details).every((value) => !value);

      const payload: IProductPayload = {
        ...rest,
        ...(isDetailsEmpty ? {} : { details }),
        tags,
        categoryId: +values.categoryId,
      } as IProductPayload;

      if (isEdit) {
        updateProductMutate(
          { id: +id, ...payload },
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
      formik.setFieldValue('name', productData?.data?.name);
      formik.setFieldValue('categoryId', productData?.data?.categoryId);
      formik.setFieldValue('tags', productData?.data?.tags);
      formik.setFieldValue('images', productData?.data?.images);
      formik.setFieldValue('brand', productData?.data?.brand);
      formik.setFieldValue('description', productData?.data?.description);
      formik.setFieldValue(
        'details.guarantee',
        productData?.data?.details?.guarantee
      );
      formik.setFieldValue(
        'details.weight',
        productData?.data?.details?.weight
      );
      formik.setFieldValue(
        'details.material',
        productData?.data?.details?.material
      );
      formik.setFieldValue('slug', productData?.data?.slug);
      setTags(productData?.data?.tags);
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

  const handleSelectChange = (e: SelectChangeEvent<unknown>) => {
    formik.setFieldValue('categoryId', e.target.value);
  };

  const handleUploadResult = (result: string[]) => {
    formik.setFieldValue('images', result);
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
            onClick={() => navigate(ROUTES.HOME)}
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <HomeOutlinedIcon sx={{ fontSize: 24 }} />
          </Link>
          <Link
            underline='hover'
            color='inherit'
            onClick={() => navigate(ROUTES.PRODUCT)}
            sx={{ cursor: 'pointer' }}>
            Sản phẩm
          </Link>
          <Typography color='text.primary'>
            {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Typography sx={{ mb: 2, fontSize: 20, fontWeight: 600 }}>
        {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}:
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Grid2 container spacing={3}>
          <Grid2 size={6}>
            {/* Name and Description */}
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title='Thông tin chung'
                sx={{
                  span: {
                    fontSize: 18,
                    fontWeight: 500,
                  },
                }}
              />
              <Divider />
              <CardContent>
                <FormControl fullWidth margin='normal'>
                  <Input
                    label='Tên sản phẩm'
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
                <FormControl fullWidth margin='normal'>
                  <FormControl variant='filled' fullWidth>
                    <InputLabel>Danh mục</InputLabel>
                    <Select
                      disableUnderline
                      size='small'
                      name='categoryId'
                      onChange={handleSelectChange}
                      value={formik?.values?.categoryId}>
                      {categoryList?.data?.map((item) => (
                        <MenuItem key={item.id} value={item?.id}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      <Box component={'span'} sx={helperTextStyle}>
                        {formik.errors?.categoryId}
                      </Box>
                    </FormHelperText>
                  </FormControl>
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <Typography mb={1}>
                    Ảnh:
                    <Typography component={'span'} color='red'>
                      *
                    </Typography>
                  </Typography>
                  <MultipleFileUpload
                    helperText={
                      <Box component={'span'} sx={helperTextStyle}>
                        {formik.errors.images}
                      </Box>
                    }
                    value={formik?.values?.images}
                    onUploadChange={handleUploadResult}
                  />
                </FormControl>
                <FormControl fullWidth margin='normal'>
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
                <FormControl fullWidth margin='normal'>
                  <Autocomplete
                    multiple
                    fullWidth
                    options={tagData?.data ?? []}
                    disableCloseOnSelect
                    value={tags}
                    onChange={(
                      e: React.ChangeEvent<unknown>,
                      val: ITagOptions[]
                    ) => handleTagChange(e, val)}
                    isOptionEqualToValue={(
                      option: ITagOptions,
                      value: ITagOptions
                    ) => option?.value === value?.value}
                    renderInput={(params: AutocompleteRenderInputParams) => (
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
                <FormControl fullWidth margin='normal'>
                  <Typography mb={1}>
                    Trạng thái:{' '}
                    {productData?.data?.isDeleted ? 'Đã xóa' : 'Hoạt động'}
                  </Typography>
                </FormControl>
              </CardContent>
            </Card>
          </Grid2>
          <Grid2 size={6}>
            <Card>
              <CardHeader
                title='Thông tin chi tiết'
                sx={{
                  span: {
                    fontSize: 18,
                    fontWeight: 500,
                  },
                }}
              />
              <Divider />
              <CardContent>
                <FormControl fullWidth margin='normal'>
                  <Input
                    label='Hãng'
                    name='brand'
                    variant='filled'
                    size='small'
                    value={formik?.values.brand}
                    onChange={handleChangeValue}
                  />
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <Input
                    label='Bảo hành'
                    name='details.guarantee'
                    variant='filled'
                    size='small'
                    value={formik?.values.details.guarantee}
                    onChange={handleChangeValue}
                  />
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <Input
                    label='Trọng lượng'
                    name='details.weight'
                    variant='filled'
                    size='small'
                    value={formik?.values.details.weight}
                    onChange={handleChangeValue}
                  />
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <Input
                    label='Chất liệu'
                    name='details.material'
                    variant='filled'
                    size='small'
                    value={formik?.values.details.material}
                    onChange={handleChangeValue}
                  />
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <Input
                    label='Slug'
                    name='slug'
                    variant='filled'
                    size='small'
                    disabled
                    value={formik?.values?.slug}
                  />
                </FormControl>
              </CardContent>
            </Card>
            <Box sx={{ mt: 2, textAlign: 'end' }}>
              <Button onClick={() => navigate(ROUTES.PRODUCT)} sx={{ mr: 2 }}>
                Trở lại
              </Button>
              <Button variant='contained' onClick={() => formik.handleSubmit()}>
                Lưu
              </Button>
            </Box>
          </Grid2>
          <Grid2 size={12}>
            <Card>
              <CardHeader
                title='Phân loại sản phẩm'
                sx={{
                  span: {
                    fontSize: 18,
                    fontWeight: 500,
                  },
                }}
              />
              <Divider />
              <CardContent>
                <TableContainer>
                  {isProductLoading || isLoadingWarehouses ? (
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell align='center'>STT</TableCell>
                          <TableCell align='center'>Ảnh</TableCell>
                          <TableCell>Phân loại</TableCell>
                          <TableCell align='center'>Giá bán</TableCell>
                          {[1, 2].map((index) => (
                            <TableCell align='center' key={index}>
                              <Skeleton width={100} />
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[1, 2, 3].map((index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography align='center'>
                                <Skeleton width={20} />
                              </Typography>
                            </TableCell>
                            <TableCell align='center'>
                              <Box
                                sx={{
                                  height: 40,
                                  '.thumbnail': {
                                    width: 40,
                                    height: 40,
                                  },
                                }}>
                                <Skeleton
                                  variant='rectangular'
                                  width={40}
                                  height={40}
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 1,
                                }}>
                                <Skeleton width={100} />
                                <Skeleton width={80} />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography align='center'>
                                <Skeleton width={80} />
                              </Typography>
                            </TableCell>
                            {[1, 2, 3].map((warehouseIndex) => (
                              <TableCell align='center' key={warehouseIndex}>
                                <Skeleton width={60} />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell align='center'>STT</TableCell>
                          <TableCell align='center'>Ảnh</TableCell>
                          <TableCell>Phân loại</TableCell>
                          <TableCell align='center'>Giá bán</TableCell>
                          {warehousesData?.data?.map((warehouse) => (
                            <TableCell align='center' key={warehouse?.id}>
                              {warehouse?.name}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {productData?.data?.skus?.length ? (
                          productData?.data?.skus?.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Typography align='center'>
                                  {index + 1}
                                </Typography>
                              </TableCell>
                              <TableCell align='center'>
                                <Box
                                  sx={{
                                    height: 40,
                                    '.thumbnail': {
                                      width: 40,
                                      height: 40,
                                      objectFit: 'contain',
                                    },
                                  }}>
                                  <img
                                    src={item?.imageUrl}
                                    className='thumbnail'
                                  />
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                  }}>
                                  {item?.productSkuAttributes?.length
                                    ? item?.productSkuAttributes?.map(
                                        (item) => (
                                          <Typography sx={{ fontSize: 14 }}>
                                            {
                                              item?.attributeValue?.attribute
                                                ?.label
                                            }
                                            : {item?.attributeValue?.value}
                                          </Typography>
                                        )
                                      )
                                    : ''}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography align='center'>
                                  {formatPrice(item?.price)}
                                </Typography>
                              </TableCell>
                              {warehousesData?.data?.map(
                                (warehouse, warehouseIndex) => (
                                  <TableCell align='center' key={warehouse?.id}>
                                    {item?.stocks?.[warehouseIndex]?.quantity ??
                                      'Không có'}
                                  </TableCell>
                                )
                              )}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell align='center' colSpan={6}>
                              Không có dữ liệu
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </TableContainer>
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>
      </Box>
      {(isCreatePending || isUpdatePending) && <SuspenseLoader />}
    </>
  );
};

export default ProductUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
