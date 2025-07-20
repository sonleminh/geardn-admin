import { useNavigate, useParams } from 'react-router-dom';

import CKEditor from '@/components/CKEditor';
import Input from '@/components/Input';

import { useGetProductById } from '@/services/product';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  Grid2,
  Link,
  Switch,
  Typography,
} from '@mui/material';

import { ROUTES } from '@/constants/route';
import { useMemo } from 'react';
import { useGetEnumByContext } from '@/services/enum';

const ProductUpsert = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: productData } = useGetProductById(id ? +id : 0);
  const { data: productStatusEnumData } = useGetEnumByContext('product-status');

  const statusMap = useMemo(
    () =>
      Object.fromEntries(
        productStatusEnumData?.data?.map((item) => [item.value, item.label]) ??
          []
      ),
    [productStatusEnumData?.data]
  );

  return (
    <>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize='small' />}
        aria-label='breadcrumb'
        sx={{ mb: 3 }}>
        <Link
          underline='hover'
          color='inherit'
          onClick={() => navigate(ROUTES.DASHBOARD)}
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
        <Typography color='text.primary'>Chi tiết sản phẩm</Typography>
      </Breadcrumbs>

      <Typography sx={{ mb: 2, fontSize: 20, fontWeight: 600 }}>
        Chi tiết sản phẩm:
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Grid2 container spacing={3}>
          <Grid2 size={6}>
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
                    variant='filled'
                    size='small'
                    disabled
                    value={productData?.data?.name ?? ''}
                  />
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <FormControl variant='filled' fullWidth>
                    <Input
                      label='Danh mục'
                      variant='filled'
                      size='small'
                      disabled
                      value={productData?.data?.category?.name ?? ''}
                    />
                  </FormControl>
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <Box sx={{ display: 'flex' }}>
                    <Typography mr={2}>Ảnh:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                      {productData?.data?.images?.map((item) => (
                        <Box
                          key={item}
                          sx={{
                            height: 80,
                            img: {
                              width: 80,
                              height: 80,
                              mr: 1,
                              objectFit: 'contain',
                              border: '1px solid #ccc',
                            },
                          }}>
                          <img src={item} alt={productData?.data?.name} />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <FormControl fullWidth margin='normal'>
                    <Typography>
                      Trạng thái:
                      <Button
                        variant='outlined'
                        color={
                          productData?.data?.status === 'ACTIVE'
                            ? 'success'
                            : productData?.data?.status === 'DRAFT'
                            ? 'primary'
                            : productData?.data?.status === 'DISCONTINUED'
                            ? 'warning'
                            : 'error'
                        }
                        size='small'
                        sx={{
                          width: 120,
                          ml: 2,
                          fontSize: 13,
                          textTransform: 'none',
                        }}>
                        {statusMap?.[productData?.data?.status ?? ''] ||
                          'Không xác định'}
                      </Button>
                    </Typography>
                  </FormControl>
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <Box sx={{ display: 'flex' }}>
                    <Typography mr={2}>Tag:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                      {productData?.data?.tags && productData?.data?.tags.length
                        ? productData?.data?.tags?.map((item) => (
                            <Chip
                              key={item?.value}
                              label={item?.label}
                              sx={{
                                minWidth: '80px',
                                mr: 1,
                                fontSize: 14,
                                borderRadius: 1,
                                border: '1px solid #ccc',
                                backgroundColor: '#fff',
                                color: '#000',
                              }}
                            />
                          ))
                        : 'Không có'}
                    </Box>
                  </Box>
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <Box sx={{ textAlign: 'start' }}>
                    <FormControlLabel
                      value={productData?.data?.isVisible}
                      control={
                        <Switch
                          color='primary'
                          checked={productData?.data?.isVisible}
                          disabled
                        />
                      }
                      label='Hiển thị:'
                      labelPlacement='start'
                      sx={{ ml: 0 }}
                    />
                  </Box>
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <Typography mb={1}>Mô tả:</Typography>
                  <Box sx={{ cursor: 'not-allowed' }}>
                    <CKEditor
                      value={productData?.data?.description ?? ''}
                      disabled
                    />
                  </Box>
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
                    disabled
                    value={productData?.data?.brand ?? ''}
                  />
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <Input
                    label='Bảo hành'
                    name='details.guarantee'
                    variant='filled'
                    size='small'
                    disabled
                    value={productData?.data?.details?.guarantee ?? ''}
                  />
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <Input
                    label='Trọng lượng'
                    name='details.weight'
                    variant='filled'
                    size='small'
                    disabled
                    value={productData?.data?.details?.weight ?? ''}
                  />
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <Input
                    label='Chất liệu'
                    name='details.material'
                    variant='filled'
                    size='small'
                    disabled
                    value={productData?.data?.details?.material ?? ''}
                  />
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <Input
                    label='Slug'
                    name='slug'
                    variant='filled'
                    size='small'
                    disabled
                    value={productData?.data?.slug ?? ''}
                  />
                </FormControl>
              </CardContent>
            </Card>
          </Grid2>
          <Box
            sx={{
              width: '100%',
              mt: 2,
              display: 'flex',
              justifyContent: 'flex-end',
            }}>
            <Button onClick={() => navigate(ROUTES.PRODUCT)} sx={{ mr: 2 }}>
              Trở lại
            </Button>
            <Button
              variant='contained'
              onClick={() => navigate(`/product/update/${id}`)}>
              Chỉnh sửa
            </Button>
          </Box>
        </Grid2>
      </Box>
    </>
  );
};

export default ProductUpsert;
