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
  useGetWarehouseList,
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
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import { createSchema, updateSchema } from '../utils/schema/warehouseSchema';
import { useGetEnumByContext } from '@/services/enum';

const ImportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();

  const isEdit = !!id;

  const numericId = id ? Number(id) : undefined;

  const { data: warehousesData } = useGetWarehouseList();
  const { data: warehouseData } = useGetWarehouseById(numericId as number);
  const { data: enumData } = useGetEnumByContext('import-type');

  const { mutate: createImportMutate, isPending: isCreatePending } =
    useCreateWarehouse();
  const formik = useFormik({
    initialValues: {
      warehouseId: '',
      type: '',
      items: [],
    },
    validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      // if (isEdit) {
      //   updateWarehouseMutate(
      //     { id: +id, ...values },
      //     {
      //       onSuccess() {
      //         queryClient.invalidateQueries({
      //           queryKey: [QueryKeys.Warehouse],
      //         });
      //         showNotification('Cập nhật kho hàng thành công', 'success');
      //         navigate(ROUTES.WAREHOUSE);
      //       },
      //     }
      //   );
      // } else {
      //   createWarehouseMutate(values, {
      //     onSuccess() {
      //       queryClient.invalidateQueries({ queryKey: [QueryKeys.Warehouse] });
      //       showNotification('Tạo kho hàng thành công', 'success');
      //       navigate(ROUTES.WAREHOUSE);
      //     },
      //   });
      // }
    },
  });

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    formik.setFieldValue(name, value);
  };

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
            Nhập hàng
          </Typography>
        }
      />
      <Divider />

      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl
          variant='filled'
          fullWidth
          sx={{
            '& .MuiFilledInput-root': {
              overflow: 'hidden',
              borderRadius: 1,
              backgroundColor: '#fff !important',
              border: '1px solid',
              borderColor: 'rgba(0,0,0,0.23)',
              '&:hover': {
                backgroundColor: 'transparent',
              },
              '&.Mui-focused': {
                backgroundColor: 'transparent',
                border: '2px solid',
              },
            },
            '& .MuiInputLabel-asterisk': {
              color: 'red',
            },
          }}>
          <InputLabel>Kho hàng</InputLabel>
          <Select
            disableUnderline
            required
            size='small'
            name='warehouseId'
            onChange={handleSelectChange}
            value={formik?.values?.warehouseId ?? ''}>
            {warehousesData?.data?.map((item) => (
              <MenuItem key={item?.name} value={item?.id}>
                {item?.name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            <Box component={'span'} sx={helperTextStyle}>
              {formik.errors?.warehouseId}
            </Box>
          </FormHelperText>
        </FormControl>
        <FormControl
          variant='filled'
          fullWidth
          sx={{
            '& .MuiFilledInput-root': {
              overflow: 'hidden',
              borderRadius: 1,
              backgroundColor: '#fff !important',
              border: '1px solid',
              borderColor: 'rgba(0,0,0,0.23)',
              '&:hover': {
                backgroundColor: 'transparent',
              },
              '&.Mui-focused': {
                backgroundColor: 'transparent',
                border: '2px solid',
              },
            },
            '& .MuiInputLabel-asterisk': {
              color: 'red',
            },
          }}>
          <InputLabel>Loại nhập</InputLabel>
          <Select
            disableUnderline
            required
            size='small'
            name='type'
            onChange={handleSelectChange}
            value={formik?.values?.type ?? ''}>
            {enumData?.data?.map((item) => (
              <MenuItem key={item?.value} value={item?.value}>
                {item?.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            <Box component={'span'} sx={helperTextStyle}>
              {formik.errors?.type}
            </Box>
          </FormHelperText>
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
      {isCreatePending && <SuspenseLoader />}
    </Card>
  );
};

export default ImportPage;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
