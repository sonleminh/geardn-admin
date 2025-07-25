import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  Grid2,
  Link,
  Table,
  TableRow,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
  TableBody,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';

import React, { useMemo, useState } from 'react';
import { ROUTES } from '@/constants/route';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  useGetOrderById,
  useUpdateOrder,
  useUpdateOrderConfirm,
  useUpdateOrderStatus,
} from '@/services/order';
import moment from 'moment';
import { truncateTextByLine } from '@/utils/css-helper.util';
import { formatPrice } from '@/utils/format-price';
import { useGetWarehouseList } from '@/services/warehouse';
import { useCreateMultipleExportLogs } from '@/services/inventory';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { QueryKeys } from '@/constants/query-key';
import { useQueryClient } from '@tanstack/react-query';
import SuspenseLoader from '@/components/SuspenseLoader';

interface IExportItem {
  skuId: number;
  warehouseId: number;
}

const OrderConfirm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();

  const { data: orderData } = useGetOrderById(id as string);
  const { data: warehouseData } = useGetWarehouseList();
  //   const { mutate: updateOrderStatus, isPending: isUpdateOrderStatusPending } =
  //     useUpdateOrderStatus();

  const { mutate: updateOrderConfirm, isPending: isUpdateOrderConfirmPending } =
    useUpdateOrderConfirm();
  // const {
  //   mutate: createMultipleExportLogs,
  //   isPending: isCreateExportLogsPending,
  // } = useCreateMultipleExportLogs();

  const [exportItems, setExportItems] = useState<IExportItem[]>([]);

  const handleSelectWarehouse = (
    skuId: number,
    event: SelectChangeEvent<string>
  ) => {
    const value = event.target.value;

    const isExist = exportItems.find((item) => item.skuId === skuId);

    if (!isExist) {
      setExportItems([...exportItems, { skuId, warehouseId: +value }]);
    } else if (isExist) {
      setExportItems(
        exportItems.map((item) =>
          item.skuId === skuId ? { ...item, warehouseId: +value } : item
        )
      );
    }
  };

  const handleSubmit = () => {
    if (!id) return;

    // Check if all order items have warehouse selected
    const orderItems = orderData?.data?.orderItems || [];
    const hasAllWarehousesSelected = orderItems.every((item) =>
      exportItems.some((exportItem) => exportItem.skuId === item.skuId)
    );

    if (!hasAllWarehousesSelected) {
      showNotification('Vui lòng chọn kho cho tất cả sản phẩm', 'error');
      return;
    }

    updateOrderConfirm(
      {
        id: +id,
        skuWarehouseMapping: exportItems,
      },
      {
        onSuccess: () => {
          showNotification('Xác nhận đơn hàng thành công', 'success');
          navigate(ROUTES.ORDER);
          queryClient.invalidateQueries({
            queryKey: [QueryKeys.Order],
          });
        },
        onError: () => {
          showNotification('Có lỗi xảy ra khi xác nhận đơn hàng', 'error');
        },
      }
    );

    // Create multiple export logs
    // createMultipleExportLogs(exportLogsByWarehouse, {
    //   onSuccess: () => {
    //     // Update order status after successful export
    //     updateOrderConfirm(
    //       {
    //         id: +id,
    //         orderItems: orderData?.data?.orderItems.map((item) => ({
    //           skuId: item.skuId,
    //           warehouseId: exportItems.find(
    //             (exportItem) => exportItem.skuId === item.skuId
    //           )?.warehouseId,
    //         })),
    //       },
    //       {
    //         onSuccess: () => {
    //           queryClient.invalidateQueries({
    //             queryKey: [QueryKeys.ExportLog],
    //           });
    //           queryClient.invalidateQueries({ queryKey: [QueryKeys.Order] });
    //           showNotification('Xác nhận đơn hàng thành công', 'success');
    //           navigate(ROUTES.ORDER);
    //         },
    //         onError: () => {
    //           showNotification(
    //             'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng',
    //             'error'
    //           );
    //         },
    //       }
    //     );
    //   },
    //   onError: () => {
    //     showNotification('Có lỗi xảy ra khi tạo xuất hàng', 'error');
    //   },
    // });
  };

  const breadcrumbs = useMemo(
    () => [
      {
        icon: <HomeOutlinedIcon sx={{ fontSize: 24 }} />,
        label: '',
        onClick: () => navigate(ROUTES.DASHBOARD),
      },
      {
        label: 'Đơn hàng',
        onClick: () => navigate(ROUTES.ORDER),
      },
      {
        label: 'Xác nhận đơn hàng',
      },
    ],
    [navigate]
  );
  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize='small' />}
          aria-label='breadcrumb'>
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={index}
              underline='hover'
              color='inherit'
              onClick={crumb.onClick}
              sx={{
                cursor: crumb.onClick ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
              }}>
              {crumb.icon}
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      </Box>

      <Typography sx={{ mb: 2, fontSize: 20, fontWeight: 600 }}>
        Xác nhận đơn hàng:
      </Typography>

      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title='Thông tin đơn hàng'
              sx={{
                span: {
                  fontSize: 18,
                  fontWeight: 500,
                },
              }}
            />
            <Divider />
            <CardContent>
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, md: 3.5 }}>
                  <Typography sx={{ mb: 1, fontWeight: 500 }}>
                    Tên khách hàng:
                  </Typography>
                  <Typography sx={{ mb: 1, fontWeight: 500 }}>
                    Số điện thoại:
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>Email:</Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 8.5 }}>
                  <Typography sx={{ mb: 1 }}>
                    {orderData?.data?.fullName ?? ''}
                  </Typography>
                  <Typography sx={{ mb: 1 }}>
                    {orderData?.data?.phoneNumber ?? ''}
                  </Typography>
                  <Typography>{orderData?.data?.email ?? ''}</Typography>
                </Grid2>
              </Grid2>
            </CardContent>
          </Card>
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title='Thông tin vận chuyển'
              sx={{
                span: {
                  fontSize: 18,
                  fontWeight: 500,
                },
              }}
            />
            <Divider />
            <CardContent>
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, md: 3.5 }}>
                  <Typography sx={{ mb: 1, fontWeight: 500 }}>
                    Ngày đặt hàng:
                  </Typography>
                  <Typography sx={{ mb: 1, fontWeight: 500 }}>
                    Ngày giao hàng:
                  </Typography>
                  <Typography sx={{ mb: 1, fontWeight: 500 }}>
                    Vận chuyển:
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>Địa chỉ:</Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 8.5 }}>
                  <Typography sx={{ mb: 1 }}>
                    {moment(orderData?.data?.createdAt).format('DD/MM/YYYY')}
                  </Typography>
                  <Typography sx={{ mb: 1 }}>
                    {moment(orderData?.data?.shipment?.deliveryDate).format(
                      'DD/MM/YYYY'
                    )}
                  </Typography>
                  <Typography sx={{ mb: 1 }}>
                    {orderData?.data?.shipment?.method === 1
                      ? 'Giao hàng tận nơi'
                      : 'Nhận tại cửa hàng'}
                  </Typography>
                  <Typography>
                    {orderData?.data?.shipment?.address ?? ''}
                  </Typography>
                </Grid2>
              </Grid2>
            </CardContent>
          </Card>
          <Card>
            <CardHeader
              title='Phương thức thanh toán'
              sx={{
                span: {
                  fontSize: 18,
                  fontWeight: 500,
                },
              }}
            />
            <Divider />
            <CardContent>
              <Box
                display='flex'
                alignItems='center'
                sx={{
                  height: 40,
                  img: {
                    width: 40,
                    height: 40,
                    mr: 2,
                    objectFit: 'contain',
                  },
                }}>
                <img
                  src={orderData?.data?.paymentMethod?.image}
                  alt={orderData?.data?.paymentMethod?.name}
                />
                <Typography>{orderData?.data?.paymentMethod?.name}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              title='Chi tiết đơn hàng'
              sx={{
                span: {
                  fontSize: 18,
                  fontWeight: 500,
                },
              }}
            />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>STT</TableCell>
                      <TableCell>Ảnh</TableCell>
                      <TableCell>Sản phẩm</TableCell>
                      <TableCell>Kho</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderData?.data?.orderItems.map((item, index) => (
                      <TableRow key={item?.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
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
                            <img src={item?.imageUrl} alt={item?.productName} />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              // width: 80,
                              fontSize: 14,
                              fontWeight: 500,
                              ...truncateTextByLine(1),
                            }}>
                            {item?.productName}
                          </Typography>
                          <Typography sx={{ fontSize: 13 }}>
                            SL: {item?.quantity}
                          </Typography>
                          <Typography sx={{ fontSize: 13 }}>
                            Giá: {formatPrice(item?.sellingPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {' '}
                          <FormControl size='small' sx={{ width: 170 }}>
                            <Select
                              displayEmpty
                              value={
                                exportItems.find(
                                  (exportItem) =>
                                    exportItem.skuId === item?.skuId
                                )?.warehouseId ?? ''
                              }
                              onChange={(e) => {
                                handleSelectWarehouse(
                                  item?.skuId,
                                  e as SelectChangeEvent<string>
                                );
                              }}
                              size='small'
                              sx={{
                                minHeight: 40,
                                height: 40,
                                fontSize: 14,
                                '& .MuiFilledInput-root': {
                                  overflow: 'hidden',
                                  borderRadius: 1,
                                  backgroundColor: '#a77575 !important',
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
                              }}>
                              <MenuItem value='' disabled>
                                Chọn kho
                              </MenuItem>
                              {warehouseData?.data?.map((warehouse) => {
                                const stock = item?.sku?.stocks?.find(
                                  (stock) => stock.warehouseId === warehouse?.id
                                );
                                const isStockInsufficient =
                                  !stock || stock.quantity < item?.quantity;

                                return (
                                  <MenuItem
                                    key={warehouse?.id}
                                    value={warehouse?.id}
                                    disabled={isStockInsufficient}>
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                      }}>
                                      <Typography sx={{ fontSize: 14 }}>
                                        {warehouse?.name}
                                      </Typography>
                                      <Typography
                                        sx={{
                                          fontSize: 12,
                                          color: 'text.secondary',
                                        }}>
                                        SL: {stock?.quantity || 0}
                                      </Typography>
                                    </Box>
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          </FormControl>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>

      <Grid2 size={{ xs: 12 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            mt: 2,
          }}>
          <Button onClick={() => navigate(ROUTES.ORDER)} sx={{ mr: 2 }}>
            Trở lại
          </Button>
          <Button
            variant='contained'
            onClick={() => handleSubmit()}
            sx={{ minWidth: 100 }}>
            Xác nhận
          </Button>
        </Box>
      </Grid2>

      {isUpdateOrderConfirmPending && <SuspenseLoader />}
    </>
  );
};

export default OrderConfirm;
