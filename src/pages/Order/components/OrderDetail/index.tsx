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

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: orderData } = useGetOrderById(id as string);

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
                    {orderData?.data?.fullName ?? 'Không có'}
                  </Typography>
                  <Typography sx={{ mb: 1 }}>
                    {orderData?.data?.phoneNumber ?? 'Không có'}
                  </Typography>
                  <Typography>
                    {orderData?.data?.email ?? 'Không có'}
                  </Typography>
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
                      ? moment(orderData?.data?.shipment?.deliveryDate).format(
                          'DD/MM/YYYY HH:mm'
                        )
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
                            <img src={item?.imageUrl} alt={item?.productName} />
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
                        <TableCell>{formatPrice(item?.sellingPrice)}</TableCell>
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
          <Button onClick={() => navigate(ROUTES.ORDER_LIST)} sx={{ mr: 2 }}>
            Trở lại
          </Button>
          <Button
            variant='contained'
            onClick={() => navigate(`${ROUTES.ORDER}/update/${id}`)}
            sx={{ minWidth: 100 }}>
            Chỉnh sửa
          </Button>
        </Box>
      </Grid2>
    </>
  );
};

export default OrderDetail;
