import { useNavigate } from 'react-router-dom';
import moment from 'moment';

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
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { AddCircleOutlined } from '@mui/icons-material';

import { QueryKeys } from '@/constants/query-key';

import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import ActionButton from '@/components/ActionButton';

import { useNotificationContext } from '@/contexts/NotificationContext';

import useConfirmModal from '@/hooks/useModalConfirm';

import { truncateTextByLine } from '@/utils/css-helper.util';

import { useDeleteAttributeValue } from '@/services/attribute-value';
import { useGetAttributeList } from '@/services/attribute';

const AttributeList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // const [query, setQuery] = useState<IQuery>({
  //   limit: 10,
  //   page: 1,
  // });

  const { data } = useGetAttributeList();

  const { showNotification } = useNotificationContext();

  const { confirmModal, showConfirmModal } = useConfirmModal();

  const { mutate: deleteAttributeMutate } = useDeleteAttributeValue();

  const handleDeleteAttribute = (id: number) => {
    showNotification('Ok', 'error');
    deleteAttributeMutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Attribute] });
        showNotification('Xóa phân loại thành công', 'success');
      },
    });
  };

  // const handleChangeQuery = (object: Partial<IQuery>) => {
  //   setQuery((prev) => ({ ...prev, ...object }));
  // };

  return (
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
                <TableCell align='center'>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.data?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell align='center'>{index + 1}</TableCell>
                  <TableCell sx={{ width: '30%' }}>
                    <Typography sx={{ ...truncateTextByLine(2) }}>
                      {item.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: '30%' }}>
                    <Typography sx={{ ...truncateTextByLine(2) }}>
                      {item.label}
                    </Typography>
                  </TableCell>
                  <TableCell align='center'>
                    {moment(item?.createdAt).format('DD/MM/YYYY')}
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
                              title: 'Bạn có muốn xóa phân loại này không?',
                              cancelText: 'Hủy',
                              onOk: () => handleDeleteAttribute(item?.id),
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
        {/* <Box
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
        </Box> */}
      </Card>
      {confirmModal()}
    </Card>
  );
};

export default AttributeList;
