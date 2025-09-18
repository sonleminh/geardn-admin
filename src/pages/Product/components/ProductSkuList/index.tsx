import { FC, memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { AxiosError } from 'axios';
import { ErrorResponse } from '@/interfaces/IError';

import { useQueryClient } from '@tanstack/react-query';

import { AddCircleOutlined } from '@mui/icons-material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CircleIcon from '@mui/icons-material/Circle';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';

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

import { QueryKeys } from '@/constants/query-key';
import { ROUTES } from '@/constants/route';

import { TableColumn } from '@/interfaces/ITableColumn';

import { useAlertContext } from '@/contexts/AlertContext';

import useConfirmModal from '@/hooks/useModalConfirm';

import { useGetProductById } from '@/services/product';
import {
  useDeleteSku,
  useDeleteSkuPermanent,
  useGetSkusByProductId,
  useRestoreSku,
} from '@/services/sku';

import { truncateTextByLine } from '@/utils/css-helper.util';
import { formatPrice } from '@/utils/format-price';

import ActionButton from '@/components/ActionButton';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import { TableSkeleton } from '@/components/TableSkeleton';

const columns: TableColumn[] = [
  { width: '50px', align: 'center' },
  { width: '100px', align: 'center' },
  { width: '50px', align: 'center' },
  { width: '150px', align: 'center' },
  { width: '100px', align: 'center' },
  { width: '100px', align: 'center' },
  { width: '100px', align: 'center' },
  { width: '100px', align: 'center' },
];

const StatusDot: FC<{ isDeleted?: boolean }> = memo(({ isDeleted }) => (
  <Typography sx={{ fontSize: 14 }}>
    <CircleIcon
      sx={{ mr: 0.5, color: isDeleted ? '#ff0000' : '#00a35c', fontSize: 12 }}
    />
  </Typography>
));

const ProductSkuList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showAlert } = useAlertContext();
  const { confirmModal, showConfirmModal } = useConfirmModal();

  const { data: productData } = useGetProductById(id ? +id : 0);
  const { data: skusData, isLoading: isLoadingSkus } = useGetSkusByProductId({
    id: id ? +id : 0,
    state: 'all',
  });

  const { mutate: deleteSkuMutate } = useDeleteSku();
  const { mutate: restoreSkuMutate } = useRestoreSku();
  const { mutate: deleteSkuPermanentMutate } = useDeleteSkuPermanent();

  const handleDelete = (id: number) => {
    deleteSkuMutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Sku] });
        showAlert('Xóa mã hàng thành công', 'success');
      },
      onError(error: Error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        showAlert(axiosError?.response?.data?.message ?? 'Lỗi', 'error');
      },
    });
  };

  const handleRestore = (id: number) => {
    restoreSkuMutate(id, {
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Sku] });
        showAlert('Khôi phục mã hàng thành công', 'success');
      },
      onError(error: Error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        showAlert(axiosError?.response?.data?.message ?? 'Lỗi', 'error');
      },
    });
  };

  const handleDeletePermanent = (id: number) => {
    deleteSkuPermanentMutate(id, {
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Sku] });
        showAlert('Xoá vĩnh viễn mã hàng thành công', 'success');
      },
      onError(error: Error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        showAlert(axiosError?.response?.data?.message ?? 'Lỗi', 'error');
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
        <Link
          underline='hover'
          color='inherit'
          onClick={() => navigate(ROUTES.PRODUCT)}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          Sản phẩm
        </Link>
        <Typography color='text.primary'>Danh sách mã hàng</Typography>
      </Breadcrumbs>
      <Card>
        <CardHeader
          action={
            <ButtonWithTooltip
              variant='contained'
              onClick={() => navigate(`/product/${id}/sku/create`)}
              title='Thêm mã hàng'>
              <AddCircleOutlined />
            </ButtonWithTooltip>
          }
          title={
            <Typography
              sx={{ fontSize: 20, fontWeight: 500, ...truncateTextByLine(1) }}>
              Danh sách mã hàng: {productData?.data?.name}
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
                <TableCell align='center'>Phân loại</TableCell>
                <TableCell align='center'>Giá bán</TableCell>
                <TableCell align='center'>Ngày tạo</TableCell>
                <TableCell align='center'>Đã xóa</TableCell>
                <TableCell align='center'>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingSkus ? (
                <TableSkeleton rowsPerPage={5} columns={columns} />
              ) : skusData?.data &&
                Array.isArray(skusData.data) &&
                skusData.data.length > 0 ? (
                skusData.data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell align='center'>{index + 1}</TableCell>
                    <TableCell sx={{}}>
                      <Typography sx={{ ...truncateTextByLine(2) }}>
                        {item?.sku}
                      </Typography>
                    </TableCell>
                    <TableCell align='center'>
                      {item?.imageUrl ? (
                        <Box
                          sx={{
                            height: 40,
                            '.thumbnail': {
                              width: 40,
                              height: 40,
                              objectFit: 'contain',
                            },
                          }}>
                          <img src={item?.imageUrl} className='thumbnail' />
                        </Box>
                      ) : (
                        'Không có'
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        {item?.productSkuAttributes?.length
                          ? item?.productSkuAttributes?.map(
                              (item, prdSkuAttrIndex) => (
                                <Typography
                                  key={prdSkuAttrIndex}
                                  sx={{ fontSize: 14 }}>
                                  {item?.attributeValue?.attribute?.label}:{' '}
                                  {item?.attributeValue?.value}
                                </Typography>
                              )
                            )
                          : 'Không có'}
                      </Box>
                    </TableCell>
                    <TableCell align='center'>
                      {formatPrice(item?.sellingPrice)}
                    </TableCell>
                    <TableCell align='center'>
                      {moment(item?.createdAt).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell align='center'>
                      <StatusDot isDeleted={item?.isDeleted} />
                    </TableCell>
                    <TableCell align='center'>
                      <ActionButton>
                        <Box mb={1}>
                          <ButtonWithTooltip
                            color='primary'
                            onClick={() => navigate(`/product/sku/${item?.id}`)}
                            variant='outlined'
                            title='Xem chi tiết'
                            placement='left'>
                            <InfoOutlinedIcon />
                          </ButtonWithTooltip>
                        </Box>
                        <Box mb={1}>
                          <ButtonWithTooltip
                            color='primary'
                            onClick={() =>
                              navigate(`/product/sku/update/${item?.id}`)
                            }
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
                                  title: 'Xoá mã hàng',
                                  content:
                                    'Bạn có chắc chắn muốn xoá mã hàng này?',
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
                                  title: 'Khôi phục mã hàng',
                                  content:
                                    'Bạn có chắc chắn muốn khôi phục mã hàng này?',
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
                                  title: 'Xoá vĩnh viễn mã hàng',
                                  content:
                                    'Bạn có chắc chắn muốn xoá vĩnh viễn mã hàng này?',
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
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align='center'>
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
      </Card>
      {confirmModal()}
    </>
  );
};

export default ProductSkuList;
