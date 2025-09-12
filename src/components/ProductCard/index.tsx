import { truncateTextByLine } from '@/utils/css-helper.util';
import { formatPrice } from '@/utils/format-price';
import { Box, Typography } from '@mui/material';

const ProductCard = ({
  data,
}: {
  data: {
    productId: number;
    productName: string;
    imageUrl: string;
    quantitySold: number;
    sellingPrice: number;
  };
}) => {
  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}>
      <Box
        sx={{
          overflow: 'hidden',
          ':hover': {
            '& img': {
              transform: 'scale(1.05)',
            },
          },
        }}>
        <Box
          sx={{
            img: {
              width: '100%',
              mr: 1,
              objectFit: 'contain',
              transition: 'all 0.5s ease',
            },
          }}>
          <img src={data?.imageUrl} alt={data?.productName} />
        </Box>
      </Box>
      <Box sx={{ pt: '12px' }}>
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Typography sx={{ fontWeight: 500 }}>
            {formatPrice(data?.sellingPrice)}
          </Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
            Sold: {data?.quantitySold}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductCard;
