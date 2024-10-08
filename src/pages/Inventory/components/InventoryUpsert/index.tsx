import { ChangeEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Input from '@/components/Input';
import SuspenseLoader from '@/components/SuspenseLoader';

import { QueryKeys } from '@/constants/query-key';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';

import {
  useCreateInventory,
  useGetInventoryById,
  useUpdateInventory,
} from '@/services/inventory';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';

const InventoryUpsert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();

  const isEdit = !!id;

  const { data: InventoryData } = useGetInventoryById(id as string);

  const { mutate: createInventoryMutate, isPending: isCreatePending } =
    useCreateInventory();
  const { mutate: updateInventoryMutate, isPending: isUpdatePending } =
    useUpdateInventory();
  const formik = useFormik({
    initialValues: {
      name: '',
    },
    // validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      if (isEdit) {
        updateInventoryMutate(
          { _id: id, ...values },
          {
            onSuccess() {
              queryClient.invalidateQueries({
                queryKey: [QueryKeys.Inventory],
              });
              showNotification('Cập nhật danh mục thành công', 'success');
              navigate('/Inventory');
            },
          }
        );
      } else {
        createInventoryMutate(values, {
          onSuccess() {
            queryClient.invalidateQueries({ queryKey: [QueryKeys.Inventory] });
            showNotification('Tạo danh mục thành công', 'success');
            navigate('/Inventory');
          },
        });
      }
    },
  });

  useEffect(() => {
    if (InventoryData) {
      formik.setFieldValue('name', InventoryData?.name);
    }
  }, [InventoryData]);

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Typography variant='h5' sx={{ fontWeight: 600 }}>
            {isEdit ? 'Sửa danh mục' : 'Thêm danh mục'}
          </Typography>
        }
      />
      <Divider />

      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl>
          <Input
            id='name'
            label='Giá trị'
            name='name'
            variant='filled'
            required
            helperText={
              <Box component={'span'} sx={helperTextStyle}>
                {formik.errors.name}
              </Box>
            }
            value={formik?.values.name}
            onChange={handleChangeValue}
          />
        </FormControl>
        <Box sx={{ textAlign: 'end' }}>
          <Button onClick={() => navigate('/Inventory')} sx={{ mr: 2 }}>
            Trở lại
          </Button>
          <Button variant='contained' onClick={() => formik.handleSubmit()}>
            Thêm
          </Button>
        </Box>
      </CardContent>
      {(isCreatePending || isUpdatePending) && <SuspenseLoader />}
    </Card>
  );
};

export default InventoryUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
