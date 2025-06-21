import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

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
import { AddCircleOutlined } from '@mui/icons-material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import RestoreIcon from '@mui/icons-material/Restore';
import CircleIcon from '@mui/icons-material/Circle';

import { useNotificationContext } from '@/contexts/NotificationContext';

import { QueryKeys } from '@/constants/query-key';

import useConfirmModal from '@/hooks/useModalConfirm';

import {
  useDeleteCategory,
  useDeleteCategoryPermanent,
  useGetCategoryList,
  useRestoreCategory,
} from '@/services/category';

import { truncateTextByLine } from '@/utils/css-helper.util';

import { IQuery } from '@/interfaces/IQuery';
import { TableColumn } from '@/interfaces/ITableColumn';

import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import ActionButton from '@/components/ActionButton';
import { TableSkeleton } from '@/components/TableSkeleton';
import SuspenseLoader from '@/components/SuspenseLoader';

const columns: TableColumn[] = [
  { width: '60px', align: 'center', type: 'text' },
  { width: '350px', type: 'text' },
  { width: '100px', align: 'center', type: 'image' },
  { width: '150px', align: 'center', type: 'text' },
  { width: '100px', align: 'center', type: 'text' },
  { width: '100px', align: 'center', type: 'action' },
];

const CategoryList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showNotification } = useNotificationContext();
  const { confirmModal, showConfirmModal } = useConfirmModal();

  const { data, isLoading } = useGetCategoryList();

  const { mutate: deleteCategoryMutate, isPending: isDeleting } =
    useDeleteCategory();
  const { mutate: restoreCategoryMutate, isPending: isRestoring } =
    useRestoreCategory();
  const {
    mutate: deleteCategoryPermanentMutate,
    isPending: isDeletingPermanent,
  } = useDeleteCategoryPermanent();

  const handleDeleteCategory = (id: number) => {
    deleteCategoryMutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Category] });
        showNotification('Xóa danh mục thành công', 'success');
      },
    });
  };

  const handleRestore = (id: number) => {
    restoreCategoryMutate(id, {
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Category] });
        showNotification('Khôi phục sản phẩm thành công', 'success');
      },
    });
  };

  const handleDeletePermanent = (id: number) => {
    deleteCategoryPermanentMutate(id, {
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Category] });
        showNotification('Xoá vĩnh viễn sản phẩm thành công', 'success');
      },
    });
  };

  return (
    <Card sx={{ borderRadius: 2 }}>
      <Card>
        <CardHeader
          action={
            <ButtonWithTooltip
              variant='contained'
              onClick={() => navigate('create')}
              title='Thêm danh mục'>
              <AddCircleOutlined />
            </ButtonWithTooltip>
          }
          title={
            <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
              Danh sách danh mục
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
                <TableCell align='center'>Ảnh</TableCell>
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
                    <TableCell sx={{ width: '30%' }}>
                      <Typography sx={{ ...truncateTextByLine(2) }}>
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Box
                        sx={{
                          height: 40,
                          '.thumbnail': {
                            width: 40,
                            height: 40,
                            objectFit: 'contain',
                          },
                        }}>
                        <img src={item?.icon} className='thumbnail' />
                      </Box>
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
                                  title: 'Xoá danh mục',
                                  content:
                                    'Bạn có chắc chắn muốn xoá danh mục này?',
                                  onOk: () => handleDeleteCategory(item?.id),
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
                                  title: 'Khôi phục danh mục',
                                  content:
                                    'Bạn có chắc chắn muốn khôi phục danh mục này?',
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
                                  title: 'Xoá vĩnh viễn danh mục',
                                  content:
                                    'Bạn có chắc chắn muốn xoá vĩnh viễn danh mục này?',
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
      {(isDeleting || isRestoring || isDeletingPermanent) && <SuspenseLoader />}
    </Card>
  );
};

export default CategoryList;
