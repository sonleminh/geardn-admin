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

import { useAlertContext } from '@/contexts/AlertContext';

import { QueryKeys } from '@/constants/query-key';

import useConfirmModal from '@/hooks/useModalConfirm';

import {
  useDeleteAttributeValue,
  useDeleteAttributeValuePermanent,
  useGetAttributeValueList,
  useRestoreAttributeValue,
} from '@/services/attribute-value';

import { truncateTextByLine } from '@/utils/css-helper.util';

import { TableColumn } from '@/interfaces/ITableColumn';

import { ROUTES } from '@/constants/route';

import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import ActionButton from '@/components/ActionButton';
import { TableSkeleton } from '@/components/TableSkeleton';
import SuspenseLoader from '@/components/SuspenseLoader';

const columns: TableColumn[] = [
  { width: '60px', align: 'center', type: 'text' },
  { width: '200px', type: 'text' },
  { width: '200px', type: 'text' },
  { width: '150px', align: 'center', type: 'text' },
  { width: '100px', align: 'center', type: 'text' },
  { width: '100px', align: 'center', type: 'action' },
];

const AttributeValueList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showAlert } = useAlertContext();
  const { confirmModal, showConfirmModal } = useConfirmModal();

  const { data, isLoading } = useGetAttributeValueList();

  const { mutate: deleteAttributeValueMutate, isPending: isDeleting } =
    useDeleteAttributeValue();
  const { mutate: restoreAttributeValueMutate, isPending: isRestoring } =
    useRestoreAttributeValue();
  const {
    mutate: deleteAttributeValuePermanentMutate,
    isPending: isDeletingPermanent,
  } = useDeleteAttributeValuePermanent();

  const handleDeleteAttributeValue = (id: number) => {
    deleteAttributeValueMutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.AttributeValue] });
        showAlert('Xóa giá trị thuộc tính thành công', 'success');
      },
    });
  };

  const handleRestore = (id: number) => {
    restoreAttributeValueMutate(id, {
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.AttributeValue] });
        showAlert('Khôi phục giá trị thuộc tính thành công', 'success');
      },
    });
  };

  const handleDeletePermanent = (id: number) => {
    deleteAttributeValuePermanentMutate(id, {
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.AttributeValue] });
        showAlert('Xoá vĩnh viễn giá trị thuộc tính thành công', 'success');
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
        <Typography color='text.primary'>Giá trị thuộc tính</Typography>
      </Breadcrumbs>
      <Card sx={{ borderRadius: 2 }}>
        <Card>
          <CardHeader
            action={
              <ButtonWithTooltip
                variant='contained'
                onClick={() => navigate('create')}
                title='Thêm giá trị thuộc tính'>
                <AddCircleOutlined />
              </ButtonWithTooltip>
            }
            title={
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                Danh sách giá trị thuộc tính
              </Typography>
            }
          />
          <Divider />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align='center'>STT</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Giá trị</TableCell>
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
                          {item?.attribute?.label}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: '25%' }}>
                        <Typography sx={{ ...truncateTextByLine(2) }}>
                          {item.value}
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
                                    title: 'Xoá giá trị thuộc tính',
                                    content:
                                      'Bạn có chắc chắn muốn xoá giá trị thuộc tính này?',
                                    onOk: () =>
                                      handleDeleteAttributeValue(item?.id),
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
                                    title: 'Khôi phục giá trị thuộc tính',
                                    content:
                                      'Bạn có chắc chắn muốn khôi phục giá trị thuộc tính này?',
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
                                    title: 'Xoá vĩnh viễn giá trị thuộc tính',
                                    content:
                                      'Bạn có chắc chắn muốn xoá vĩnh viễn giá trị thuộc tính này?',
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

export default AttributeValueList;
