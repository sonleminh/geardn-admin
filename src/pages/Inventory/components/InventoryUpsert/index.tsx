import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Input from '@/components/Input';
import SuspenseLoader from '@/components/SuspenseLoader';

import { QueryKeys } from '@/constants/query-key';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';

// import {
//   useCreateInventory,
//   useGetInventoryById,
//   useUpdateInventory,
// } from '@/services/inventory';
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
import {
  useGetInitialForCreate,
  useGetSkuByByProductId,
} from '@/services/product-sku';
import { ICategory } from '@/interfaces/ICategory';
import { useGetProductByCategory } from '@/services/product';
import { IProduct } from '@/interfaces/IProduct';

const InventoryUpsert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [categoryId, setCategoryId] = useState<string>('');
  const [productId, setProductId] = useState<string>('');

  const { data: initData } = useGetInitialForCreate();
  const { data: productsByCategory } = useGetProductByCategory(categoryId);

  const { data: skuList } = useGetSkuByByProductId(productId);

  const isEdit = !!id;

  console.log(productId);
  console.log(skuList);

  // const { data: InventoryData } = useGetInventoryById(id as string);

  // const { mutate: createInventoryMutate, isPending: isCreatePending } =
  //   useCreateInventory();
  // const { mutate: updateInventoryMutate, isPending: isUpdatePending } =
  //   useUpdateInventory();
  const formik = useFormik({
    initialValues: {
      product_id: '',
    },
    // validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      // if (isEdit) {
      //   updateInventoryMutate(
      //     { _id: id, ...values },
      //     {
      //       onSuccess() {
      //         queryClient.invalidateQueries({
      //           queryKey: [QueryKeys.Inventory],
      //         });
      //         showNotification('Cập nhật danh mục thành công', 'success');
      //         navigate('/Inventory');
      //       },
      //     }
      //   );
      // } else {
      //   createInventoryMutate(values, {
      //     onSuccess() {
      //       queryClient.invalidateQueries({ queryKey: [QueryKeys.Inventory] });
      //       showNotification('Tạo danh mục thành công', 'success');
      //       navigate('/Inventory');
      //     },
      //   });
      // }
    },
  });

  // useEffect(() => {
  //   console.log(22);
  // }, [productId]);

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setProductId(value);
    formik.setFieldValue(name, value);
  };

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Typography variant='h5' sx={{ fontWeight: 600 }}>
            {isEdit ? 'Cập nhật kho hàng' : 'Thêm sản phẩm'}
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
          <InputLabel>Danh mục</InputLabel>
          <Select
            disableUnderline
            size='small'
            onChange={(e) => {
              setCategoryId(e?.target?.value);
            }}
            value={categoryId}>
            {initData?.categoryList?.map((item: ICategory) => (
              <MenuItem key={item?._id} value={item?._id}>
                {item?.name}
              </MenuItem>
            ))}
          </Select>
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
          <InputLabel>Sản phẩm</InputLabel>
          <Select
            disableUnderline
            size='small'
            name='product_id'
            onChange={handleSelectChange}
            value={formik?.values?.product_id}>
            {productsByCategory?.map((item) => (
              <MenuItem key={item?._id} value={item?._id}>
                {item?.name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            <Box component={'span'} sx={helperTextStyle}>
              {formik.errors?.product_id}
            </Box>
          </FormHelperText>
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
      {/* {(isCreatePending || isUpdatePending) && <SuspenseLoader />} */}
    </Card>
  );
};

export default InventoryUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
