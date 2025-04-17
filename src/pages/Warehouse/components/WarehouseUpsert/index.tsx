import { ChangeEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Input from '@/components/Input';
import SuspenseLoader from '@/components/SuspenseLoader';

import { QueryKeys } from '@/constants/query-key';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';

import { ROUTES } from '@/constants/route';
import {
  useCreateWarehouse,
  useGetWarehouseById,
  useUpdateWarehouse,
} from '@/services/warehouse';
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
import { createSchema, updateSchema } from '../utils/schema/warehouseSchema';

const WarehouseUpsert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();

  const isEdit = !!id;

  const numericId = id ? Number(id) : undefined;

  const { data: warehouseData } = useGetWarehouseById(numericId as number);

  const { mutate: createWarehouseMutate, isPending: isCreatePending } =
    useCreateWarehouse();
  const { mutate: updateWarehouseMutate, isPending: isUpdatePending } =
    useUpdateWarehouse();
  const formik = useFormik({
    initialValues: {
      name: '',
      address: '',
    },
    validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      if (isEdit) {
        updateWarehouseMutate(
          { id: +id, ...values },
          {
            onSuccess() {
              queryClient.invalidateQueries({
                queryKey: [QueryKeys.Warehouse],
              });
              showNotification('Cập nhật kho hàng thành công', 'success');
              navigate(ROUTES.WAREHOUSE);
            },
          }
        );
      } else {
        createWarehouseMutate(values, {
          onSuccess() {
            queryClient.invalidateQueries({ queryKey: [QueryKeys.Warehouse] });
            showNotification('Tạo kho hàng thành công', 'success');
            navigate(ROUTES.WAREHOUSE);
          },
        });
      }
    },
  });

  useEffect(() => {
    if (warehouseData) {
      formik.setFieldValue('name', warehouseData?.name);
      formik.setFieldValue('address', warehouseData?.address);
    }
  }, [warehouseData]);

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
            {isEdit ? 'Sửa kho hàng' : 'Thêm kho hàng'}
          </Typography>
        }
      />
      <Divider />

      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl>
          <Input
            id='name'
            label='Tên kho hàng'
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
        <FormControl>
          <Input
            id='address'
            label='Địa chỉ'
            name='address'
            variant='filled'
            required
            helperText={
              <Box component={'span'} sx={helperTextStyle}>
                {formik.errors.address}
              </Box>
            }
            value={formik?.values.address}
            onChange={handleChangeValue}
          />
        </FormControl>
        <Box sx={{ textAlign: 'end' }}>
          <Button onClick={() => navigate(ROUTES.WAREHOUSE)} sx={{ mr: 2 }}>
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

export default WarehouseUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
