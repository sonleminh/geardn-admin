import { IOrderItem } from '@/interfaces/IOrder';
import { truncateTextByLine } from '@/utils/css-helper.util';
import { formatPrice } from '@/utils/format-price';
import { Box, Typography } from '@mui/material';

interface OrderItemProps {
  item: IOrderItem;
}

export const OrderItem = ({ item }: OrderItemProps) => {
  const productName = item?.productName;
  const imageUrl = item?.imageUrl;
  const quantity = item?.quantity;
  const sellingPrice = item?.sellingPrice;
  const attributes = item?.skuAttributes;

  return (
    <Box
      my={1}
      sx={{
        display: 'flex',
        p: 1,
        bgcolor: '#fafafa',
        border: '1px solid #dadada',
        borderRadius: 1,
      }}>
      <Box
        sx={{
          height: 40,
          '.thumbnail': {
            width: 40,
            height: 40,
            mr: 1,
            objectFit: 'contain',
          },
        }}>
        <img src={imageUrl} className='thumbnail' alt={productName} />
      </Box>
      <Box>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 500,
            ...truncateTextByLine(1),
          }}>
          {productName}
        </Typography>

        <Typography sx={{ fontSize: 13 }}>SL: {quantity}</Typography>
        <Typography sx={{ fontSize: 13 }}>
          Giá: {formatPrice(sellingPrice)}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          ml: 2,
        }}>
        {attributes?.length
          ? attributes.map((attr, index) => (
              <Typography key={index} sx={{ fontSize: 13 }}>
                {attr?.attribute}: {attr?.value}
              </Typography>
            ))
          : null}
      </Box>
    </Box>
  );
};
