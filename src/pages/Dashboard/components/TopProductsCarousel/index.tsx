import { IProfitRevenueDailyStats } from '@/interfaces/IProfitRevenueDailyStats';
import { Box } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import React from 'react';
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
// import ProductCard from '@/components/ProductCard'; // Uncomment and adjust path as needed

// Temporary placeholder for ProductCard to avoid linter error. Replace with actual import.
const ProductCard = ({ data }: { data: IProduct }) => (
  <Box
    sx={{
      border: '1px solid #eee',
      borderRadius: 2,
      p: 2,
      textAlign: 'center',
    }}>
    <Box
      sx={{
        height: 40,
        img: {
          width: 40,
          height: 40,
          mr: 1,
          objectFit: 'contain',
        },
      }}>
      <img src={data?.image} alt={data?.name} />
    </Box>
    <div className='mt-2 font-medium'>{data.name}</div>
  </Box>
);
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface IProduct {
  id: number;
  name: string;
  image: string;
  // Add other product fields as needed
}

interface TopProductsCarouselProps {
  products: IProduct[];
  isLoading?: boolean;
}

function TopProductsCarousel({
  products,
  isLoading = false,
}: TopProductsCarouselProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', gap: 2 }}>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant='rectangular' width={220} height={320} />
          ))}
        </Box>
      ) : (
        <Swiper
          slidesPerView={3}
          spaceBetween={24}
          navigation
          modules={[Navigation]}
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 0 },
            600: { slidesPerView: 2, spaceBetween: 16 },
            1200: { slidesPerView: 3.2, spaceBetween: 24 },
            1500: { slidesPerView: 4, spaceBetween: 32 },
          }}
          className='mySwiper'>
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <Box sx={{ p: 1 }}>
                <ProductCard data={product} />
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </Box>
  );
}

export default TopProductsCarousel;
