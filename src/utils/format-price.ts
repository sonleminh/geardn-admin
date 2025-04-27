export const formatPrice = (price: number) => {
    if (typeof price !== 'number' || isNaN(price)) return '0 đ';
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,  // nếu muốn không có số lẻ
      maximumFractionDigits: 2   // cho phép tối đa 2 số lẻ nếu có
    }).format(price) + ' đ';
  }
  