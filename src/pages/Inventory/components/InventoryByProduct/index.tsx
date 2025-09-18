import { useNavigate, useParams } from 'react-router-dom';

import { ROUTES } from '@/constants/route';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined';
import {
  Box,
  Breadcrumbs,
  Card,
  CardHeader,
  Divider,
  IconButton,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { BsBoxes } from 'react-icons/bs';
import { LuPackageMinus, LuPackagePlus } from 'react-icons/lu';

import useConfirmModal from '@/hooks/useModalConfirm';

import { useGetStockByProduct } from '@/services/stock';
import { useGetWarehouseList } from '@/services/warehouse';

import ActionButton from '@/components/ActionButton';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';

import { TableSkeleton } from '@/components/TableSkeleton';
import { TableColumn } from '@/interfaces/ITableColumn';
import { truncateTextByLine } from '@/utils/css-helper.util';
import { formatPrice } from '@/utils/format-price';
import { IProductSku } from '@/interfaces/IProductSku';

const columns: TableColumn[] = [
  { align: 'center' },
  { type: 'complex' },
  { align: 'center' },
  { align: 'center' },
  { align: 'center', type: 'action' },
];

const InventoryByProduct = () => {
  const { id } = useParams();
  const numericId = id ? Number(id) : undefined;

  const navigate = useNavigate();
  const { confirmModal } = useConfirmModal();

  const { data: warehousesData, isLoading: isLoadingWarehouses } =
    useGetWarehouseList();

  const { data: stockData, isLoading: isLoadingStock } =
    useGetStockByProduct(numericId);

  const isLoading = isLoadingWarehouses || isLoadingStock || !numericId;

  function getStockByWarehouse(sku: IProductSku, warehouseId: number) {
    return sku?.stocks?.find((stock) => stock?.warehouseId === warehouseId);
  }

  return (
    <>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize='small' />}
        aria-label='breadcrumb'
        sx={{ mb: 3 }}>
        <Link
          underline='hover'
          color='inherit'
          onClick={() => navigate(ROUTES.DASHBOARD)}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <HomeOutlinedIcon sx={{ fontSize: 24 }} />
        </Link>
        <Link
          underline='hover'
          color='inherit'
          onClick={() => navigate(ROUTES.INVENTORY_LIST)}
          sx={{ cursor: 'pointer' }}>
          Tồn kho
        </Link>
        <Typography color='text.primary'>
          Tồn kho sản phẩm: {stockData?.data?.name}
        </Typography>
      </Breadcrumbs>
      <Card sx={{ borderRadius: 2 }}>
        <Card>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  onClick={() => navigate(ROUTES.INVENTORY_LIST)}
                  sx={{ mr: 1 }}>
                  <ChevronLeftIcon />
                </IconButton>
                <Typography
                  sx={{
                    mr: 2,
                    fontSize: 20,
                    fontWeight: 500,
                    ...truncateTextByLine(1),
                  }}>
                  Tồn kho sản phẩm: {stockData?.data?.name}
                </Typography>
              </Box>
            }
          />
          <Divider />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align='center'>STT</TableCell>
                  <TableCell>Sản phẩm</TableCell>
                  <TableCell>Phân loại</TableCell>

                  <TableCell align='center'>Thông tin</TableCell>
                  <TableCell align='center'>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton rowsPerPage={2} columns={columns} />
                ) : stockData?.data?.skus?.length ? (
                  stockData?.data?.skus?.map((item, index) => (
                    <TableRow key={item?.id || index}>
                      <TableCell align='center'>{index + 1}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            height: 60,
                            '.thumbnail': {
                              width: 60,
                              height: 60,
                              objectFit: 'contain',
                            },
                          }}>
                          <img
                            src={item?.imageUrl ?? stockData?.data?.images?.[0]}
                            className='thumbnail'
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          {item?.productSkuAttributes?.length
                            ? item?.productSkuAttributes?.map(
                                (item, prdSkuAttrIndex) => (
                                  <Typography
                                    key={prdSkuAttrIndex}
                                    sx={{ fontSize: 14 }}>
                                    {item?.attributeValue?.attribute?.label}:{' '}
                                    {item?.attributeValue?.value}
                                  </Typography>
                                )
                              )
                            : 'Không có'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {warehousesData?.data?.map(
                          (warehouse, warehouseIndex) => (
                            <Box
                              key={warehouse?.id || warehouseIndex}
                              sx={{
                                display: 'flex',
                                border: '1px solid #e0e0e0',
                                borderRadius: 1,
                                px: 2,
                                py: 1,
                                mb:
                                  warehouseIndex ===
                                  warehousesData?.data?.length - 1
                                    ? 0
                                    : 2,
                              }}>
                              <Typography sx={{ width: 150, mr: 8 }}>
                                {warehouse?.name}:
                              </Typography>
                              <Typography
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  width: 150,
                                  fontSize: 14,
                                }}>
                                <BsBoxes />
                                <Typography component='span' sx={{ ml: 1 }}>
                                  Số lượng:
                                </Typography>
                                <Typography component='span' sx={{ ml: 1 }}>
                                  {
                                    getStockByWarehouse(item, warehouse?.id)
                                      ?.quantity
                                  }
                                </Typography>
                              </Typography>
                              <Typography
                                sx={{ display: 'flex', alignItems: 'center' }}>
                                <PriceChangeOutlinedIcon
                                  sx={{ fontSize: 20 }}
                                />
                                <Typography component='span' sx={{ ml: 1 }}>
                                  Giá vốn:
                                </Typography>
                                <Typography component='span' sx={{ ml: 1 }}>
                                  {formatPrice(
                                    getStockByWarehouse(item, warehouse?.id)
                                      ?.unitCost ?? 0
                                  )}
                                </Typography>
                              </Typography>
                            </Box>
                          )
                        )}
                      </TableCell>

                      <TableCell align='center'>
                        <ActionButton>
                          <Box sx={{ mb: 1 }}>
                            <ButtonWithTooltip
                              color='primary'
                              variant='outlined'
                              title='Nhập kho'
                              placement='left'
                              onClick={() =>
                                navigate(ROUTES.INVENTORY_IMPORT_CREATE)
                              }>
                              <LuPackagePlus size={24} />
                            </ButtonWithTooltip>
                          </Box>
                          <Box>
                            <ButtonWithTooltip
                              color='primary'
                              variant='outlined'
                              title='Xuất kho'
                              placement='left'
                              onClick={() =>
                                navigate(ROUTES.INVENTORY_EXPORT_CREATE)
                              }>
                              <LuPackageMinus size={24} />
                            </ButtonWithTooltip>
                          </Box>
                        </ActionButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell align='center' colSpan={6}>
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider />
        </Card>
        {confirmModal()}
      </Card>
    </>
  );
};

export default InventoryByProduct;
