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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import RestoreIcon from '@mui/icons-material/Restore';
import CircleIcon from '@mui/icons-material/Circle';

import { useNotificationContext } from '@/contexts/NotificationContext';

import { QueryKeys } from '@/constants/query-key';

import useConfirmModal from '@/hooks/useModalConfirm';

import {
  useDeleteAttribute,
  useDeleteAttributePermanent,
  useGetAttributeList,
  useRestoreAttribute,
} from '@/services/attribute';

import { truncateTextByLine } from '@/utils/css-helper.util';

import { TableColumn } from '@/interfaces/ITableColumn';

import { ROUTES } from '@/constants/route';

import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import ActionButton from '@/components/ActionButton';
import { TableSkeleton } from '@/components/TableSkeleton';
import SuspenseLoader from '@/components/SuspenseLoader';

const columns: TableColumn[] = [
  { width: '60px', align: 'center', type: 'text' },
  { width: '150px', type: 'text' },
  { width: '150px', type: 'text' },
  { width: '150px', align: 'center', type: 'text' },
  { width: '100px', align: 'center', type: 'text' },
  { width: '100px', align: 'center', type: 'action' },
];

const AttributeList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showNotification } = useNotificationContext();
  const { confirmModal, showConfirmModal } = useConfirmModal();

  const { data, isLoading } = useGetAttributeList();

  const { mutate: deleteAttributeMutate, isPending: isDeleting } =
    useDeleteAttribute();
  const { mutate: restoreAttributeMutate, isPending: isRestoring } =
    useRestoreAttribute();
  const {
    mutate: deleteAttributePermanentMutate,
    isPending: isDeletingPermanent,
  } = useDeleteAttributePermanent();

  const handleDeleteAttribute = (id: number) => {
    deleteAttributeMutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Attribute] });
        showNotification('Xóa thuộc tính thành công', 'success');
      },
    });
  };

  const handleRestore = (id: number) => {
    restoreAttributeMutate(id, {
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Attribute] });
        showNotification('Khôi phục thuộc tính thành công', 'success');
      },
    });
  };

  const handleDeletePermanent = (id: number) => {
    deleteAttributePermanentMutate(id, {
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Attribute] });
        showNotification('Xoá vĩnh viễn thuộc tính thành công', 'success');
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
        <Typography color='text.primary'>Loại thuộc tính</Typography>
      </Breadcrumbs>
      <Card sx={{ borderRadius: 2 }}>
        <Card>
          <CardHeader
            action={
              <ButtonWithTooltip
                variant='contained'
                onClick={() => navigate('create')}
                title='Thêm loại thuộc tính'>
                <AddCircleOutlined />
              </ButtonWithTooltip>
            }
            title={
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                Danh sách loại thuộc tính
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
                  <TableCell>Nhãn</TableCell>
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
                      <TableCell sx={{ width: '25%' }}>
                        <Typography sx={{ ...truncateTextByLine(2) }}>
                          {item.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: '25%' }}>
                        <Typography sx={{ ...truncateTextByLine(2) }}>
                          {item.label}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        {moment(item?.createdAt).format('DD/MM/YYYY')}
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
                                    title: 'Xoá thuộc tính',
                                    content:
                                      'Bạn có chắc chắn muốn xoá thuộc tính này?',
                                    onOk: () => handleDeleteAttribute(item?.id),
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
                                    title: 'Khôi phục thuộc tính',
                                    content:
                                      'Bạn có chắc chắn muốn khôi phục thuộc tính này?',
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
                                    title: 'Xoá vĩnh viễn thuộc tính',
                                    content:
                                      'Bạn có chắc chắn muốn xoá vĩnh viễn thuộc tính này?',
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

export default AttributeList;
