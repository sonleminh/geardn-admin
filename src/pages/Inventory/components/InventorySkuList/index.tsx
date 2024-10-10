import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/constants/query-key';

import { AddCircleOutlined, Edit, Delete } from '@mui/icons-material';

import {
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  Pagination,
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
import { useDeleteCategory, useGetCategoryList } from '@/services/category';
import { IQuery } from '@/interfaces/IQuery';
import EastOutlinedIcon from '@mui/icons-material/EastOutlined';
import { useGetSkuByByProductId } from '@/services/product-sku';

const InventorySkuList = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [query, setQuery] = useState<IQuery>({
    limit: 10,
    page: 1,
  });

  const { data: skuList } = useGetSkuByByProductId(id ?? '');

  console.log(skuList);

  const { showNotification } = useNotificationContext();

  const { confirmModal, showConfirmModal } = useConfirmModal();

  const { mutate: deleteProductMutate } = useDeleteCategory();

  const handleDeleteProduct = (id: string) => {
    showNotification('Ok', 'error');
    deleteProductMutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Category] });
        showNotification('Xóa danh mục thành công', 'success');
      },
    });
  };

  const handleChangeQuery = (object: Partial<IQuery>) => {
    setQuery((prev) => ({ ...prev, ...object }));
  };

  return (
    <Card sx={{ borderRadius: 2 }}>
      <Card>
        <CardHeader
          title={
            <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
              Kho hàng sản phẩm{skuList && ': ' + skuList[0]?.product_name}
            </Typography>
          }
        />
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align='center'>STT</TableCell>
                <TableCell>Mã loại</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Số lượng</TableCell>
                <TableCell align='center'>Trạng thái</TableCell>
                <TableCell align='center'>Ngày tạo</TableCell>
                <TableCell align='center'>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {skuList?.map((item, index) => (
                <TableRow
                  key={index}
                  sx={{
                    ':hover': { bgcolor: '#F1F1F1', cursor: 'pointer' },
                  }}>
                  <TableCell align='center'>{index + 1}</TableCell>
                  <TableCell sx={{ width: '30%' }}>
                    <Typography sx={{ ...truncateTextByLine(2) }}>
                      {item.sku}
                    </Typography>
                  </TableCell>
                  <TableCell align='center'>{item.price}</TableCell>
                  <TableCell align='center'>{item.quantity}</TableCell>
                  <TableCell align='center'>{item.status}</TableCell>
                  <TableCell align='center'>
                    {moment(item.createdAt).format('DD/MM/YYYY')}
                  </TableCell>
                  <TableCell align='center'>
                    <Button variant='outlined'>
                      <EastOutlinedIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {skuList?.length === 0 && (
            <Box sx={{ my: 2, textAlign: 'center', color: '#696969' }}>
              Empty
            </Box>
          )}
        </TableContainer>
        <Divider />
        {/* <Box
          p={2}
          sx={{
            ['.MuiPagination-ul']: {
              justifyContent: 'center',
            },
            textAlign: 'right',
          }}>
          <Typography>Tổng cộng: {data?.total ?? 0}</Typography>
          <Pagination
            count={Math.ceil((data?.total ?? 0) / query.limit!)}
            page={query.page ?? 0}
            onChange={(_: React.ChangeEvent<unknown>, newPage) => {
              handleChangeQuery({ page: newPage });
            }}
            defaultPage={query.page ?? 0}
            showFirstButton
            showLastButton
          />
        </Box> */}
      </Card>
      {confirmModal()}
    </Card>
  );
};

export default InventorySkuList;
