import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/constants/query-key';

import { AddCircleOutlined } from '@mui/icons-material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import {
  Box,
  Card,
  CardHeader,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import useConfirmModal from '@/hooks/useModalConfirm';
import { truncateTextByLine } from '@/utils/css-helper.util';
import moment from 'moment';
import { useNotificationContext } from '@/contexts/NotificationContext';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import ActionButton from '@/components/ActionButton';
import {
  useDeleteWarehouse,
  useGetWarehouseById,
  useGetWarehouseList,
} from '@/services/warehouse';
import { IQuery } from '@/interfaces/IQuery';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  useGetStockByProduct,
  useGetStocksByWarehouse,
} from '@/services/stock';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AddBusinessOutlinedIcon from '@mui/icons-material/AddBusinessOutlined';
import { ROUTES } from '@/constants/route';

const StockByProduct = () => {
  const { id } = useParams();
  const numericId = id ? Number(id) : undefined;

  const navigate = useNavigate();
  const { showNotification } = useNotificationContext();
  const { confirmModal, showConfirmModal } = useConfirmModal();

  const { data: warehousesData } = useGetWarehouseList();

  const { data: stockData } = useGetStockByProduct(numericId);
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
            <Typography sx={{ mr: 2, fontSize: 20, fontWeight: 500 }}>
              Tồn kho sản phẩm: {stockData?.data?.name}
            </Typography>
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
                <TableCell align='center'>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stockData?.data ? (
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
                            {/* {item?.productName} */}
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
                    <TableCell align='center'>
                      <ActionButton>
                        <Box mb={1}>
                          <ButtonWithTooltip
                            color='primary'
                            // onClick={() => navigate(`update/${item?.}`)}
                            variant='outlined'
                            title='Chỉnh sửa'
                            placement='left'>
                            <EditOutlinedIcon />
                          </ButtonWithTooltip>
                        </Box>
                        <Box>
                          <ButtonWithTooltip
                            color='error'
                            onClick={() => {
                              showConfirmModal({
                                title: 'Bạn có muốn xóa danh mục này không?',
                                cancelText: 'Hủy',
                                // onOk: () => handleDeleteCategory(item?.id),
                                okText: 'Xóa',
                                btnOkColor: 'error',
                              });
                            }}
                            variant='outlined'
                            title='Xoá'
                            placement='left'>
                            <DeleteOutlineOutlinedIcon />
                          </ButtonWithTooltip>
                        </Box>
                      </ActionButton>
                    </TableCell>
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

export default StockByProduct;
