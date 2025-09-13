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
import { useGetEnumByContext } from '@/services/enum';
import {
  useGetOrderReturnRequestById,
  useUpdateOrderReturnRequestStatus,
} from '@/services/order-return-request';
import { truncateTextByLine } from '@/utils/css-helper.util';
import { formatPrice } from '@/utils/format-price';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import moment from 'moment';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAlertContext } from '@/contexts/AlertContext';

const OrderReturnRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlertContext();

  const {
    data: orderReturnRequestData,
    isLoading: isLoadingOrderReturnRequest,
  } = useGetOrderReturnRequestById(id as string);
  const {
    mutate: updateOrderReturnRequestStatus,
    isPending: isUpdatingStatus,
  } = useUpdateOrderReturnRequestStatus();

  const { data: orderReturnStatusEnumData, isLoading: isLoadingReturnStatus } =
    useGetEnumByContext('return-status');
  const { data: orderReasonCodeEnumData, isLoading: isLoadingReasonCode } =
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
        label: 'Danh sách yêu cầu hoàn hàng ',
        onClick: () => navigate(ROUTES.ORDER_RETURN_REQUEST),
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
              {isLoadingOrderReturnRequest ||
              isLoadingReturnStatus ||
              isLoadingReasonCode ? (
                <Grid2 container spacing={3}>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <Grid2 container spacing={3}>
                      <Grid2 size={{ xs: 12, md: 6 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                          }}>
                          <Skeleton variant='text' width={100} height={20} />
                          <Skeleton variant='text' width={120} height={20} />
                          <Skeleton variant='text' width={80} height={20} />
                          <Skeleton variant='text' width={100} height={20} />
                        </Box>
                      </Grid2>
                      <Grid2 size={{ xs: 12, md: 6 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                          }}>
                          <Skeleton variant='text' width={100} height={20} />
                          <Skeleton variant='text' width={120} height={20} />
                          <Skeleton variant='text' width={150} height={20} />
                          <Skeleton
                            variant='rectangular'
                            width={120}
                            height={32}
                          />
                        </Box>
                      </Grid2>
                    </Grid2>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <Grid2 container spacing={3}>
                      <Grid2 size={{ xs: 12, md: 6 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                          }}>
                          <Skeleton variant='text' width={100} height={20} />
                          <Skeleton variant='text' width={100} height={20} />
                          <Skeleton variant='text' width={80} height={20} />
                          <Skeleton variant='text' width={120} height={20} />
                        </Box>
                      </Grid2>
                      <Grid2 size={{ xs: 12, md: 6 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                          }}>
                          <Skeleton variant='text' width={120} height={20} />
                          <Skeleton variant='text' width={100} height={20} />
                          <Skeleton variant='text' width={150} height={20} />
                          <Skeleton variant='text' width={150} height={20} />
                        </Box>
                      </Grid2>
                    </Grid2>
                  </Grid2>
                </Grid2>
              ) : (
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
                          {orderReturnRequestData?.data?.approvedBy?.name ??
                            'Không có'}
                        </Typography>
                        <Typography sx={{ mb: 1, fontWeight: 500 }}>
                          {orderReturnRequestData?.data?.approvedBy?.name}
                        </Typography>
                        <Typography sx={{ mb: 1, fontWeight: 500 }}>
                          {orderReturnRequestData?.data?.createdAt
                            ? moment(
                                orderReturnRequestData?.data?.createdAt
                              ).format('DD/MM/YYYY HH:mm')
                            : 'Không có'}
                        </Typography>
                        <Typography sx={{ mb: 1, fontWeight: 500 }}>
                          {orderReturnRequestData?.data?.completedAt
                            ? moment(
                                orderReturnRequestData?.data?.completedAt
                              ).format('DD/MM/YYYY HH:mm')
                            : 'Không có'}
                        </Typography>
                      </Grid2>
                    </Grid2>
                  </Grid2>
                </Grid2>
              )}
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
              {isLoadingOrderReturnRequest ? (
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
                                  fontSize: 14,
                                  fontWeight: 500,
                                  ...truncateTextByLine(1),
                                }}>
                                {item?.productName}
                              </Typography>
                              {item?.skuAttributes?.length
                                ? item?.skuAttributes?.map((attr, index) => (
                                    <Typography
                                      key={index}
                                      sx={{ fontSize: 13 }}>
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
          {isLoadingOrderReturnRequest ? (
            <>
              <Skeleton variant='rectangular' width={80} height={36} />
              <Skeleton variant='rectangular' width={100} height={36} />
            </>
          ) : (
            <>
              <Button onClick={() => navigate(ROUTES.ORDER_RETURN_REQUEST)}>
                Trở lại
              </Button>
              {orderReturnRequestData?.data?.status === 'AWAITING_APPROVAL' && (
                <Button
                  variant='contained'
                  onClick={() => {
                    if (id) {
                      updateOrderReturnRequestStatus(
                        {
                          id: +id,
                          oldStatus:
                            orderReturnRequestData?.data?.status ||
                            'AWAITING_APPROVAL',
                          newStatus: 'APPROVED',
                        },
                        {
                          onSuccess: () => {
                            showAlert(
                              'Cập nhật trạng thái thành công',
                              'success'
                            );
                            navigate(ROUTES.ORDER_RETURN_REQUEST);
                          },
                          onError: () => {
                            showAlert('Cập nhật trạng thái thất bại', 'error');
                          },
                        }
                      );
                    }
                  }}
                  disabled={isUpdatingStatus}
                  sx={{ minWidth: 100 }}>
                  Duyệt
                </Button>
              )}
              {orderReturnRequestData?.data?.status === 'APPROVED' && (
                <Button
                  variant='contained'
                  onClick={() =>
                    navigate(
                      `${ROUTES.ORDER_RETURN_REQUEST}/confirm/${orderReturnRequestData?.data.id}`
                    )
                  }
                  disabled={isUpdatingStatus}
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

export default OrderReturnRequestDetail;
