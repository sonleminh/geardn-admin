import { useNavigate, useParams } from 'react-router-dom';

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
  Link,
  Typography,
} from '@mui/material';

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';

import { ROUTES } from '@/constants/route';
import { useGetSkuById } from '@/services/sku';

import Input from '@/components/Input';

const ProductSkuDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: skuData } = useGetSkuById(id ? +id : 0);

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
            Chi tiết phân loại sản phẩm
          </Typography>
        </Breadcrumbs>
      </Box>

      <Typography sx={{ mb: 2, fontSize: 20, fontWeight: 600 }}>
        Phân loại sản phẩm: {skuData?.data?.product?.name ?? ''} -{' '}
        {skuData?.data?.sku ?? ''}
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
                <FormControl fullWidth>
                  <Input
                    label='Giá bán'
                    name='sellingPrice'
                    variant='filled'
                    type='number'
                    size='small'
                    value={skuData?.data?.sellingPrice ?? ''}
                  />
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <Box sx={{ display: 'flex' }}>
                    <Typography mr={2}>Ảnh:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                      {skuData?.data?.imageUrl ? (
                        <Box
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
                          <img
                            src={skuData?.data?.imageUrl}
                            alt={skuData?.data?.sku}
                          />
                        </Box>
                      ) : (
                        'Không có ảnh'
                      )}
                    </Box>
                  </Box>
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
                {skuData?.data?.productSkuAttributes &&
                skuData?.data?.productSkuAttributes?.length > 0 ? (
                  <Grid2 size={12} className='attribute-list'>
                    {skuData?.data?.productSkuAttributes?.map((item) => {
                      return (
                        <Box
                          key={item?.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            my: 1.5,
                            p: '12px 20px',
                            border: '1px solid #ccc',
                            borderRadius: 1,
                          }}>
                          <Typography
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              minWidth: 180,
                            }}>
                            <StyleOutlinedIcon sx={{ mr: 1, fontSize: 20 }} />
                            Tên: {item?.attributeValue?.attribute?.label ?? ''}
                          </Typography>

                          <Typography
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              minWidth: 180,
                            }}>
                            <LocalOfferOutlinedIcon
                              sx={{ mr: 1, fontSize: 20 }}
                            />
                            Giá trị: {item?.attributeValue?.value ?? ''}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Grid2>
                ) : (
                  <Typography>Không có phân loại sản phẩm</Typography>
                )}
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>
        <Box sx={{ textAlign: 'end' }}>
          <Button onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            Trở lại
          </Button>
          <Button
            variant='outlined'
            onClick={() =>
              navigate(`${ROUTES.PRODUCT}/sku/update/${skuData?.data?.id}`)
            }>
            Chỉnh sửa
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default ProductSkuDetail;
