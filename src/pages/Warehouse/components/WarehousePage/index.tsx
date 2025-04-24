import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
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
import { AddCircleOutlined } from '@mui/icons-material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreIcon from '@mui/icons-material/Restore';
import moment from 'moment';

import { QueryKeys } from '@/constants/query-key';

import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import ActionButton from '@/components/ActionButton';

import { useNotificationContext } from '@/contexts/NotificationContext';

import useConfirmModal from '@/hooks/useModalConfirm';

import { IQuery } from '@/interfaces/IQuery';

import {
  useDeleteWarehouse,
  useGetWarehouseList,
  useRestoreWarehouse,
} from '@/services/warehouse';

import { truncateTextByLine } from '@/utils/css-helper.util';

const WarehousePage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [query, setQuery] = useState<IQuery>({
    limit: 10,
    page: 1,
  });

  const { data } = useGetWarehouseList();

  const { showNotification } = useNotificationContext();

  const { confirmModal, showConfirmModal } = useConfirmModal();

  const { mutate: deleteWarehouseMutate } = useDeleteWarehouse();
  const { mutate: restoreWarehouseMutate } = useRestoreWarehouse();

  const handleDeleteWarehouse = (id: number) => {
    deleteWarehouseMutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Warehouse] });
        showNotification('Xóa kho hàng thành công', 'success');
      },
    });
  };

  const handleRestoreWarehouse = (id: number) => {
    restoreWarehouseMutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Warehouse] });
        showNotification('Khôi phục kho hàng thành công', 'success');
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
          action={
            <ButtonWithTooltip
              variant='contained'
              onClick={() => navigate('create')}
              title='Thêm kho hàng'>
              <AddCircleOutlined />
            </ButtonWithTooltip>
          }
          title={
            <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
              Danh sách các kho hàng
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
                <TableCell>Địa chỉ</TableCell>
                <TableCell align='center'>Đang hoạt động</TableCell>
                <TableCell align='center'>Ngày tạo</TableCell>
                <TableCell align='center'>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.data?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell align='center'>{index + 1}</TableCell>
                  <TableCell sx={{ width: '10%' }}>
                    <Typography sx={{ ...truncateTextByLine(2) }}>
                      {item?.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: '40%' }}>
                    <Typography sx={{ ...truncateTextByLine(2) }}>
                      {item?.address}
                    </Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography>{!item?.isDeleted ? 'Có' : 'Không'}</Typography>
                  </TableCell>
                  <TableCell align='center'>
                    {moment(item.createdAt).format('DD/MM/YYYY')}
                  </TableCell>
                  <TableCell align='center'>
                    <ActionButton>
                      <Box mb={1}>
                        <ButtonWithTooltip
                          color='primary'
                          onClick={() => navigate(`update/${item?.id}`)}
                          variant='outlined'
                          title='Chỉnh sửa'
                          placement='left'>
                          <EditOutlinedIcon />
                        </ButtonWithTooltip>
                      </Box>
                      <Box mb={1}>
                        <ButtonWithTooltip
                          color='error'
                          onClick={() => {
                            showConfirmModal({
                              title: 'Bạn có muốn xóa kho hàng này không?',
                              cancelText: 'Hủy',
                              onOk: () => handleDeleteWarehouse(item?.id),
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
                      <Box>
                        <ButtonWithTooltip
                          color='info'
                          onClick={() => {
                            showConfirmModal({
                              title:
                                'Bạn có muốn khôi phục kho hàng này không?',
                              cancelText: 'Hủy',
                              onOk: () => handleRestoreWarehouse(item?.id),
                              okText: 'Đồng ý',
                              btnOkColor: 'error',
                            });
                          }}
                          variant='outlined'
                          title='Khôi phục'
                          placement='left'>
                          <RestoreIcon />
                        </ButtonWithTooltip>
                      </Box>
                    </ActionButton>
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
        </Box>
      </Card>
      {confirmModal()}
    </Card>
  );
};

export default WarehousePage;
