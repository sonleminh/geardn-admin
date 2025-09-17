import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import {
  Box,
  Breadcrumbs,
  Card,
  CardHeader,
  Divider,
  Link,
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
import CircleIcon from '@mui/icons-material/Circle';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

import { QueryKeys } from '@/constants/query-key';

import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import ActionButton from '@/components/ActionButton';
import { TableSkeleton } from '@/components/TableSkeleton';
import SuspenseLoader from '@/components/SuspenseLoader';

import { useAlertContext } from '@/contexts/AlertContext';

import useConfirmModal from '@/hooks/useModalConfirm';

import {
  useDeleteWarehouse,
  useDeleteWarehousePermanent,
  useGetWarehouseList,
  useRestoreWarehouse,
} from '@/services/warehouse';

import { truncateTextByLine } from '@/utils/css-helper.util';

import { TableColumn } from '@/interfaces/ITableColumn';
import { ROUTES } from '@/constants/route';

const columns: TableColumn[] = [
  { width: '60px', align: 'center', type: 'text' },
  { width: '200px', type: 'text' },
  { width: '300px', type: 'text' },
  { width: '150px', align: 'center', type: 'text' },
  { width: '100px', align: 'center', type: 'action' },
];

const WarehouseList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showAlert } = useAlertContext();
  const { confirmModal, showConfirmModal } = useConfirmModal();

  const { data, isLoading } = useGetWarehouseList();

  const { mutate: deleteWarehouseMutate, isPending: isDeleting } =
    useDeleteWarehouse();
  const { mutate: restoreWarehouseMutate, isPending: isRestoring } =
    useRestoreWarehouse();
  const {
    mutate: deleteWarehousePermanentMutate,
    isPending: isDeletingPermanent,
  } = useDeleteWarehousePermanent();

  const handleDelete = (id: number) => {
    deleteWarehouseMutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Warehouse] });
        showAlert('Xóa kho hàng thành công', 'success');
      },
    });
  };

  const handleRestore = (id: number) => {
    restoreWarehouseMutate(id, {
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Warehouse] });
        showAlert('Khôi phục kho hàng thành công', 'success');
      },
    });
  };

  const handleDeletePermanent = (id: number) => {
    deleteWarehousePermanentMutate(id, {
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Warehouse] });
        showAlert('Xoá vĩnh viễn kho hàng thành công', 'success');
      },
    });
  };

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
        <Typography color='text.primary'>Kho hàng</Typography>
      </Breadcrumbs>
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
                Danh sách kho hàng
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
                  <TableCell align='center'>Ngày tạo</TableCell>
                  <TableCell align='center'>Đã xóa</TableCell>
                  <TableCell align='center'>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton rowsPerPage={10} columns={columns} />
                ) : (
                  data?.data?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell align='center'>{index + 1}</TableCell>
                      <TableCell sx={{ width: '20%' }}>
                        <Typography sx={{ ...truncateTextByLine(2) }}>
                          {item.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: '40%' }}>
                        <Typography sx={{ ...truncateTextByLine(2) }}>
                          {item.address}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        {moment(item.createdAt).format('DD/MM/YYYY')}
                      </TableCell>
                      <TableCell align='center'>
                        <Typography
                          sx={{
                            fontSize: 14,
                          }}>
                          {item?.isDeleted ? (
                            <>
                              <CircleIcon
                                sx={{
                                  mr: 0.5,
                                  color: '#ff0000',
                                  fontSize: 12,
                                }}
                              />
                            </>
                          ) : (
                            <CircleIcon
                              sx={{
                                mr: 0.5,
                                color: '#00a35c',
                                fontSize: 12,
                              }}
                            />
                          )}
                        </Typography>
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
                          {!item?.isDeleted && (
                            <Box mb={1}>
                              <ButtonWithTooltip
                                color='error'
                                variant='outlined'
                                title='Xoá'
                                placement='left'
                                onClick={() =>
                                  showConfirmModal({
                                    title: 'Xoá kho hàng',
                                    content:
                                      'Bạn có chắc chắn muốn xoá kho hàng này?',
                                    onOk: () => handleDelete(item?.id),
                                  })
                                }>
                                <DeleteOutlineOutlinedIcon />
                              </ButtonWithTooltip>
                            </Box>
                          )}
                          {item?.isDeleted && (
                            <Box mb={item?.isDeleted ? 1 : 0}>
                              <ButtonWithTooltip
                                variant='outlined'
                                title='Khôi phục'
                                placement='left'
                                onClick={() =>
                                  showConfirmModal({
                                    title: 'Khôi phục kho hàng',
                                    content:
                                      'Bạn có chắc chắn muốn khôi phục kho hàng này?',
                                    onOk: () => handleRestore(item?.id),
                                  })
                                }>
                                <RestoreIcon />
                              </ButtonWithTooltip>
                            </Box>
                          )}
                          {item?.isDeleted && (
                            <Box>
                              <ButtonWithTooltip
                                color='error'
                                variant='outlined'
                                title='Xoá vĩnh viễn'
                                placement='left'
                                onClick={() =>
                                  showConfirmModal({
                                    title: 'Xoá vĩnh viễn kho hàng',
                                    content:
                                      'Bạn có chắc chắn muốn xoá vĩnh viễn kho hàng này?',
                                    onOk: () => handleDeletePermanent(item?.id),
                                  })
                                }>
                                <DeleteForeverOutlinedIcon />
                              </ButtonWithTooltip>
                            </Box>
                          )}
                        </ActionButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider />
        </Card>
        {confirmModal()}
        {(isDeleting || isRestoring || isDeletingPermanent) && (
          <SuspenseLoader />
        )}
      </Card>
    </>
  );
};

export default WarehouseList;
