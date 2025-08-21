import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/constants/query-key';

import { AddCircleOutlined } from '@mui/icons-material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

import {
  Box,
  Breadcrumbs,
  Card,
  CardHeader,
  Divider,
  Link,
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
import { useAlertContext } from '@/contexts/AlertContext';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import ActionButton from '@/components/ActionButton';
import { useDeletePayment, useGetPaymentList } from '@/services/payment';
import { IQuery } from '@/interfaces/IQuery';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { ROUTES } from '@/constants/route';

const PaymentList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [query, setQuery] = useState<IQuery>({
    limit: 10,
    page: 1,
  });

  const { data } = useGetPaymentList();

  const { showAlert } = useAlertContext();

  const { confirmModal, showConfirmModal } = useConfirmModal();

  const { mutate: deletePaymentMutate } = useDeletePayment();

  const handleDeletePayment = (id: number) => {
    showAlert('Ok', 'error');
    deletePaymentMutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Payment] });
        showAlert('Xóa hình thức thanh toán thành công', 'success');
      },
    });
  };

  const handleChangeQuery = (object: Partial<IQuery>) => {
    setQuery((prev) => ({ ...prev, ...object }));
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
        <Typography color='text.primary'>Phương thức thanh toán</Typography>
      </Breadcrumbs>
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
                Danh sách phương thức thanh toán
              </Typography>
            }
          />
          <Divider />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align='center'>STT</TableCell>
                  <TableCell align='center'>Key</TableCell>
                  <TableCell>Tên</TableCell>
                  <TableCell align='center'>Ảnh</TableCell>
                  <TableCell align='center'>Ngày tạo</TableCell>
                  <TableCell align='center'>Vô hiệu hoá</TableCell>
                  <TableCell align='center'>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell align='center'>{index + 1}</TableCell>
                    <TableCell align='center'>{item?.key}</TableCell>
                    <TableCell sx={{ width: '30%' }}>
                      <Typography sx={{ ...truncateTextByLine(2) }}>
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell
                      padding='none'
                      align='center'
                      sx={{ width: 48, height: 48 }}>
                      <Box
                        sx={{
                          height: 48,
                          '.thumbnail': {
                            width: 48,
                            height: 48,
                            objectFit: 'contain',
                          },
                        }}>
                        <img
                          src={item.image}
                          className='thumbnail'
                          style={{ width: 48, height: 48 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align='center'>
                      {moment(item.createdAt).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell align='center'>
                      {item?.isDisabled ? 'Có' : 'Không'}
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
                        <Box>
                          <ButtonWithTooltip
                            color='error'
                            onClick={() => {
                              showConfirmModal({
                                title:
                                  'Bạn có muốn xóa hình thức thanh toán này không?',
                                cancelText: 'Hủy',
                                onOk: () => handleDeletePayment(item?.id),
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
            {/* <Typography>Tổng cộng: {data?.total ?? 0}</Typography> */}
            <Pagination
              // count={Math.ceil((data?.total ?? 0) / query.limit!)}
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
    </>
  );
};

export default PaymentList;
