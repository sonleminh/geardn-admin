import { useParams } from 'react-router-dom';

import { useGetProductBySlug } from '@/services/product';

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid2,
  Typography,
} from '@mui/material';

const ProductDetailPage = () => {
  const { slug } = useParams();

  const { data: product } = useGetProductBySlug(slug as string);

  return (
    <Card sx={{ borderRadius: 2 }}>
      <Card sx={{ mt: 3, borderRadius: 2 }}>
        <CardHeader
          title={
            <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
              Chi tiết sản phẩm:
            </Typography>
          }
        />
        <Divider />

        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Grid2 container rowSpacing={2} columnSpacing={4}>
            <Grid2 size={12}>
              <Typography variant='subtitle1'>
                Tên: {product?.data?.name}
              </Typography>
            </Grid2>

            <Grid2 size={6}>
              <Typography variant='subtitle1'>
                Danh mục: {product?.data?.category?.name}
              </Typography>
            </Grid2>

            <Grid2 size={6}>
              <Typography variant='subtitle1'>
                Tags: {product?.data?.tags?.map((tag) => tag.name).join(', ')}
              </Typography>
            </Grid2>

            <Grid2 size={6}>
              <Typography variant='subtitle1'>
                Hãng: {product?.data?.brand}
              </Typography>
            </Grid2>
          </Grid2>

          <Box>
            <Typography variant='subtitle1'>Chi tiết:</Typography>
            <Grid2 container spacing={4}>
              <Grid2>
                <Typography>
                  Thời gian bảo hành: {product?.data?.details?.guarantee}
                </Typography>
              </Grid2>
              <Grid2 size={3}>
                <Typography>
                  Trọng lượng: {product?.data?.details?.weight}
                </Typography>
              </Grid2>
              <Grid2 size={3}>
                <Typography>
                  Chất liệu: {product?.data?.details?.material}
                </Typography>
              </Grid2>
            </Grid2>
          </Box>

          <Box>
            <Typography variant='subtitle1'>Ảnh:</Typography>
            {product?.data?.images?.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Product image ${index + 1}`}
                style={{ width: 100, height: 100, margin: 5 }}
              />
            ))}
          </Box>

          <Box>
            <Typography variant='subtitle1'>Mô tả:</Typography>
            <Typography>{product?.data?.description}</Typography>
          </Box>
        </CardContent>
      </Card>
    </Card>
  );
};

export default ProductDetailPage;
