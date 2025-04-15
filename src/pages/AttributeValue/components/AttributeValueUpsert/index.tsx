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

import { QueryKeys } from '@/constants/query-key';

import SuspenseLoader from '@/components/SuspenseLoader';
import Input from '@/components/Input';

import { useNotificationContext } from '@/contexts/NotificationContext';

import { createSchema, updateSchema } from '../utils/schema/attributeSchema';

import {
  useCreateAttributeValue,
  useGetAttributeValueById,
  useUpdateAttributeValue,
} from '@/services/attribute-value';
import { useGetAttributeList } from '@/services/attribute';
import { ROUTES } from '@/constants/route';

const AttributeValueUpsert = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const numericId = id ? Number(id) : undefined;

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();

  const { data: attributeValuesData } = useGetAttributeValueById(numericId);
  const { data: attributesData } = useGetAttributeList();

  const { mutate: createAttributeValueMutate, isPending: isCreatePending } =
    useCreateAttributeValue();
  const { mutate: updateAttributeValueMutate, isPending: isUpdatePending } =
    useUpdateAttributeValue();
  const formik = useFormik({
    initialValues: {
      attributeId: '',
      value: '',
    },
    validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      if (isEdit) {
        updateAttributeValueMutate(
          { id: +id, attributeId: +values.attributeId, value: values.value },
          {
            onSuccess() {
              queryClient.invalidateQueries({
                queryKey: [QueryKeys.AttributeValue],
              });
              showNotification('Cập nhật phân loại thành công', 'success');
              navigate(ROUTES.ATTRIBUTE_VALUE);
            },
          }
        );
      } else {
        createAttributeValueMutate(
          { attributeId: +values.attributeId, value: values.value },
          {
            onSuccess() {
              queryClient.invalidateQueries({
                queryKey: [QueryKeys.AttributeValue],
              });
              showNotification('Tạo phân loại thành công', 'success');
              navigate(ROUTES.ATTRIBUTE_VALUE);
            },
          }
        );
      }
    },
  });

  useEffect(() => {
    if (attributeValuesData) {
      formik.setFieldValue(
        'attributeId',
        attributeValuesData?.data?.attributeId
      );
      formik.setFieldValue('value', attributeValuesData?.data?.value);
    }
  }, [attributeValuesData]);

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
            {isEdit ? 'Sửa giá trị thuộc tính' : 'Thêm giá trị thuộc tính'}
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
            name='attributeId'
            onChange={handleSelectChange}
            value={formik?.values?.attributeId ?? ''}>
            {attributesData?.data?.map((item) => (
              <MenuItem key={item.name} value={item.id}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            <Box component={'span'} sx={helperTextStyle}>
              {formik.errors?.attributeId}
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
            onClick={() => navigate(ROUTES.ATTRIBUTE_VALUE)}
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

export default AttributeValueUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
