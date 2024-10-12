import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { QueryKeys } from '@/constants/query-key';
import { useDeleteProduct, useGetProductList } from '@/services/product';
import { useQueryClient } from '@tanstack/react-query';

import { AddCircleOutlined } from '@mui/icons-material';

import ActionButton from '@/components/ActionButton';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import { useNotificationContext } from '@/contexts/NotificationContext';
import useConfirmModal from '@/hooks/useModalConfirm';
import { ITagOptions } from '@/interfaces/IProduct';
import { IQuery } from '@/interfaces/IQuery';
import { truncateTextByLine } from '@/utils/css-helper.util';
import { getBgColor } from '@/utils/getTagBgColor';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
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
import moment from 'moment';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ExcelUpload from '@/components/ExcelUpload';

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
            <Box>
              {/* <ButtonWithTooltip
                variant='outlined'
                onClick={() => navigate('create')}
                title='Nhập Excel'
                sx={{ mr: 2 }}>
                <UploadFileIcon sx={{ mr: 1 }} /> Excel
              </ButtonWithTooltip> */}
              <ExcelUpload />
              <ButtonWithTooltip
                sx={{ ml: 2 }}
                variant='contained'
                onClick={() => navigate('create')}
                title='Thêm gói cước'>
                <AddCircleOutlined />
              </ButtonWithTooltip>
            </Box>
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
                      {item?.category?.name}
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
                          <EditOutlinedIcon />
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
