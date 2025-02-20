// // React and State Management
// import { useEffect, useState } from 'react';

// // UI Libraries
// import {
//   Box,
//   Button,
//   Divider,
//   FormControl,
//   Grid2,
//   InputLabel,
//   MenuItem,
//   Paper,
//   Select,
//   SelectChangeEvent,
//   SxProps,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Theme,
//   Typography,
// } from '@mui/material';
// import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
// import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

// import Input from '@/components/Input';

// import { useNotificationContext } from '@/contexts/NotificationContext';

// import { ICategory } from '@/interfaces/ICategory';
// import { IModel } from '@/interfaces/IModel';
// import { IOrder, IOrderItem } from '@/interfaces/IOrder';

// import { useGetInitialForCreate } from '@/services/model';
// import { useGetProductByCateId, useGetProductById } from '@/services/product';

// import { formatPrice } from '@/utils/format-price';

// interface ProductSelectorProps {
//   isEdit: boolean;
//   orderData?: IOrder;
//   orderItems: IOrderItem[];
//   setOrderItems: React.Dispatch<React.SetStateAction<IOrderItem[]>>;
// }

// const ProductSelector: React.FC<ProductSelectorProps> = ({
//   isEdit,
//   orderData,
//   orderItems,
//   setOrderItems,
// }) => {
//   const { showNotification } = useNotificationContext();

//   const [categoryId, setCategoryId] = useState<string>('');
//   const [productId, setProductId] = useState<string>('');
//   const [quantity, setQuantity] = useState('');
//   const [selectedModel, setSelectedModel] = useState<(number | undefined)[]>(
//     []
//   );
//   const [selectedImage, setSelectedImage] = useState<string>('');
//   const [isOrderItemEdit, setIsOrderItemEdit] = useState<boolean>(false);
//   const [itemIndex, setItemIndex] = useState<number | null>(null);
//   const [modelIdEdit, setModelIdEdit] = useState<string>('');
//   const [matchedModel, setMatchedModel] = useState<IModel>();

//   const { data: initData } = useGetInitialForCreate();
//   const { data: productsByCategory } = useGetProductByCateId(categoryId);
//   const { data: product } = useGetProductById(productId);

//   useEffect(() => {
//     if (product && selectedModel.length > 0) {
//       const matchedModel = product?.models?.find(
//         (model) =>
//           JSON.stringify(model?.extinfo?.tier_index) ===
//           JSON.stringify(selectedModel)
//       );
//       setMatchedModel(matchedModel);
//       const tierIndex = matchedModel?.extinfo?.tier_index?.[0];
//       const image =
//         product?.tier_variations[0]?.images?.[tierIndex ?? 0] ||
//         product?.images[0];
//       setSelectedImage(image ?? '');
//     } else if (
//       product &&
//       selectedModel.length === 0 &&
//       product?.models?.length === 1
//     ) {
//       setMatchedModel(product?.models?.[0]);
//       setSelectedImage(product.images[0]);
//     }
//   }, [product, selectedModel]);

//   useEffect(() => {
//     if (
//       (isOrderItemEdit && product && modelIdEdit) ||
//       (isOrderItemEdit && product)
//     ) {
//       setSelectedModel(
//         product?.models?.find((item) => item._id === modelIdEdit)?.extinfo
//           .tier_index ?? []
//       );
//       setCategoryId(product?.category?._id);
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

//   const hanleUpsertOrderItem = () => {
//     if (
//       !isOrderItemEdit &&
//       orderItems?.find((item) => item?.model_id === matchedModel?._id)
//     ) {
//       return showNotification('Sản phẩm đã có trong danh sách!', 'error');
//     }
//     if (
//       matchedModel &&
//       +quantity >
//         (orderData &&
//         isOrderItemEdit &&
//         itemIndex &&
//         itemIndex < orderData?.items?.length
//           ? matchedModel?.stock + orderData?.items?.[itemIndex ?? 0]?.quantity
//           : matchedModel?.stock)
//     ) {
//       return showNotification('Số lượng vượt quá hàng trong kho!!', 'error');
//     }

//     const newItem = {
//       model_id: matchedModel?._id ?? '',
//       name: matchedModel?.name ?? '',
//       image: selectedImage,
//       product_id: productId,
//       product_name: product?.name ?? '',
//       quantity: +quantity,
//       price: matchedModel?.price ?? 0,
//     };
//     if (itemIndex !== null) {
//       const updatedOrderItems = [...orderItems];
//       updatedOrderItems[itemIndex] = newItem;
//       setOrderItems(updatedOrderItems);
//       setItemIndex(null);
//     } else {
//       setOrderItems((prev: IOrderItem[]) => [...prev, newItem]);
//     }

//     setCategoryId('');
//     setProductId('');
//     setSelectedImage('');
//     setQuantity('');
//   };

//   const handleEditOrderItem = (item: IOrderItem, index: number) => {
//     setIsOrderItemEdit(true);
//     setProductId(item?.product_id);
//     setModelIdEdit(item?.model_id);
//     setQuantity(`${item?.quantity}`);
//     setItemIndex(index);
//   };

//   const handleDeleteOrderItem = (index: number) => {
//     const updatedOrderItems = [...orderItems];
//     updatedOrderItems.splice(index, 1);
//     setOrderItems(updatedOrderItems);
//   };

//   const handleCancelUpsertOrderItem = () => {
//     setIsOrderItemEdit(false);
//     setCategoryId('');
//     setProductId('');
//     setSelectedImage('');
//     setModelIdEdit('');
//     setQuantity('');
//   };

//   const totalAmount = () => {
//     return orderItems?.reduce(
//       (acc, item) => acc + (item?.price ?? 0) * (item?.quantity ?? 0),
//       0
//     );
//   };

//   return (
//     <>
//       <Grid2 size={6}>
//         <Typography>Thêm sản phẩm:</Typography>
//         <FormControl variant='filled' margin='dense' fullWidth sx={selectStyle}>
//           <InputLabel>Danh mục</InputLabel>
//           <Select
//             disableUnderline
//             size='small'
//             onChange={(e) => {
//               setCategoryId(e?.target?.value as string);
//               setProductId('');
//               setSelectedModel([]);
//               setSelectedImage('');
//               setQuantity('');
//             }}
//             value={categoryId ?? ''}>
//             {initData?.categoryList?.map((item: ICategory) => (
//               <MenuItem key={item?.id} value={item?.id}>
//                 {item?.name}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//         <FormControl variant='filled' margin='dense' fullWidth sx={selectStyle}>
//           <InputLabel>Sản phẩm</InputLabel>
//           <Select
//             disableUnderline
//             size='small'
//             name='product'
//             disabled={!categoryId && !isOrderItemEdit}
//             onChange={(e) => {
//               setProductId(e.target.value);
//               setSelectedModel([]);
//               setSelectedImage('');
//               setQuantity('');
//             }}
//             value={productId ?? ''}>
//             {productsByCategory?.data.map((item) => (
//               <MenuItem
//                 key={item?.id}
//                 value={item?.id}
//                 disabled={!item?.original_price}>
//                 {item?.name} {!item?.original_price && '- (Hết hàng)'}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//         {product?.tier_variations?.map((item, vIndex) => (
//           <FormControl
//             sx={selectStyle}
//             key={item?.name}
//             variant='filled'
//             margin='dense'
//             fullWidth>
//             <InputLabel>{item?.name}</InputLabel>
//             <Select
//               disableUnderline
//               size='small'
//               onChange={(e) => {
//                 handleVariantChange(e, vIndex);
//               }}
//               value={
//                 selectedModel[vIndex] !== undefined
//                   ? product?.tier_variations[vIndex]?.options[
//                       selectedModel[vIndex] as number
//                     ]
//                   : ''
//               }>
//               {getFilteredOptions(vIndex).map((option) => (
//                 <MenuItem key={option} value={option}>
//                   {option}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         ))}
//         {categoryId && productId && (
//           <Box my={2}>
//             <Grid2 container spacing={4}>
//               <Grid2 sx={{ display: 'flex' }} size={6}>
//                 <Typography mr={2}>Ảnh:</Typography>
//                 {selectedImage && (
//                   <img
//                     src={selectedImage}
//                     alt=''
//                     style={{
//                       width: '100%',
//                       maxWidth: '80px',
//                       height: '80px',
//                       borderRadius: '4px',
//                       border: '1px solid #ccc',
//                       objectFit: 'contain',
//                     }}
//                   />
//                 )}
//               </Grid2>
//               <Grid2 size={6}>
//                 <Typography>
//                   Kho:{' '}
//                   {isEdit &&
//                   orderData &&
//                   matchedModel &&
//                   isOrderItemEdit &&
//                   itemIndex &&
//                   itemIndex > orderData?.items?.length &&
//                   !orderData?.items[itemIndex]
//                     ? matchedModel?.stock +
//                       orderData?.items?.[itemIndex ?? 0]?.quantity
//                     : matchedModel?.stock}
//                 </Typography>
//               </Grid2>
//             </Grid2>
//           </Box>
//         )}
//         <FormControl fullWidth>
//           <Input
//             label='Số lượng'
//             name='quantity'
//             variant='filled'
//             margin='dense'
//             size='small'
//             type='number'
//             disabled={!isEdit && matchedModel?.stock === 0 ? true : false}
//             onKeyDown={(e) => {
//               if (e.key === '-') {
//                 e.preventDefault();
//               }
//               if (quantity === '' && (e.key === '0' || e.key === 'Enter')) {
//                 e.preventDefault();
//               }
//             }}
//             onChange={(e) => {
//               const value = e.target.value;
//               if (matchedModel && +value > matchedModel?.stock) {
//                 setQuantity(matchedModel?.stock.toString());
//               } else {
//                 setQuantity(value ? parseInt(value, 10)?.toString() : '');
//               }
//             }}
//             value={quantity}
//           />
//         </FormControl>

//         <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
//           <Button
//             variant='contained'
//             onClick={hanleUpsertOrderItem}
//             disabled={!selectedImage || !quantity}>
//             {isOrderItemEdit ? 'Lưu' : 'Thêm'}
//           </Button>
//           <Button
//             sx={{ ml: 2 }}
//             variant='outlined'
//             disabled={!categoryId || !productId}
//             onClick={handleCancelUpsertOrderItem}>
//             Hủy
//           </Button>
//         </Box>
//       </Grid2>
//       <Grid2 size={6}>
//         <Typography mb={1}>Sản phẩm:</Typography>
//         <TableContainer component={Paper}>
//           <Table sx={{}} aria-label='simple table'>
//             <TableHead>
//               <TableRow>
//                 <TableCell sx={{ width: '3%', px: 1 }} align='center'>
//                   Stt
//                 </TableCell>
//                 <TableCell sx={{ width: '5%', px: 0 }} align='center'>
//                   Ảnh
//                 </TableCell>
//                 <TableCell sx={{ width: '20%', px: 1 }} align='center'>
//                   Tên
//                 </TableCell>
//                 <TableCell sx={{ width: '5%', px: 1 }} align='center'>
//                   SL
//                 </TableCell>
//                 <TableCell sx={{ width: '8%', px: 1 }} align='center'>
//                   Giá
//                 </TableCell>
//                 <TableCell sx={{ width: '16%' }} align='center'>
//                   Tuỳ chọn
//                 </TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {orderItems?.length ? (
//                 orderItems.map((item, index) => (
//                   <TableRow
//                     key={item.model_id}
//                     sx={{
//                       '&:last-child td, &:last-child th': { border: 0 },
//                     }}>
//                     <TableCell
//                       sx={{ px: 1 }}
//                       component='th'
//                       scope='row'
//                       align='center'>
//                       {index + 1}
//                     </TableCell>
//                     <TableCell sx={{ px: 0 }} align='center'>
//                       <img
//                         src={item?.image}
//                         alt=''
//                         style={{
//                           width: '48px',
//                           maxWidth: '48px',
//                           height: '48px',
//                           objectFit: 'contain',
//                           border: '1px solid #ccc',
//                           borderRadius: '2px',
//                         }}
//                       />
//                     </TableCell>
//                     <TableCell sx={{ fontSize: 13 }}>
//                       {item.product_name}
//                     </TableCell>
//                     <TableCell sx={{ px: 1 }} align='center'>
//                       {item.quantity}
//                     </TableCell>
//                     <TableCell sx={{ fontSize: 12 }} align='right'>
//                       {formatPrice(item?.price)}
//                     </TableCell>
//                     <TableCell align='center'>
//                       <Button
//                         sx={{
//                           minWidth: 20,
//                           width: 20,
//                           height: 30,
//                           mr: 1,
//                         }}
//                         variant='outlined'
//                         onClick={() => {
//                           handleEditOrderItem(item, index);
//                         }}>
//                         <EditOutlinedIcon sx={{ fontSize: 14 }} />
//                       </Button>
//                       <Button
//                         sx={{ minWidth: 20, width: 20, height: 30 }}
//                         variant='outlined'
//                         onClick={() => handleDeleteOrderItem(index)}>
//                         <DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow
//                   sx={{
//                     height: '80px',
//                     '& td': { border: 0 },
//                   }}>
//                   <TableCell
//                     colSpan={6}
//                     align='center'
//                     sx={{
//                       textAlign: 'center',
//                       color: '#999',
//                     }}>
//                     Empty
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//           <Divider />
//           <Box
//             sx={{
//               display: 'flex',
//               justifyContent: 'end',
//               alignItems: 'center',
//               width: '100%',
//               px: 4,
//               py: 1,
//             }}>
//             <Typography sx={{ mr: 4, fontSize: 14 }}>Tổng tiền:</Typography>
//             <Typography>{formatPrice(totalAmount())}</Typography>
//           </Box>
//         </TableContainer>
//       </Grid2>
//     </>
//   );
// };

// export default ProductSelector;

// const selectStyle: SxProps<Theme> = {
//   '& .MuiFilledInput-root': {
//     overflow: 'hidden',
//     borderRadius: 1,
//     backgroundColor: '#fff !important',
//     border: '1px solid',
//     borderColor: 'rgba(0,0,0,0.23)',
//     '&:hover': {
//       backgroundColor: 'transparent',
//     },
//     '&.Mui-focused': {
//       backgroundColor: 'transparent',
//       border: '2px solid',
//     },
//   },
//   '& .MuiInputLabel-asterisk': {
//     color: 'red',
//   },
//   '& .Mui-disabled': {
//     cursor: 'not-allowed',
//   },
// };
