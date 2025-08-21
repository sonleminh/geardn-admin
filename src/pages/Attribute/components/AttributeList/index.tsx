import { FC, memo, useCallback, useMemo } from 'react';
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

import { useAlertContext } from '@/contexts/AlertContext';

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
import { IAttribute } from '@/interfaces/IAttribute';

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

const StatusDot: FC<{ isDeleted?: boolean }> = memo(({ isDeleted }) => (
  <Typography sx={{ fontSize: 14 }}>
    <CircleIcon
      sx={{ mr: 0.5, color: isDeleted ? '#ff0000' : '#00a35c', fontSize: 12 }}
    />
  </Typography>
));

type RowActionsProps = {
  item: IAttribute;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  onDeletePermanent: (id: number) => void;
};

const RowActions: FC<RowActionsProps> = memo(
  ({ item, onEdit, onDelete, onRestore, onDeletePermanent }) => (
    <ActionButton>
      <Box mb={1}>
        <ButtonWithTooltip
          color='primary'
          onClick={() => onEdit(item.id)}
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
            onClick={() => onDelete(item.id)}>
            <DeleteOutlineOutlinedIcon />
          </ButtonWithTooltip>
        </Box>
      )}
      {item?.isDeleted && (
        <Box mb={1}>
          <ButtonWithTooltip
            variant='outlined'
            title='Khôi phục'
            placement='left'
            onClick={() => onRestore(item.id)}>
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
            onClick={() => onDeletePermanent(item.id)}>
            <DeleteForeverOutlinedIcon />
          </ButtonWithTooltip>
        </Box>
      )}
    </ActionButton>
  )
);

const AttributeList: FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showAlert } = useAlertContext();
  const { confirmModal, showConfirmModal } = useConfirmModal();

  const { data, isLoading } = useGetAttributeList();
  const attributes = useMemo(() => data?.data ?? [], [data]);

  const { mutate: deleteAttributeMutate, isPending: isDeleting } =
    useDeleteAttribute();
  const { mutate: restoreAttributeMutate, isPending: isRestoring } =
    useRestoreAttribute();
  const {
    mutate: deleteAttributePermanentMutate,
    isPending: isDeletingPermanent,
  } = useDeleteAttributePermanent();

  const handleDeleteAttribute = useCallback(
    (id: number) => {
      deleteAttributeMutate(id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [QueryKeys.Attribute] });
          showAlert('Xóa thuộc tính thành công', 'success');
        },
      });
    },
    [deleteAttributeMutate, queryClient, showAlert]
  );

  const handleRestore = useCallback(
    (id: number) => {
      restoreAttributeMutate(id, {
        onSuccess() {
          queryClient.invalidateQueries({ queryKey: [QueryKeys.Attribute] });
          showAlert('Khôi phục thuộc tính thành công', 'success');
        },
      });
    },
    [restoreAttributeMutate, queryClient, showAlert]
  );

  const handleDeletePermanent = useCallback(
    (id: number) => {
      deleteAttributePermanentMutate(id, {
        onSuccess() {
          queryClient.invalidateQueries({ queryKey: [QueryKeys.Attribute] });
          showAlert('Xoá vĩnh viễn thuộc tính thành công', 'success');
        },
      });
    },
    [deleteAttributePermanentMutate, queryClient, showAlert]
  );

  const handleEdit = useCallback(
    (id: number) => {
      navigate(`update/${id}`);
    },
    [navigate]
  );

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
                attributes.map((item, index) => (
                  <TableRow key={item.id}>
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
                      {item?.createdAt
                        ? new Date(item.createdAt).toLocaleDateString('vi-VN')
                        : ''}
                    </TableCell>
                    <TableCell align='center'>
                      <StatusDot isDeleted={item?.isDeleted} />
                    </TableCell>
                    <TableCell align='center'>
                      <RowActions
                        item={item}
                        onEdit={handleEdit}
                        onDelete={(id) =>
                          showConfirmModal({
                            title: 'Xoá thuộc tính',
                            content:
                              'Bạn có chắc chắn muốn xoá thuộc tính này?',
                            onOk: () => handleDeleteAttribute(id),
                          })
                        }
                        onRestore={(id) =>
                          showConfirmModal({
                            title: 'Khôi phục thuộc tính',
                            content:
                              'Bạn có chắc chắn muốn khôi phục thuộc tính này?',
                            onOk: () => handleRestore(id),
                          })
                        }
                        onDeletePermanent={(id) =>
                          showConfirmModal({
                            title: 'Xoá vĩnh viễn thuộc tính',
                            content:
                              'Bạn có chắc chắn muốn xoá vĩnh viễn thuộc tính này?',
                            onOk: () => handleDeletePermanent(id),
                          })
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
        {confirmModal()}
        {(isDeleting || isRestoring || isDeletingPermanent) && (
          <SuspenseLoader />
        )}
      </Card>
    </>
  );
};

export default AttributeList;
