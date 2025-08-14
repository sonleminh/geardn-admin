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
import { useGetExportLogById } from '@/services/inventory';
import { truncateTextByLine } from '@/utils/css-helper.util';
import { formatPrice } from '@/utils/format-price';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import moment from 'moment';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const InventoryExportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: exportLogData } = useGetExportLogById(id as string);
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
        label: 'Xuất hàng',
        onClick: () => navigate(ROUTES.INVENTORY_EXPORT),
      },
      {
        label: 'Chi tiết xuất hàng',
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
        Chi tiết xuất hàng:
      </Typography>

      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title='Thông tin xuất hàng'
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
                    Loại xuất hàng:
                  </Typography>
                  <Typography sx={{ mb: 1, fontWeight: 500 }}>
                    Ghi chú:
                  </Typography>
                  <Typography sx={{ mb: 1, fontWeight: 500 }}>
                    Kho xuất:
                  </Typography>
                  <Typography sx={{ mb: 1, fontWeight: 500 }}>
                    Người tạo:
                  </Typography>
                  <Typography sx={{ mb: 1, fontWeight: 500 }}>
                    Ngày xuất:
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>Ngày tạo:</Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 8 }}>
                  <Typography sx={{ mb: 1 }}>
                    {exportLogData?.data?.referenceCode ?? 'Không có'}
                  </Typography>
                  <Typography sx={{ mb: 1 }}>
                    {importTypeMap?.[exportLogData?.data?.type as string] ||
                      'Không xác định'}
                  </Typography>
                  <Typography sx={{ mb: 1 }}>
                    {exportLogData?.data?.note ?? 'Không có'}
                  </Typography>
                  <Typography sx={{ mb: 1 }}>
                    {exportLogData?.data?.warehouse?.name ?? 'Không có'}
                  </Typography>
                  <Typography sx={{ mb: 1 }}>
                    {exportLogData?.data?.user?.name ?? 'Không có'}
                  </Typography>
                  <Typography sx={{ mb: 1 }}>
                    {exportLogData?.data?.exportDate
                      ? moment(exportLogData?.data?.exportDate).format(
                          'DD/MM/YYYY'
                        )
                      : 'Không có'}
                  </Typography>
                  <Typography>
                    {exportLogData?.data?.createdAt
                      ? moment(exportLogData?.data?.createdAt).format(
                          'DD/MM/YYYY'
                        )
                      : 'Không có'}
                  </Typography>
                </Grid2>
              </Grid2>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              title='Chi tiết hàng nhập'
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
                    {exportLogData?.data?.items.map((item, index) => (
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
                                  <Typography key={index} sx={{ fontSize: 13 }}>
                                    {attr?.attributeValue?.attribute?.label}:{' '}
                                    {attr?.attributeValue?.value}
                                  </Typography>
                                )
                              )
                            : null}
                        </TableCell>
                        <TableCell>{item?.quantity}</TableCell>
                        <TableCell>{formatPrice(item?.unitCost)}</TableCell>
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
            onClick={() => navigate(ROUTES.INVENTORY_EXPORT)}
            sx={{ mr: 2 }}>
            Trở lại
          </Button>
        </Box>
      </Grid2>
    </>
  );
};

export default InventoryExportDetail;
