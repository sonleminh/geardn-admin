import ProductCard from '@/components/ProductCard';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Box, Typography } from '@mui/material';

import { ArcElement, Chart as ChartJS, Legend, Title, Tooltip } from 'chart.js';

import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface IProduct {
  productId: number;
  productName: string;
  imageUrl: string;
  quantitySold: number;
  sellingPrice: number;
}

interface TopProductsCarouselProps {
  products: IProduct[];
  isLoading?: boolean;
}

function TopProductsCarousel({ products }: TopProductsCarouselProps) {
  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}>
        <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
          Top sản phẩm bán chạy
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            '> div > svg': {
              fontSize: 30,
              ':hover': {
                bgcolor: '#222',
                color: '#fff',
                borderRadius: 2,
                cursor: 'pointer',
              },
            },
          }}>
          <Box className={`arrow-left`} sx={{ mr: 1 }}>
            <KeyboardArrowLeftIcon />
          </Box>
          <Box className={`arrow-right`}>
            <KeyboardArrowRightIcon />
          </Box>
        </Box>
      </Box>
      <Swiper
        slidesPerView={3}
        spaceBetween={24}
        navigation={{
          prevEl: `.arrow-left`,
          nextEl: `.arrow-right`,
        }}
        modules={[Navigation]}
        breakpoints={{
          0: { slidesPerView: 1, spaceBetween: 0 },
          600: { slidesPerView: 2, spaceBetween: 16 },
          1200: { slidesPerView: 3.2, spaceBetween: 24 },
          1500: { slidesPerView: 5, spaceBetween: 10 },
        }}
        className='mySwiper'>
        {products.map((product) => (
          <SwiperSlide key={product.productId}>
            <Box sx={{ p: 1 }}>
              <ProductCard data={product} />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}

export default TopProductsCarousel;
