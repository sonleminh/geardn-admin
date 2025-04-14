import { ChangeEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';

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

import { ATTRIBUTE_TYPE } from '@/constants/attribute-type';
import { QueryKeys } from '@/constants/query-key';

import SuspenseLoader from '@/components/SuspenseLoader';
import Input from '@/components/Input';

import { useNotificationContext } from '@/contexts/NotificationContext';

import { createSchema, updateSchema } from '../utils/schema/attributeSchema';

import {
  useCreateProductAttribute,
  useGetProductAttributeById,
  useUpdateProductAttribute,
} from '@/services/product-attribute';
import { useGetAttributeTypeList } from '@/services/attribute-type';
import { ROUTES } from '@/constants/route';

const ProductAttributeUpsert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();

  const isEdit = !!id;

  const { data: productAttributeList } = useGetProductAttributeById(
    id as string
  );
  const { data: attributeTypeList } = useGetAttributeTypeList();

  const { mutate: createProductAttributeMutate, isPending: isCreatePending } =
    useCreateProductAttribute();
  const { mutate: updateProductAttributeMutate, isPending: isUpdatePending } =
    useUpdateProductAttribute();
  const formik = useFormik({
    initialValues: {
      typeId: '',
      value: '',
    },
    validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      if (isEdit) {
        updateProductAttributeMutate(
          { id: +id, typeId: +values.typeId, value: values.value },
          {
            onSuccess() {
              queryClient.invalidateQueries({
                queryKey: [QueryKeys.ProductAttribute],
              });
              showNotification('Cập nhật phân loại thành công', 'success');
              navigate(ROUTES.PRODUCT_ATTRIBUTE);
            },
          }
        );
      } else {
        createProductAttributeMutate(
          { typeId: +values.typeId, value: values.value },
          {
            onSuccess() {
              queryClient.invalidateQueries({
                queryKey: [QueryKeys.ProductAttribute],
              });
              showNotification('Tạo phân loại thành công', 'success');
              navigate(ROUTES.PRODUCT_ATTRIBUTE);
            },
          }
        );
      }
    },
  });

  useEffect(() => {
    if (productAttributeList) {
      formik.setFieldValue('typeId', productAttributeList?.typeId);
      formik.setFieldValue('value', productAttributeList?.value);
    }
  }, [productAttributeList]);

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
            {isEdit ? 'Sửa thuộc tính' : 'Thêm thuộc tính'}
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
          <InputLabel>Loại</InputLabel>
          <Select
            disableUnderline
            required
            size='small'
            name='typeId'
            onChange={handleSelectChange}
            value={formik?.values?.typeId ?? ''}>
            {attributeTypeList?.data?.map((item) => (
              <MenuItem key={item.name} value={item.id}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            <Box component={'span'} sx={helperTextStyle}>
              {formik.errors?.typeId}
            </Box>
          </FormHelperText>
        </FormControl>
        <FormControl>
          <Input
            label='Giá trị'
            name='value'
            variant='filled'
            required
            helperText={
              <Box component={'span'} sx={helperTextStyle}>
                {formik.errors.value}
              </Box>
            }
            value={formik?.values.value}
            onChange={handleChangeValue}
          />
        </FormControl>
        <Box sx={{ textAlign: 'end' }}>
          <Button
            onClick={() => navigate(ROUTES.PRODUCT_ATTRIBUTE)}
            sx={{ mr: 2 }}>
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

export default ProductAttributeUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
