import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';

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
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { ROUTES } from '@/constants/route';
import { useGetAdjustmentLogById } from '@/services/inventory';
import { useGetEnumByContext } from '@/services/enum';
import { truncateTextByLine } from '@/utils/css-helper.util';
import { formatPrice } from '@/utils/format-price';

const InventoryAdjustmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: adjustmentLogData, isLoading } = useGetAdjustmentLogById(
    id as string
  );
  const { data: importTypeData } = useGetEnumByContext('import-type');

  const importTypeMap = useMemo(
    () =>
      Object.fromEntries(
        importTypeData?.data?.map((item) => [item.value, item.label]) ?? []
      ),
    [importTypeData?.data]
  );

  const breadcrumbs = useMemo(
    () => [
      {
        icon: <HomeOutlinedIcon sx={{ fontSize: 24 }} />,
        label: '',
        onClick: () => navigate(ROUTES.DASHBOARD),
      },
      {
        label: 'Điều chỉnh hàng',
        onClick: () => navigate(ROUTES.INVENTORY_ADJUSTMENT),
      },
      {
        label: 'Chi tiết điều chỉnh hàng',
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
        Chi tiết điều chỉnh hàng:
      </Typography>

      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title='Thông tin điều chỉnh hàng'
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
                    Mã code:
                  </Typography>
                  <Typography sx={{ mb: 1, fontWeight: 500 }}>
                    Loại điều chỉnh:
                  </Typography>
                  <Typography sx={{ mb: 1, fontWeight: 500 }}>
                    Ghi chú:
                  </Typography>
                  <Typography sx={{ mb: 1, fontWeight: 500 }}>
                    Kho điều chỉnh:
                  </Typography>
                  <Typography sx={{ mb: 1, fontWeight: 500 }}>
                    Người tạo:
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    Ngày điều chỉnh:
                  </Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 8 }}>
                  {isLoading ? (
                    <>
                      <Skeleton width={180} height={24} sx={{ mb: 1 }} />
                      <Skeleton width={180} height={24} sx={{ mb: 1 }} />
                      <Skeleton width={180} height={24} sx={{ mb: 1 }} />
                      <Skeleton width={180} height={24} sx={{ mb: 1 }} />
                      <Skeleton width={180} height={24} sx={{ mb: 1 }} />
                      <Skeleton width={180} height={24} />
                    </>
                  ) : (
                    <>
                      <Typography sx={{ mb: 1 }}>
                        {adjustmentLogData?.data?.referenceCode ?? 'Không có'}
                      </Typography>
                      <Typography sx={{ mb: 1 }}>
                        {importTypeMap?.[
                          adjustmentLogData?.data?.type as string
                        ] || 'Không xác định'}
                      </Typography>
                      <Typography sx={{ mb: 1 }}>
                        {adjustmentLogData?.data?.note ?? 'Không có'}
                      </Typography>
                      <Typography sx={{ mb: 1 }}>
                        {adjustmentLogData?.data?.warehouse?.name ?? 'Không có'}
                      </Typography>
                      <Typography sx={{ mb: 1 }}>
                        {adjustmentLogData?.data?.user?.name ?? 'Không có'}
                      </Typography>
                      <Typography sx={{ mb: 1 }}>
                        {adjustmentLogData?.data?.adjustmentDate
                          ? moment(
                              adjustmentLogData?.data?.adjustmentDate
                            ).format('DD/MM/YYYY')
                          : 'Không có'}
                      </Typography>
                      <Typography>
                        {adjustmentLogData?.data?.createdAt
                          ? moment(adjustmentLogData?.data?.createdAt).format(
                              'DD/MM/YYYY'
                            )
                          : 'Không có'}
                      </Typography>
                    </>
                  )}
                </Grid2>
              </Grid2>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              title='Chi tiết điều chỉnh'
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
                      <TableCell align='center'>STT</TableCell>
                      <TableCell align='center'>Ảnh</TableCell>
                      <TableCell align='center'>Sản phẩm</TableCell>
                      <TableCell align='center'>SL cũ</TableCell>
                      <TableCell align='center'>SL mới</TableCell>
                      <TableCell align='center'>Giá</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoading
                      ? Array.from(new Array(5)).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell align='center'>
                              <Skeleton width={30} height={24} />
                            </TableCell>
                            <TableCell align='center'>
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
                                  gap: 1,
                                }}>
                                <Skeleton width={50} height={20} />
                                <Skeleton width={50} height={16} />
                              </Box>
                            </TableCell>
                            <TableCell align='center'>
                              <Skeleton width={50} height={24} />
                            </TableCell>
                            <TableCell align='center'>
                              <Skeleton width={50} height={24} />
                            </TableCell>
                            <TableCell align='center'>
                              <Skeleton width={50} height={24} />
                            </TableCell>
                          </TableRow>
                        ))
                      : adjustmentLogData?.data?.items.map((item, index) => (
                          <TableRow key={item?.id}>
                            <TableCell align='center'>{index + 1}</TableCell>
                            <TableCell align='center'>
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
                                  src={item?.sku?.imageUrl}
                                  alt={item?.sku?.product?.name}
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
                                {item?.sku?.product?.name}
                              </Typography>
                              {item?.sku?.productSkuAttributes?.length
                                ? item?.sku?.productSkuAttributes?.map(
                                    (attr, index) => (
                                      <Typography
                                        key={index}
                                        sx={{ fontSize: 13 }}>
                                        {attr?.attributeValue?.attribute?.label}
                                        : {attr?.attributeValue?.value}
                                      </Typography>
                                    )
                                  )
                                : null}
                            </TableCell>
                            <TableCell align='center'>
                              {item?.quantityBefore ?? 0}
                            </TableCell>
                            <TableCell align='center'>
                              {item?.quantityChange ?? 0}
                            </TableCell>
                            <TableCell align='center'>
                              {formatPrice(item?.sku?.sellingPrice ?? 0)}
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
          <Button
            onClick={() => navigate(ROUTES.INVENTORY_ADJUSTMENT)}
            sx={{ mr: 2 }}>
            Trở lại
          </Button>
        </Box>
      </Grid2>
    </>
  );
};

export default InventoryAdjustmentDetail;
