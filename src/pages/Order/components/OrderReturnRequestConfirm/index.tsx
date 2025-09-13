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
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import SuspenseLoader from '@/components/SuspenseLoader';
import { QueryKeys } from '@/constants/query-key';
import { ROUTES } from '@/constants/route';
import { useAlertContext } from '@/contexts/AlertContext';
import { IOrderItem } from '@/interfaces/IOrder';
import {
  useCompleteReturnRequest,
  useGetOrderReturnRequestById,
} from '@/services/order-return-request';
import { useGetWarehouseList } from '@/services/warehouse';
import { truncateTextByLine } from '@/utils/css-helper.util';
import { formatPrice } from '@/utils/format-price';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface IExportItem {
  skuId: number;
  warehouseId: number;
}

const OrderReturnRequestConfirm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showAlert } = useAlertContext();

  const {
    data: orderReturnRequestData,
    isLoading: isLoadingOrderReturnRequest,
  } = useGetOrderReturnRequestById(id as string);
  const { data: warehouseData, isLoading: isLoadingWarehouse } =
    useGetWarehouseList();

  const {
    mutate: completeReturnRequest,
    isPending: isCompleteReturnRequestPending,
  } = useCompleteReturnRequest();

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
    const orderItems = orderReturnRequestData?.data?.order?.orderItems || [];
    const hasAllWarehousesSelected = orderItems.every((item) =>
      exportItems.some((exportItem) => exportItem.skuId === item.skuId)
    );

    if (!hasAllWarehousesSelected) {
      showAlert('Vui lòng chọn kho cho tất cả sản phẩm', 'error');
      return;
    }

    completeReturnRequest(
      {
        id: +id,
        skuWarehouseMapping: exportItems,
      },
      {
        onSuccess: () => {
          showAlert(
            'Xác nhận hoàn thành yêu cầu hoàn đơn thành công',
            'success'
          );
          navigate(`${ROUTES.ORDER_RETURN_REQUEST}`);
          queryClient.invalidateQueries({
            queryKey: [QueryKeys.OrderReturnRequest],
          });
        },
        onError: () => {
          showAlert(
            'Có lỗi xảy ra khi xác nhận hoàn thành yêu cầu hoàn đơn',
            'error'
          );
        },
      }
    );
  };

  const breadcrumbs = useMemo(
    () => [
      {
        icon: <HomeOutlinedIcon sx={{ fontSize: 24 }} />,
        label: '',
        onClick: () => navigate(ROUTES.DASHBOARD),
      },
      {
        label: 'Yêu cầu hoàn đơn',
        onClick: () => navigate(ROUTES.ORDER_RETURN_REQUEST),
      },
      {
        label: 'Xác nhận yêu cầu hoàn đơn',
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
        Xác nhận yêu cầu hoàn đơn:
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
              {isLoadingOrderReturnRequest ? (
                <Grid2 container spacing={3}>
                  <Grid2 size={{ xs: 12, md: 4 }}>
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Skeleton variant='text' width={120} height={20} />
                      <Skeleton variant='text' width={120} height={20} />
                      <Skeleton variant='text' width={80} height={20} />
                    </Box>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 8 }}>
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Skeleton variant='text' width={180} height={20} />
                      <Skeleton variant='text' width={150} height={20} />
                      <Skeleton variant='text' width={200} height={20} />
                    </Box>
                  </Grid2>
                </Grid2>
              ) : (
                <Grid2 container spacing={3}>
                  <Grid2 size={{ xs: 12, md: 4 }}>
                    <Typography sx={{ mb: 1, fontWeight: 500 }}>
                      Tên khách hàng:
                    </Typography>
                    <Typography sx={{ mb: 1, fontWeight: 500 }}>
                      Số điện thoại:
                    </Typography>
                    <Typography sx={{ fontWeight: 500 }}>Email:</Typography>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 8 }}>
                    <Typography sx={{ mb: 1 }}>
                      {orderReturnRequestData?.data?.order?.fullName ??
                        'Không có'}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      {orderReturnRequestData?.data?.order?.phoneNumber ??
                        'Không có'}
                    </Typography>
                    <Typography>
                      {orderReturnRequestData?.data?.order?.email ?? 'Không có'}
                    </Typography>
                  </Grid2>
                </Grid2>
              )}
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
              {isLoadingOrderReturnRequest ? (
                <Grid2 container spacing={3}>
                  <Grid2 size={{ xs: 12, md: 4 }}>
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Skeleton variant='text' width={120} height={20} />
                      <Skeleton variant='text' width={140} height={20} />
                      <Skeleton variant='text' width={100} height={20} />
                      <Skeleton variant='text' width={80} height={20} />
                    </Box>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 8 }}>
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Skeleton variant='text' width={100} height={20} />
                      <Skeleton variant='text' width={150} height={20} />
                      <Skeleton variant='text' width={160} height={20} />
                      <Skeleton variant='text' width={250} height={20} />
                    </Box>
                  </Grid2>
                </Grid2>
              ) : (
                <Grid2 container spacing={3}>
                  <Grid2 size={{ xs: 12, md: 4 }}>
                    <Typography sx={{ mb: 1, fontWeight: 500 }}>
                      Ngày đặt hàng:
                    </Typography>
                    <Typography sx={{ mb: 1, fontWeight: 500 }}>
                      Thời gian giao hàng:
                    </Typography>
                    <Typography sx={{ mb: 1, fontWeight: 500 }}>
                      Vận chuyển:
                    </Typography>
                    <Typography sx={{ fontWeight: 500 }}>Địa chỉ:</Typography>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 8 }}>
                    <Typography sx={{ mb: 1 }}>
                      {orderReturnRequestData?.data?.order?.completedAt
                        ? moment(
                            orderReturnRequestData?.data?.order?.completedAt
                          ).format('DD/MM/YYYY')
                        : 'Không có'}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      {orderReturnRequestData?.data?.order?.shipment
                        ?.deliveryDate
                        ? moment(
                            orderReturnRequestData?.data?.order?.shipment
                              ?.deliveryDate
                          ).format('DD/MM/YYYY HH:mm')
                        : 'Không có'}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      {orderReturnRequestData?.data?.order?.shipment?.method ==
                      1
                        ? 'Giao hàng tận nơi'
                        : 'Nhận tại cửa hàng'}
                    </Typography>
                    <Typography>
                      {orderReturnRequestData?.data?.order?.shipment?.address ??
                        ''}
                    </Typography>
                  </Grid2>
                </Grid2>
              )}
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
              {isLoadingOrderReturnRequest ? (
                <Box display='flex' alignItems='center' sx={{ height: 40 }}>
                  <Skeleton
                    variant='rectangular'
                    width={40}
                    height={40}
                    sx={{ mr: 2 }}
                  />
                  <Skeleton variant='text' width={120} height={20} />
                </Box>
              ) : (
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
                    src={
                      orderReturnRequestData?.data?.order?.paymentMethod?.image
                    }
                    alt={
                      orderReturnRequestData?.data?.order?.paymentMethod?.name
                    }
                  />
                  <Typography>
                    {orderReturnRequestData?.data?.order?.paymentMethod?.name}
                  </Typography>
                </Box>
              )}
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
              {isLoadingOrderReturnRequest || isLoadingWarehouse ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Skeleton variant='text' width={30} height={20} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant='text' width={40} height={20} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant='text' width={80} height={20} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant='text' width={40} height={20} />
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Array.from(new Array(3)).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Skeleton variant='text' width={20} height={20} />
                          </TableCell>
                          <TableCell>
                            <Skeleton
                              variant='rectangular'
                              width={40}
                              height={40}
                            />
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.5,
                              }}>
                              <Skeleton
                                variant='text'
                                width={120}
                                height={20}
                              />
                              <Skeleton variant='text' width={80} height={16} />
                              <Skeleton
                                variant='text'
                                width={100}
                                height={16}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Skeleton
                              variant='rectangular'
                              width={170}
                              height={40}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
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
                      {orderReturnRequestData?.data?.order?.orderItems.map(
                        (item: IOrderItem, index: number) => (
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
                                <img
                                  src={item?.imageUrl}
                                  alt={item?.productName}
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography
                                sx={{
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
                                    return (
                                      <MenuItem
                                        key={warehouse?.id}
                                        value={warehouse?.id}>
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
                                        </Box>
                                      </MenuItem>
                                    );
                                  })}
                                </Select>
                              </FormControl>
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
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
            gap: 2,
          }}>
          {isLoadingOrderReturnRequest || isLoadingWarehouse ? (
            <>
              <Skeleton variant='rectangular' width={80} height={36} />
              <Skeleton variant='rectangular' width={100} height={36} />
            </>
          ) : (
            <>
              <Button onClick={() => navigate(ROUTES.ORDER_RETURN_REQUEST)}>
                Trở lại
              </Button>
              <Button
                variant='contained'
                onClick={() => handleSubmit()}
                sx={{ minWidth: 100 }}>
                Xác nhận
              </Button>
            </>
          )}
        </Box>
      </Grid2>

      {isCompleteReturnRequestPending && <SuspenseLoader />}
    </>
  );
};

export default OrderReturnRequestConfirm;
