import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import { useDeleteProduct, useGetProductList } from '@/services/product';
import { QueryKeys } from '@/constants/query-key';

import { AddCircleOutlined, Edit, Delete } from '@mui/icons-material';

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
import useConfirmModal from '@/hooks/useModalConfirm';
import { truncateTextByLine } from '@/utils/css-helper.util';
import moment from 'moment';
import { IQuery } from '@/interfaces/IQuery';
import { useNotificationContext } from '@/contexts/NotificationContext';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import ActionButton from '@/components/ActionButton';
import { ITagOptions } from '@/interfaces/IProduct';
import { getBgColor } from '@/utils/getTagBgColor';

const ProductList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [query, setQuery] = useState<IQuery>({
    limit: 10,
    page: 1,
  });

  const { data } = useGetProductList({ ...query });

  const { showNotification } = useNotificationContext();

  const { confirmModal, showConfirmModal } = useConfirmModal();

  const { mutate: deleteProductMutate } = useDeleteProduct();

  const handleChangeQuery = (object: Partial<IQuery>) => {
    setQuery((prev) => ({ ...prev, ...object }));
  };

  const handleDeleteProduct = (id: string) => {
    showNotification('Ok', 'error');
    deleteProductMutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Product] });
        showNotification('Xóa sản phẩm thành công', 'success');
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
              title='Thêm gói cước'>
              <AddCircleOutlined />
            </ButtonWithTooltip>
          }
          title={
            <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
              Danh sách sản phẩm
            </Typography>
          }
        />
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align='center'>STT</TableCell>
                <TableCell align='center'>Tên</TableCell>
                <TableCell align='center'>Danh mục</TableCell>
                <TableCell align='center'>Ảnh</TableCell>
                <TableCell align='center'>Tags</TableCell>
                <TableCell align='center'>Ngày tạo</TableCell>
                <TableCell align='center'>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.productList?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell align='center'>{index + 1}</TableCell>
                  <TableCell sx={{ width: '20%' }}>
                    <Typography sx={{ ...truncateTextByLine(2) }}>
                      {item.name}
                    </Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography sx={{ ...truncateTextByLine(2) }}>
                      {item?.category?.label}
                    </Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Box
                      sx={{
                        '.thumbnail': {
                          width: 100,
                          height: 100,
                          objectFit: 'contain',
                        },
                      }}>
                      <img
                        src={item?.images?.[0] ?? ''}
                        className='thumbnail'
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    {item?.tags?.map((tag: ITagOptions) => (
                      <Box
                        key={tag.value}
                        sx={{
                          padding: '4px 2px',
                          my: 1,
                          bgcolor: getBgColor(tag.value),
                          color: '#fff',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          textAlign: 'center',
                          fontSize: 13,
                        }}>
                        {tag.label}
                      </Box>
                    ))}
                  </TableCell>
                  <TableCell align='center'>
                    {moment(item.createdAt).format('DD/MM/YYYY')}
                  </TableCell>
                  <TableCell align='center'>
                    <ActionButton>
                      <Box mb={1}>
                        <ButtonWithTooltip
                          color='primary'
                          onClick={() => navigate(`update/${item?._id}`)}
                          variant='outlined'
                          title='Chỉnh sửa'
                          placement='left'>
                          <Edit />
                        </ButtonWithTooltip>
                      </Box>
                      <Box>
                        <ButtonWithTooltip
                          color='error'
                          onClick={() => {
                            showConfirmModal({
                              title: 'Bạn có muốn xóa sản phẩm này không?',
                              cancelText: 'Hủy',
                              onOk: () => handleDeleteProduct(item?._id),
                              okText: 'Xóa',
                            });
                          }}
                          variant='outlined'
                          title='Xoá'
                          placement='left'>
                          <Delete />
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

export default ProductList;
