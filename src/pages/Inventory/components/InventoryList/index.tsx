import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

import { useGetCategoryList } from '@/services/category';
import { truncateTextByLine } from '@/utils/css-helper.util';
import useConfirmModal from '@/hooks/useModalConfirm';
import { IQuery } from '@/interfaces/IQuery';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';

const InventoryList = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState<IQuery>({
    limit: 2,
    page: 1,
  });

  const { data } = useGetCategoryList();

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
              Danh sách danh mục kho hàng
            </Typography>
          }
        />
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align='center'>STT</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell align='center'>Ngày tạo</TableCell>
                <TableCell align='center'>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.categories?.map((item, index) => (
                <TableRow
                  key={index}
                  sx={{ ':hover': { bgcolor: '#F1F1F1', cursor: 'pointer' } }}
                  onClick={() => navigate(`/inventory/category/${item._id}`)}>
                  <TableCell align='center'>{index + 1}</TableCell>
                  <TableCell sx={{ width: '30%' }}>
                    <Typography sx={{ ...truncateTextByLine(2) }}>
                      {item.name}
                    </Typography>
                  </TableCell>
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
          <Typography>Tổng cộng: {data?.total ?? 0}</Typography>
        </Box>
      </Card>
      {confirmModal()}
    </Card>
  );
};

export default InventoryList;
