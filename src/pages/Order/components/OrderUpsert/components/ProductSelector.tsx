// React and State Management
import { useEffect, useState } from 'react';

// UI Libraries
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  FormControl,
  Grid2,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Typography,
} from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Input from '@/components/Input';
import LoadingSelect from '@/components/LoadingSelect';

import { useNotificationContext } from '@/contexts/NotificationContext';

import { ICategory } from '@/interfaces/ICategory';
import { IModel } from '@/interfaces/IModel';
import { ICreateOrderItem, IOrder, IOrderItem } from '@/interfaces/IOrder';

import { useGetProductByCateId, useGetProductById } from '@/services/product';

import { formatPrice } from '@/utils/format-price';
import { useGetCategoryList } from '@/services/category';
import { IProductSku } from '@/interfaces/IProductSku';
import { truncateTextByLine } from '@/utils/css-helper.util';

interface ProductSelectorProps {
  isEdit: boolean;
  orderData?: IOrder;
  orderItems: ICreateOrderItem[];
  setOrderItems: React.Dispatch<React.SetStateAction<ICreateOrderItem[]>>;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  isEdit,
  orderData,
  orderItems,
  setOrderItems,
}) => {
  const { showNotification } = useNotificationContext();

  const [categoryId, setCategoryId] = useState<string>('');
  const [productId, setProductId] = useState<string>('');
  const [quantity, setQuantity] = useState('');
  const [selectedSkuId, setSelectedSkuId] = useState<string>('');
  const [selectedSku, setSelectedSku] = useState<IProductSku>();
  const [isOrderItemEdit, setIsOrderItemEdit] = useState<boolean>(false);
  const [itemIndex, setItemIndex] = useState<number | null>(null);

  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetCategoryList();
  const { data: productsByCategoryData, isLoading: isLoadingProducts } =
    useGetProductByCateId(+categoryId);

  const { data: productData, isLoading: isLoadingProduct } = useGetProductById(
    Number(productId)
  );

  console.log('orderItems:', orderItems);

  useEffect(() => {
    if (selectedSkuId && productData?.data) {
      setSelectedSku(
        productData?.data?.skus?.find((sku) => sku?.id === +selectedSkuId)
      );
      setCategoryId(productData?.data?.category?.id.toString());
    }
  }, [selectedSkuId, productData, productsByCategoryData, productId]);

  //   useEffect(() => {
  //     if (
  //       (isOrderItemEdit && product && modelIdEdit) ||
  //       (isOrderItemEdit && product)
  //     ) {
  //       setSelectedModel(
  //         product?.data?.models?.find((item) => item._id === modelIdEdit)?.extinfo
  //           .tier_index ?? []
  //       );
  //       setCategoryId(product?.data?.category?._id);
  //     }
  //   }, [isOrderItemEdit, product, modelIdEdit]);

  //   const handleVariantChange = (event: SelectChangeEvent, vIndex: number) => {
  //     const selectedOptionIndex = product?.tier_variations[
  //       vIndex
  //     ]?.options.indexOf(event.target.value);
  //     const updatedSelectedModel = [...selectedModel];
  //     updatedSelectedModel[vIndex] = selectedOptionIndex;
  //     setSelectedModel(updatedSelectedModel);
  //     setSelectedImage('');
  //     setQuantity('');
  //   };

  //   const getFilteredOptions = (vIndex: number) => {
  //     // If no previous option selected, show all options
  //     if (vIndex === 0) {
  //       return (
  //         product?.tier_variations[vIndex].options.filter((_, optionIndex) =>
  //           product.models.some(
  //             (model) => model?.extinfo?.tier_index?.[0] === optionIndex
  //           )
  //         ) ?? []
  //       );
  //     }

  //     // Filter options based on previous selections
  //     return (
  //       product?.tier_variations[vIndex]?.options.filter((_, optionIndex) =>
  //         product.models.some(
  //           (model) =>
  //             model?.extinfo?.tier_index?.[vIndex - 1] ===
  //               selectedModel?.[vIndex - 1] &&
  //             model?.extinfo?.tier_index?.[vIndex] === optionIndex
  //         )
  //       ) ?? []
  //     );
  //   };

  const hanldeUpsertOrderItem = () => {
    if (
      !isOrderItemEdit &&
      orderItems?.find((item) => item?.skuId === +selectedSkuId)
    ) {
      return showNotification('Sản phẩm đã có trong danh sách!', 'error');
    }
    // if (
    //   matchedModel &&
    //   +quantity >
    //     (orderData &&
    //     isOrderItemEdit &&
    //     itemIndex &&
    //     itemIndex < orderData?.items?.length
    //       ? matchedModel?.stock + orderData?.items?.[itemIndex ?? 0]?.quantity
    //       : matchedModel?.stock)
    // ) {
    //   return showNotification('Số lượng vượt quá hàng trong kho!!', 'error');
    // }

    const newItem = {
      productId: +productId,
      skuId: +selectedSkuId,
      quantity: +quantity,
      price: selectedSku?.price ?? 0,
      imageUrl: selectedSku?.imageUrl
        ? selectedSku?.imageUrl ?? ''
        : productData?.data?.images[0] ?? '',
      productName: productData?.data?.name ?? '',
      productSlug: productData?.data?.slug ?? '',
      skuCode: selectedSku?.sku ?? '',
      skuAttributes:
        selectedSku?.productSkuAttributes?.map((attribute) => ({
          attribute: attribute?.attributeValue?.attribute?.label,
          value: attribute?.attributeValue?.value,
        })) ?? [],
    };

    if (itemIndex !== null) {
      const updatedOrderItems = [...orderItems];
      updatedOrderItems[itemIndex] = newItem as IOrderItem;
      setOrderItems(updatedOrderItems);
      setItemIndex(null);
    } else if (productData && selectedSku) {
      setOrderItems((prev: ICreateOrderItem[]) => [...prev, newItem]);
    }

    setCategoryId('');
    setProductId('');
    setSelectedSkuId('');
    setSelectedSku(undefined);
    setQuantity('');
  };

  const handleEditOrderItem = (item: ICreateOrderItem, index: number) => {
    setIsOrderItemEdit(true);
    setProductId(item?.productId.toString());
    setSelectedSkuId(item?.skuId.toString());
    setSelectedSku(
      productData?.data?.skus?.find((sku) => sku?.id === +selectedSkuId)
    );
    setQuantity(`${item?.quantity}`);
    setItemIndex(index);
  };

  const handleDeleteOrderItem = (index: number) => {
    const updatedOrderItems = [...orderItems];
    updatedOrderItems.splice(index, 1);
    setOrderItems(updatedOrderItems);
  };

  const handleCancelUpsertOrderItem = () => {
    setIsOrderItemEdit(false);
    setCategoryId('');
    setProductId('');
    setQuantity('');
  };

  const totalAmount = () => {
    return orderItems?.reduce(
      (acc, item) => acc + (item?.price ?? 0) * (item?.quantity ?? 0),
      0
    );
  };

  return (
    <Card>
      <CardHeader
        title='Danh sách sản phẩm'
        sx={{
          span: {
            fontSize: 18,
            fontWeight: 500,
          },
        }}
      />
      <CardContent>
        <Grid2 container spacing={3}>
          <Grid2 size={5}>
            <Typography>Thêm sản phẩm:</Typography>
            <FormControl
              variant='filled'
              margin='dense'
              fullWidth
              sx={selectStyle}>
              <InputLabel>Danh mục</InputLabel>
              <LoadingSelect
                disableUnderline
                size='small'
                loading={isLoadingCategories}
                options={
                  categoriesData?.data?.map((item) => ({
                    value: item.id,
                    label: item.name,
                  })) ?? []
                }
                onChange={(e) => {
                  setCategoryId(e?.target?.value as string);
                  setProductId('');
                  setSelectedSkuId('');
                  setQuantity('');
                }}
                value={categoryId ?? ''}
              />
            </FormControl>
            <FormControl
              variant='filled'
              margin='dense'
              fullWidth
              sx={selectStyle}>
              <InputLabel>Sản phẩm</InputLabel>
              <LoadingSelect
                disableUnderline
                size='small'
                loading={isLoadingProducts}
                options={
                  productsByCategoryData?.data?.map((item) => ({
                    value: item.id,
                    label: item.name,
                  })) ?? []
                }
                onChange={(e) => {
                  setProductId(e.target.value as string);
                  setSelectedSkuId('');
                  setSelectedSku(undefined);
                  setQuantity('');
                }}
                value={productId ?? ''}
              />
            </FormControl>
            <FormControl
              variant='filled'
              margin='dense'
              fullWidth
              sx={selectStyle}>
              <InputLabel>Phân loại sản phẩm</InputLabel>
              <LoadingSelect
                disableUnderline
                size='small'
                loading={isLoadingProduct}
                options={
                  productData?.data?.skus?.map((item) => ({
                    value: item.id,
                    label: item.productSkuAttributes?.length ? (
                      <Box
                        key={item.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '100%',
                        }}>
                        <Box>
                          {item.productSkuAttributes.map((attribute, index) => (
                            <Typography
                              key={index}
                              component='span'
                              sx={{ fontSize: 14 }}>
                              {attribute?.attributeValue?.attribute?.label}:{' '}
                              {attribute?.attributeValue?.value}{' '}
                              {index < item.productSkuAttributes.length - 1 &&
                                '- '}
                            </Typography>
                          ))}
                        </Box>
                        <Typography
                          component='span'
                          sx={{ fontSize: 14, fontWeight: 'bold' }}>
                          {item.sku}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography component='span' sx={{ fontSize: 14 }}>
                        Không có phân loại - {item.sku}
                      </Typography>
                    ),
                  })) ?? []
                }
                onChange={(e) => {
                  setSelectedSkuId(e.target.value as string);
                  setQuantity('');
                }}
                value={selectedSkuId ?? ''}
              />
            </FormControl>

            {categoryId && productId && (
              <Box my={2}>
                <Grid2 container spacing={4}>
                  <Grid2 sx={{ display: 'flex' }} size={6}>
                    <Typography mr={2}>Ảnh:</Typography>
                    {selectedSku && (
                      <img
                        src={
                          selectedSku?.imageUrl ?? productData?.data?.images[0]
                        }
                        alt=''
                        style={{
                          width: '100%',
                          maxWidth: '60px',
                          height: '60px',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          objectFit: 'contain',
                        }}
                      />
                    )}
                  </Grid2>
                  <Grid2 size={6}>
                    <Typography>
                      Kho:{' '}
                      {
                        //   isEdit &&
                        // orderData &&
                        // isOrderItemEdit &&
                        // itemIndex &&
                        // itemIndex > orderData?.items?.length &&
                        selectedSku?.stocks?.reduce(
                          (acc, stock) => acc + stock?.quantity,
                          0
                        )
                      }
                    </Typography>
                  </Grid2>
                </Grid2>
              </Box>
            )}
            <FormControl fullWidth>
              <Input
                label='Số lượng'
                name='quantity'
                variant='filled'
                margin='dense'
                size='small'
                type='number'
                disabled={!selectedSku?.stocks?.length}
                // disabled={
                //   !isEdit &&
                //   selectedSku?.stocks?.reduce(
                //     (acc, stock) => acc + stock?.quantity,
                //     0
                //   ) === 0
                //     ? true
                //     : false
                // }
                // onKeyDown={(e) => {
                //   if (e.key === '-') {
                //     e.preventDefault();
                //   }
                //   if (quantity === '' && (e.key === '0' || e.key === 'Enter')) {
                //     e.preventDefault();
                //   }
                // }}
                onChange={(e) => {
                  const value = e.target.value;
                  if (
                    selectedSku &&
                    +value >
                      selectedSku?.stocks?.reduce(
                        (acc, stock) => acc + stock?.quantity,
                        0
                      )
                  ) {
                    setQuantity(
                      selectedSku?.stocks
                        ?.reduce((acc, stock) => acc + stock?.quantity, 0)
                        .toString()
                    );
                  } else {
                    setQuantity(value ? parseInt(value, 10)?.toString() : '');
                  }
                }}
                value={quantity}
              />
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant='contained'
                onClick={hanldeUpsertOrderItem}
                disabled={!selectedSku || !quantity}>
                {isOrderItemEdit ? 'Lưu' : 'Thêm'}
              </Button>
              <Button
                sx={{ ml: 2 }}
                variant='outlined'
                disabled={!categoryId || !productId}
                onClick={handleCancelUpsertOrderItem}>
                Hủy
              </Button>
            </Box>
          </Grid2>
          <Grid2 size={7}>
            <Typography mb={1}>Sản phẩm:</Typography>
            <TableContainer component={Paper}>
              <Table sx={{}} aria-label='simple table'>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '3%', px: 1 }} align='center'>
                      STT
                    </TableCell>
                    <TableCell sx={{ width: '21%', px: 1 }} align='center'>
                      Tên
                    </TableCell>
                    <TableCell sx={{ width: '5%', px: 0 }} align='center'>
                      Ảnh
                    </TableCell>
                    <TableCell sx={{ width: '30%', px: 1 }} align='center'>
                      Phân loại
                    </TableCell>
                    <TableCell sx={{ width: '5%', px: 1 }} align='center'>
                      SL
                    </TableCell>
                    <TableCell sx={{ width: '16%', px: 1 }} align='center'>
                      Giá
                    </TableCell>
                    <TableCell sx={{ width: '20%' }} align='center'>
                      Tuỳ chọn
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderItems?.length ? (
                    orderItems.map((item, index) => (
                      <TableRow
                        key={`${item?.skuId}-${index}`}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}>
                        <TableCell
                          sx={{ px: 1 }}
                          component='th'
                          scope='row'
                          align='center'>
                          {index + 1}
                        </TableCell>
                        <TableCell sx={{ px: 1 }} component='th' scope='row'>
                          <Typography
                            sx={{ fontSize: 13, ...truncateTextByLine(1) }}>
                            {item.productName}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ px: 0 }} align='center'>
                          <img
                            src={item?.imageUrl}
                            alt=''
                            style={{
                              width: '30px',
                              maxWidth: '30px',
                              height: '30px',
                              objectFit: 'contain',
                              border: '1px solid #ccc',
                              borderRadius: '2px',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {item.skuAttributes.length ? (
                            item.skuAttributes.map((attribute) => (
                              <Typography
                                key={attribute.attribute}
                                sx={{ fontSize: 13 }}>
                                {attribute.attribute}: {attribute.value}
                              </Typography>
                            ))
                          ) : (
                            <Typography sx={{ fontSize: 13 }}>
                              Không có
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ px: 1 }} align='center'>
                          {item.quantity}
                        </TableCell>
                        <TableCell sx={{ fontSize: 12 }} align='right'>
                          {formatPrice(item?.price)}
                        </TableCell>
                        <TableCell align='center'>
                          <Button
                            sx={{
                              minWidth: 20,
                              width: 20,
                              height: 30,
                              mr: 1,
                            }}
                            variant='outlined'
                            onClick={() => {
                              handleEditOrderItem(item, index);
                            }}>
                            <EditOutlinedIcon sx={{ fontSize: 14 }} />
                          </Button>
                          <Button
                            sx={{ minWidth: 20, width: 20, height: 30 }}
                            variant='outlined'
                            onClick={() => handleDeleteOrderItem(index)}>
                            <DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow
                      sx={{
                        height: '80px',
                        '& td': { border: 0 },
                      }}>
                      <TableCell
                        colSpan={6}
                        align='center'
                        sx={{
                          textAlign: 'center',
                          color: '#999',
                        }}>
                        Empty
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Divider />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'end',
                  alignItems: 'center',
                  width: '100%',
                  px: 4,
                  py: 1,
                }}>
                <Typography sx={{ mr: 4, fontSize: 14 }}>Tổng tiền:</Typography>
                <Typography>{formatPrice(totalAmount())}</Typography>
              </Box>
            </TableContainer>
          </Grid2>
        </Grid2>
      </CardContent>
    </Card>
  );
};

export default ProductSelector;

const selectStyle: SxProps<Theme> = {
  '& .MuiFilledInput-root': {
    overflow: 'hidden',
    borderRadius: 1,
    backgroundColor: '#fff !important',
    border: '1px solid',
    borderColor: 'rgba(0,0,0,0.23)',
    '&:hover': {
      backgroundColor: 'transparent',
    },
    '&.Mui-focused': {
      backgroundColor: 'transparent',
      border: '2px solid',
    },
  },
  '& .MuiInputLabel-asterisk': {
    color: 'red',
  },
  '& .Mui-disabled': {
    cursor: 'not-allowed',
  },
};
