import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import {
  Box,
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
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

import { useGetProductByCateId } from '@/services/product';
import { truncateTextByLine } from '@/utils/css-helper.util';
import useConfirmModal from '@/hooks/useModalConfirm';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import { IQuery } from '@/interfaces/IQuery';
import { useState } from 'react';

const InventoryCategoryList = () => {
  const { id } = useParams();
  // const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [query, setQuery] = useState<IQuery>({
    limit: 2,
    page: 1,
  });

  const { data: productList } = useGetProductByCateId(id ?? '', query);

  // const { showNotification } = useNotificationContext();

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
              {productList?.data?.map((item, index) => (
                <TableRow
                  key={index}
                  sx={{
                    ':hover': { bgcolor: '#F1F1F1', cursor: 'pointer' },
                  }}
                  onClick={() => navigate(`/inventory/model/${item._id}`)}>
                  <TableCell align='center'>
                    {query?.page === 1
                      ? index + 1
                      : index + 1 + (query?.page ?? 1)}
                  </TableCell>
                  <TableCell sx={{ width: '30%' }}>
                    <Typography sx={{ ...truncateTextByLine(2) }}>
                      {item.name}
                    </Typography>
                  </TableCell>
                  <TableCell>cc</TableCell>
                  {/* <TableCell>{item?.sku_name}</TableCell> */}
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
          {productList?.data?.length === 0 && (
            <Box sx={{ my: 2, textAlign: 'center', color: '#696969' }}>
              Empty
            </Box>
          )}
        </TableContainer>
        <Divider />
        <Box
          p={2}
          sx={{
            ['.MuiPagination-ul']: {
              justifyContent: 'center',
            },
            textAlign: 'right',
          }}>
          <Typography>Tổng cộng: {productList?.total ?? 0}</Typography>
          <Pagination
            count={Math.ceil((productList?.total ?? 0) / query.limit!)}
            page={query.page ?? 0}
            onChange={(_: React.ChangeEvent<unknown>, newPage) => {
              handleChangeQuery({ page: newPage });
            }}
            defaultPage={query.page ?? 1}
            showFirstButton
            showLastButton
          />
        </Box>
      </Card>
      {confirmModal()}
    </Card>
  );
};

export default InventoryCategoryList;
