import { useNavigate, useParams } from 'react-router-dom';

import { QueryKeys } from '@/constants/query-key';
import { useQueryClient } from '@tanstack/react-query';

import { AddCircleOutlined } from '@mui/icons-material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import ActionButton from '@/components/ActionButton';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import { useNotificationContext } from '@/contexts/NotificationContext';
import useConfirmModal from '@/hooks/useModalConfirm';
import { useDeleteCategory } from '@/services/category';
import { useGetProductBySlug } from '@/services/product';
import { useGetSkusByProductId } from '@/services/sku';
import { truncateTextByLine } from '@/utils/css-helper.util';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
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
import moment from 'moment';

const ProductSku = () => {
  const { slug } = useParams();
  // const numericId = slug ? Number(id) : undefined;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: product } = useGetProductBySlug(slug as string);
  const { data: skusData } = useGetSkusByProductId(product?.data?.id as number);
  const { showNotification } = useNotificationContext();

  const { confirmModal, showConfirmModal } = useConfirmModal();

  const { mutate: deleteCategoryMutate } = useDeleteCategory();

  const handleDeleteCategory = (id: number) => {
    deleteCategoryMutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Category] });
        showNotification('Xóa danh mục thành công', 'success');
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
              onClick={() => navigate(`/product/sku/create/${slug}`)}
              title='Thêm mã hàng'>
              <AddCircleOutlined />
            </ButtonWithTooltip>
          }
          title={
            <Typography
              sx={{ fontSize: 20, fontWeight: 500, ...truncateTextByLine(1) }}>
              Danh sách mã hàng: {product?.data?.name}
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
              {skusData?.data?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell align='center'>{index + 1}</TableCell>
                  <TableCell sx={{ width: '30%' }}>
                    <Typography sx={{ ...truncateTextByLine(2) }}>
                      {item.sku}
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
                    {moment(item.createdAt).format('DD/MM/YYYY')}
                  </TableCell>
                  <TableCell align='center'>
                    <ActionButton>
                      <Box mb={1}>
                        <ButtonWithTooltip
                          color='primary'
                          onClick={() =>
                            navigate(`/product/sku/update/${item?.sku}`)
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
                              // onOk: () => handleDeleteCategory(item?.sku),
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
      </Card>
      {confirmModal()}
    </Card>
  );
};

export default ProductSku;
