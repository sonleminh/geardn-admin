import { Box, Button, Link, Typography } from '@mui/material';
import React from 'react';
import StarRateIcon from '@mui/icons-material/StarRate';
import { IProduct } from '@/interfaces/IProduct';
import { formatPrice } from '@/utils/format-price';
import { truncateTextByLine } from '@/utils/css-helper.util';

const ProductCard = ({
  data,
}: {
  data: {
    productId: number;
    productName: string;
    imageUrl: string;
    quantity: number;
    price: number;
  };
}) => {
  return (
    <Link href={``}>
      <Box
        sx={{
          bgcolor: '#fff',
          borderRadius: '8px',
          overflow: 'hidden',
          ':hover': {
            boxShadow:
              '0 1px 3px 0 rgba(0, 0, 0, .1), 0 1px 2px -1px rgba(0, 0, 0, .1)',
            '& img': {
              transform: 'scale(1.05)',
            },
          },
        }}>
        <Box
          sx={{
            height: 100,
            img: {
              width: 100,
              height: 100,
              mr: 1,
              objectFit: 'contain',
            },
          }}>
          <img src={data?.imageUrl} alt={data?.productName} />
        </Box>
      </Box>
      <Box sx={{ p: '12px' }}>
        <Typography
          sx={{
            height: 42,
            mb: 1,
            fontSize: 14,
            fontWeight: 500,
            ...truncateTextByLine(2),
          }}>
          {data?.productName}
        </Typography>
      </Box>
    </Link>
  );
};

export default ProductCard;
