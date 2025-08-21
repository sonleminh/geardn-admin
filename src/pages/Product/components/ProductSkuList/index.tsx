import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';

import { useQueryClient } from '@tanstack/react-query';

import { AddCircleOutlined } from '@mui/icons-material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

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

import { useAlertContext } from '@/contexts/AlertContext';

import useConfirmModal from '@/hooks/useModalConfirm';

import { useGetProductById } from '@/services/product';
import { useDeleteSku, useGetSkusByProductId } from '@/services/sku';

import { truncateTextByLine } from '@/utils/css-helper.util';

import ActionButton from '@/components/ActionButton';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';

const ProductSkuList = () => {
  const { id } = useParams();
  // const numericId = slug ? Number(id) : undefined;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: productData } = useGetProductById(id ? +id : 0);
  const { data: skusData } = useGetSkusByProductId(id ? +id : 0);
  const { showAlert } = useAlertContext();

  const { confirmModal, showConfirmModal } = useConfirmModal();

  const { mutate: deteleteSkuMutate } = useDeleteSku();

  const handleDeleteSku = (id: number) => {
    deteleteSkuMutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Sku] });
        showAlert('Xóa mã hàng thành công', 'success');
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
                <TableCell align='center'>Ngày tạo</TableCell>
                <TableCell align='center'>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {skusData?.data &&
              Array.isArray(skusData.data) &&
              skusData.data.length > 0 ? (
                skusData.data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell align='center'>{index + 1}</TableCell>
                    <TableCell sx={{ width: '30%' }}>
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
                    <TableCell align='center'>
                      {moment(item?.createdAt).format('DD/MM/YYYY')}
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
                        <Box>
                          <ButtonWithTooltip
                            color='error'
                            onClick={() => {
                              showConfirmModal({
                                title: 'Bạn có muốn xóa mã hàng này không?',
                                cancelText: 'Hủy',
                                onOk: () => handleDeleteSku(item?.id),
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
