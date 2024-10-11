import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';

import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import { useNotificationContext } from '@/contexts/NotificationContext';
import useConfirmModal from '@/hooks/useModalConfirm';
import { IQuery } from '@/interfaces/IQuery';
import { useGetProductByCategory } from '@/services/product';
import { truncateTextByLine } from '@/utils/css-helper.util';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
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
} from '@mui/material';
import moment from 'moment';

const InventoryCategoryList = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [query, setQuery] = useState<IQuery>({
    limit: 10,
    page: 1,
  });

  const { data: productList } = useGetProductByCategory(id ?? '');

  const { showNotification } = useNotificationContext();

  const { confirmModal } = useConfirmModal();

  const handleChangeQuery = (object: Partial<IQuery>) => {
    setQuery((prev) => ({ ...prev, ...object }));
  };

  return (
    <Card sx={{ borderRadius: 2 }}>
      <Card>
        <CardHeader
          title={
            <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
              Kho hàng sản phẩm theo danh mục
            </Typography>
          }
          action={
            <ButtonWithTooltip
              variant='contained'
              onClick={() => navigate('/inventory')}
              title='Quay lại'>
              <KeyboardBackspaceIcon />
            </ButtonWithTooltip>
          }
        />
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align='center'>STT</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell>Mã sản phẩm</TableCell>
                <TableCell align='center'>Ngày tạo</TableCell>
                <TableCell align='center'>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productList?.map((item, index) => (
                <TableRow
                  key={index}
                  sx={{
                    ':hover': { bgcolor: '#F1F1F1', cursor: 'pointer' },
                  }}
                  onClick={() => navigate(`/inventory/sku/${item._id}`)}>
                  <TableCell align='center'>{index + 1}</TableCell>
                  <TableCell sx={{ width: '30%' }}>
                    <Typography sx={{ ...truncateTextByLine(2) }}>
                      {item.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{item?.sku_name}</TableCell>
                  <TableCell align='center'>
                    {moment(item.createdAt).format('DD/MM/YYYY')}
                  </TableCell>
                  <TableCell align='center'>
                    <ButtonWithTooltip
                      variant='outlined'
                      title='Enter'
                      sx={{ color: '#696969' }}>
                      <KeyboardReturnIcon sx={{ fontSize: 20 }} />
                    </ButtonWithTooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {productList?.length === 0 && (
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

export default InventoryCategoryList;
