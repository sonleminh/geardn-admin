import { useParams } from 'react-router-dom';

import { useGetProductBySlug } from '@/services/product';

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  Grid,
  TextField,
  MenuItem,
  Select,
  Grid2,
  InputLabel,
  Typography,
  Autocomplete,
} from '@mui/material';
import Input from '@/components/Input';
import CKEditor from '@/components/CKEditor';

const ProductDetail = () => {
  const { slug } = useParams();

  const { data: product } = useGetProductBySlug(slug as string);

  return (
    <>
      <Typography sx={{ mb: 2, fontSize: 24, fontWeight: 600 }}>
        Chi tiết sản phẩm:
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Grid2 container spacing={3}>
          {/* Left Column */}
          <Grid2 size={6}>
            {/* Name and Description */}
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title='Thông tin chung'
                sx={{
                  span: {
                    fontSize: 20,
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
                    value={product?.data?.name}
                  />
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <Input
                    label='Danh mục'
                    name='name'
                    variant='filled'
                    size='small'
                    required
                    value={product?.data?.category?.name}
                  />
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  {product?.data?.images?.map((image) => (
                    <Box
                      sx={{
                        height: 100,
                        '.thumbnail': {
                          width: 100,
                          height: 100,
                          mr: 1,
                          objectFit: 'contain',
                        },
                      }}>
                      <img
                        src={image}
                        className='thumbnail'
                        alt={product?.data?.name}
                      />
                    </Box>
                  ))}
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <Typography mb={1}>
                    Mô tả:
                    <Typography component={'span'} color='red'>
                      *
                    </Typography>
                  </Typography>
                  <CKEditor value={product?.data?.description ?? ''} />
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <Typography mb={1}>Chi tiết sản phẩm:</Typography>
                </FormControl>
              </CardContent>
            </Card>
          </Grid2>
          {/* Right Column */}
          <Grid2 size={6}>
            {/* Product Image */}
            <Card>
              <CardHeader title='Phân loại sản phẩm' />
              <Divider />
              <CardContent>
                {/* Implement image upload and preview here */}
                <Box
                  sx={{
                    border: '1px dashed #ccc',
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}>
                  Click to Upload
                </Box>
                {/* Show image previews here */}
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>
      </Box>
    </>
  );
};

export default ProductDetail;
