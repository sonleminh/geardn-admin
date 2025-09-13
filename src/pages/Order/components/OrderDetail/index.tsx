import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid2,
  Link,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { ROUTES } from '@/constants/route';
import { useGetOrderById } from '@/services/order';
import { truncateTextByLine } from '@/utils/css-helper.util';
import { formatPrice } from '@/utils/format-price';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import moment from 'moment';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetEnumByContext } from '@/services/enum';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: orderData, isLoading: isLoadingOrder } = useGetOrderById(
    id as string
  );
  const { data: orderStatusEnumData, isLoading: isLoadingEnum } =
    useGetEnumByContext('order-status');

  const statusMap = useMemo(
    () =>
      Object.fromEntries(
        orderStatusEnumData?.data.map((item) => [item.value, item.label]) ?? []
      ),
    [orderStatusEnumData?.data]
  );

  const breadcrumbs = useMemo(
    () => [
      {
        icon: <HomeOutlinedIcon sx={{ fontSize: 24 }} />,
        label: '',
        onClick: () => navigate(ROUTES.DASHBOARD),
      },
      {
        label: 'Đơn hàng',
        onClick: () => navigate(ROUTES.ORDER_LIST),
      },
      {
        label: 'Chi tiết đơn hàng',
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
        Chi tiết đơn hàng:
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
              {isLoadingOrder || isLoadingEnum ? (
                <Grid2 container spacing={3}>
                  <Grid2 size={{ xs: 12, md: 4 }}>
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Skeleton variant='text' width={120} height={20} />
                      <Skeleton variant='text' width={120} height={20} />
                      <Skeleton variant='text' width={80} height={20} />
                      <Skeleton variant='text' width={100} height={20} />
                    </Box>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 8 }}>
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Skeleton variant='text' width={180} height={20} />
                      <Skeleton variant='text' width={150} height={20} />
                      <Skeleton variant='text' width={200} height={20} />
                      <Skeleton variant='rectangular' width={120} height={32} />
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
                    <Typography sx={{ mb: 1, fontWeight: 500 }}>
                      Email:
                    </Typography>
                    <Typography sx={{ fontWeight: 500 }}>
                      Trạng thái:
                    </Typography>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 8 }}>
                    <Typography sx={{ mb: 1 }}>
                      {orderData?.data?.fullName ?? 'Không có'}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      {orderData?.data?.phoneNumber ?? 'Không có'}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      {orderData?.data?.email ?? 'Không có'}
                    </Typography>
                    <Button
                      variant='outlined'
                      color={
                        orderData?.data?.status === 'PROCESSING'
                          ? 'info'
                          : orderData?.data?.status === 'SHIPPED'
                          ? 'success'
                          : orderData?.data?.status === 'DELIVERED'
                          ? 'success'
                          : orderData?.data?.status === 'CANCELED'
                          ? 'error'
                          : 'error'
                      }
                      sx={{
                        width: 120,
                        fontSize: 13,
                        textTransform: 'none',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        },
                        gap: 1,
                      }}>
                      {orderData?.data?.status
                        ? statusMap?.[orderData?.data?.status]
                        : 'Không xác định'}
                    </Button>
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
              {isLoadingOrder ? (
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
                      {orderData?.data?.completedAt
                        ? moment(orderData?.data?.completedAt).format(
                            'DD/MM/YYYY'
                          )
                        : 'Không có'}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      {orderData?.data?.shipment?.deliveryDate
                        ? moment(
                            orderData?.data?.shipment?.deliveryDate
                          ).format('DD/MM/YYYY HH:mm')
                        : 'Không có'}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      {orderData?.data?.shipment?.method == 1
                        ? 'Giao hàng tận nơi'
                        : 'Nhận tại cửa hàng'}
                    </Typography>
                    <Typography>
                      {orderData?.data?.shipment?.address ?? ''}
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
              {isLoadingOrder ? (
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
                    src={orderData?.data?.paymentMethod?.image}
                    alt={orderData?.data?.paymentMethod?.name}
                  />
                  <Typography>
                    {orderData?.data?.paymentMethod?.name}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
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
            <Divider />
            <CardContent sx={{ minHeight: '400px' }}>
              {isLoadingOrder ? (
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
                          <Skeleton variant='text' width={20} height={20} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant='text' width={50} height={20} />
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
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Skeleton variant='text' width={20} height={20} />
                          </TableCell>
                          <TableCell>
                            <Skeleton variant='text' width={60} height={20} />
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
                        <TableCell>SL</TableCell>
                        <TableCell>Giá</TableCell>
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
                            {item?.skuAttributes?.length
                              ? item?.skuAttributes?.map((attr, index) => (
                                  <Typography key={index} sx={{ fontSize: 13 }}>
                                    {attr?.attribute}: {attr?.value}
                                  </Typography>
                                ))
                              : null}
                          </TableCell>
                          <TableCell>{item?.quantity}</TableCell>
                          <TableCell>
                            {formatPrice(item?.sellingPrice)}
                          </TableCell>
                        </TableRow>
                      ))}
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
          {isLoadingOrder ? (
            <>
              <Skeleton variant='rectangular' width={80} height={36} />
              <Skeleton variant='rectangular' width={100} height={36} />
              <Skeleton variant='rectangular' width={100} height={36} />
            </>
          ) : (
            <>
              <Button onClick={() => navigate(ROUTES.ORDER_LIST)}>
                Trở lại
              </Button>
              <Button
                variant='outlined'
                onClick={() => navigate(`${ROUTES.ORDER}/update/${id}`)}
                sx={{ minWidth: 100 }}>
                Chỉnh sửa
              </Button>
              {orderData?.data?.status === 'PENDING' && (
                <Button
                  variant='contained'
                  onClick={() => navigate(`${ROUTES.ORDER}/confirm/${id}`)}
                  sx={{ minWidth: 100 }}>
                  Xác nhận
                </Button>
              )}
            </>
          )}
        </Box>
      </Grid2>
    </>
  );
};

export default OrderDetail;
