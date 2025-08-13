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
import { useGetEnumByContext } from '@/services/enum';
import { useGetOrderReturnRequestById } from '@/services/order-return-request';
import { truncateTextByLine } from '@/utils/css-helper.util';
import { formatPrice } from '@/utils/format-price';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import moment from 'moment';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const OrderReturnRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: orderReturnRequestData } = useGetOrderReturnRequestById(
    id as string
  );
  const { data: orderReturnStatusEnumData } =
    useGetEnumByContext('return-status');
  const { data: orderReasonCodeEnumData } =
    useGetEnumByContext('order-reason-code');

  const orderReturnTypeMap: Record<string, string> = {
    CANCEL: 'Đơn hủy',
    DELIVERY_FAIL: 'Giao thất bại',
    RETURN: 'Đơn hoàn',
  };

  const reasonMap = useMemo(
    () =>
      Object.fromEntries(
        orderReasonCodeEnumData?.data?.map((item) => [
          item.value,
          item.label,
        ]) ?? []
      ),
    [orderReasonCodeEnumData?.data]
  );

  const statusMap = useMemo(
    () =>
      Object.fromEntries(
        orderReturnStatusEnumData?.data?.map((item) => [
          item.value,
          item.label,
        ]) ?? []
      ),
    [orderReturnStatusEnumData?.data]
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
        onClick: () => navigate(ROUTES.ORDER),
      },
      {
        label: 'Chi tiết yêu cầu hoàn trả đơn hàng',
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
        Chi tiết yêu cầu hoàn trả đơn hàng:
      </Typography>

      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12 }}>
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title='Thông tin yêu cầu'
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
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Grid2 container spacing={3}>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                      <Typography sx={{ mb: 1, fontWeight: 500 }}>
                        Loại yêu cầu:
                      </Typography>
                      <Typography sx={{ mb: 1, fontWeight: 500 }}>
                        Lý do hoàn trả:
                      </Typography>
                      <Typography sx={{ mb: 1, fontWeight: 500 }}>
                        Ghi chú:
                      </Typography>
                      <Typography sx={{ mb: 1, fontWeight: 500 }}>
                        Trạng thái:
                      </Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                      <Typography sx={{ mb: 1, fontWeight: 500 }}>
                        {orderReturnTypeMap[
                          orderReturnRequestData?.data?.type as string
                        ] || orderReturnRequestData?.data?.type}
                      </Typography>
                      <Typography sx={{ mb: 1, fontWeight: 500 }}>
                        {reasonMap?.[
                          orderReturnRequestData?.data?.reasonCode as string
                        ] || 'Không xác định'}
                      </Typography>
                      <Typography sx={{ mb: 1, fontWeight: 500 }}>
                        {orderReturnRequestData?.data?.reasonNote}
                      </Typography>
                      <Button
                        variant='outlined'
                        color={
                          orderReturnRequestData?.data?.status === 'PENDING'
                            ? 'warning'
                            : orderReturnRequestData?.data?.status ===
                              'APPROVED'
                            ? 'info'
                            : orderReturnRequestData?.data?.status ===
                              'COMPLETED'
                            ? 'success'
                            : orderReturnRequestData?.data?.status ===
                              'REJECTED'
                            ? 'error'
                            : orderReturnRequestData?.data?.status ===
                              'CANCELED'
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
                        {statusMap?.[
                          orderReturnRequestData?.data?.status as string
                        ] || 'Không xác định'}
                      </Button>
                    </Grid2>
                  </Grid2>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Grid2 container spacing={3}>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                      <Typography sx={{ mb: 1, fontWeight: 500 }}>
                        Người tạo:
                      </Typography>
                      <Typography sx={{ mb: 1, fontWeight: 500 }}>
                        Người duyệt:
                      </Typography>
                      <Typography sx={{ mb: 1, fontWeight: 500 }}>
                        Ngày tạo:
                      </Typography>
                      <Typography sx={{ mb: 1, fontWeight: 500 }}>
                        Ngày hoàn thành:
                      </Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                      <Typography sx={{ mb: 1, fontWeight: 500 }}>
                        {orderReturnRequestData?.data?.createdBy?.name}
                      </Typography>
                      <Typography sx={{ mb: 1, fontWeight: 500 }}>
                        {orderReturnRequestData?.data?.approvedBy?.name}
                      </Typography>
                      <Typography sx={{ mb: 1, fontWeight: 500 }}>
                        {moment(orderReturnRequestData?.data?.createdAt).format(
                          'DD/MM/YYYY HH:mm'
                        )}
                      </Typography>
                      <Typography sx={{ mb: 1, fontWeight: 500 }}>
                        {moment(
                          orderReturnRequestData?.data?.completedAt
                        ).format('DD/MM/YYYY HH:mm')}
                      </Typography>
                    </Grid2>
                  </Grid2>
                </Grid2>
              </Grid2>
            </CardContent>
          </Card>
        </Grid2>

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
                    {orderReturnRequestData?.data?.order?.completedAt
                      ? moment(
                          orderReturnRequestData?.data?.order?.completedAt
                        ).format('DD/MM/YYYY')
                      : 'Không có'}
                  </Typography>
                  <Typography sx={{ mb: 1 }}>
                    {orderReturnRequestData?.data?.order?.shipment?.deliveryDate
                      ? moment(
                          orderReturnRequestData?.data?.order?.shipment
                            ?.deliveryDate
                        ).format('DD/MM/YYYY HH:mm')
                      : 'Không có'}
                  </Typography>
                  <Typography sx={{ mb: 1 }}>
                    {orderReturnRequestData?.data?.order?.shipment?.method == 1
                      ? 'Giao hàng tận nơi'
                      : 'Nhận tại cửa hàng'}
                  </Typography>
                  <Typography>
                    {orderReturnRequestData?.data?.order?.shipment?.address ??
                      ''}
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
                  src={
                    orderReturnRequestData?.data?.order?.paymentMethod?.image
                  }
                  alt={orderReturnRequestData?.data?.order?.paymentMethod?.name}
                />
                <Typography>
                  {orderReturnRequestData?.data?.order?.paymentMethod?.name}
                </Typography>
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
                      <TableCell>SL</TableCell>
                      <TableCell>Giá</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderReturnRequestData?.data?.order?.orderItems.map(
                      (item, index) => (
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
                                // width: 80,
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
                      )
                    )}
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
          <Button
            onClick={() => navigate(ROUTES.ORDER_RETURN_REQUEST)}
            sx={{ mr: 2 }}>
            Trở lại
          </Button>
        </Box>
      </Grid2>
    </>
  );
};

export default OrderReturnRequestDetail;
