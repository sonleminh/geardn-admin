import { useNavigate, useParams } from 'react-router-dom';

import { ROUTES } from '@/constants/route';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined';
import {
  Box,
  Card,
  CardHeader,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { BsBoxes } from 'react-icons/bs';

import useConfirmModal from '@/hooks/useModalConfirm';

import { useGetStockByProduct } from '@/services/stock';
import { useGetWarehouseList } from '@/services/warehouse';

import ActionButton from '@/components/ActionButton';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';

import { TableSkeleton } from '@/components/TableSkeleton';
import { TableColumn } from '@/interfaces/ITableColumn';
import { truncateTextByLine } from '@/utils/css-helper.util';
import { formatPrice } from '@/utils/format-price';

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

  return (
    <Card sx={{ borderRadius: 2 }}>
      <Card>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={() => navigate(ROUTES.INVENTORY)}
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
                  <TableRow key={index}>
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
                          ? item?.productSkuAttributes?.map((item) => (
                              <Typography sx={{ fontSize: 14 }}>
                                {item?.attributeValue?.attribute?.label}:{' '}
                                {item?.attributeValue?.value}
                              </Typography>
                            ))
                          : 'Không có'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {warehousesData?.data?.map((warehouse, index) => (
                        <Box
                          key={warehouse?.id}
                          sx={{
                            display: 'flex',
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            px: 2,
                            py: 1,
                            mb:
                              index === warehousesData?.data?.length - 1
                                ? 0
                                : 2,
                          }}>
                          <Typography sx={{ mr: 8 }}>
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
                              {item?.stocks?.[index]?.quantity ?? 0}
                            </Typography>
                          </Typography>
                          <Typography
                            sx={{ display: 'flex', alignItems: 'center' }}>
                            <PriceChangeOutlinedIcon sx={{ fontSize: 20 }} />
                            <Typography component='span' sx={{ ml: 1 }}>
                              Giá vốn:
                            </Typography>
                            <Typography component='span' sx={{ ml: 1 }}>
                              {formatPrice(
                                item?.stocks?.[index]?.costPrice ?? 0
                              )}
                            </Typography>
                          </Typography>
                        </Box>
                      ))}
                    </TableCell>

                    <TableCell align='center'>
                      <ActionButton>
                        <Box>
                          {/* <ButtonWithTooltip
                            color='primary'
                            variant='outlined'
                            title='Xem'
                            placement='left'
                            onClick={() => navigate(`${product.id}`)}>
                            <VisibilityOutlinedIcon />
                          </ButtonWithTooltip> */}
                        </Box>
                        <Box mb={1}>
                          <ButtonWithTooltip
                            color='primary'
                            variant='outlined'
                            title='Chỉnh sửa'
                            placement='left'
                            // onClick={() => navigate(`update/${product.id}`)}
                          >
                            <EditOutlinedIcon />
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
  );
};

export default InventoryByProduct;
