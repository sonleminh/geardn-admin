import { useNavigate, useParams } from 'react-router-dom';

import {
  Box,
  Card,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
} from '@mui/material';
import AddBusinessOutlinedIcon from '@mui/icons-material/AddBusinessOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import { ROUTES } from '@/constants/route';

import { useNotificationContext } from '@/contexts/NotificationContext';

import useConfirmModal from '@/hooks/useModalConfirm';

import { useGetStockByProduct } from '@/services/stock';
import { useGetWarehouseList } from '@/services/warehouse';

import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import ActionButton from '@/components/ActionButton';

import { truncateTextByLine } from '@/utils/css-helper.util';
import { TableSkeleton } from '@/components/TableSkeleton';
import { TableColumn } from '@/interfaces/ITableColumn';

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
  const { confirmModal, showConfirmModal } = useConfirmModal();

  const { data: warehousesData, isLoading: isLoadingWarehouses } =
    useGetWarehouseList();

  const { data: stockData, isLoading: isLoadingStock } =
    useGetStockByProduct(numericId);

  const isLoading = isLoadingWarehouses || isLoadingStock || !numericId;

  return (
    <Card sx={{ borderRadius: 2 }}>
      <Card>
        <CardHeader
          action={
            <ButtonWithTooltip
              variant='contained'
              onClick={() => navigate(`${ROUTES.WAREHOUSE}/import`)}
              title='Thêm kho hàng'>
              <AddBusinessOutlinedIcon />
            </ButtonWithTooltip>
          }
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={() => navigate(ROUTES.INVENTORY)}
                sx={{ mr: 1 }}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography sx={{ mr: 2, fontSize: 20, fontWeight: 500 }}>
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
                {warehousesData?.data?.map((warehouse) => (
                  <TableCell align='center'>{warehouse?.name}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableSkeleton rowsPerPage={2} columns={columns} />
              ) : stockData?.data ? (
                stockData?.data?.skus?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell align='center'>{index + 1}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            height: 60,
                            '.thumbnail': {
                              width: 60,
                              height: 60,
                              objectFit: 'contain',
                            },
                          }}>
                          <img src={item?.imageUrl} className='thumbnail' />
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            ml: 2,
                          }}>
                          <Typography sx={{ ...truncateTextByLine(2) }}>
                            {item?.name}
                          </Typography>
                        </Box>
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
                          : ''}
                      </Box>
                    </TableCell>
                    {warehousesData?.data?.map((warehouse, index) => (
                      <TableCell key={warehouse?.id} align='center'>
                        <Typography>
                          {item?.stocks?.[index]?.quantity ?? 'Không có'}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell align='center' colSpan={6}>
                    Empty
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
