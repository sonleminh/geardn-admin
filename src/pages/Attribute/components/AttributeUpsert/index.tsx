import { ChangeEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Input from '@/components/Input';
import SuspenseLoader from '@/components/SuspenseLoader';

import { QueryKeys } from '@/constants/query-key';
import { useNotificationContext } from '@/contexts/NotificationContext';
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
import {
  useCreateAttribute,
  useGetAttributeById,
  useUpdateAttribute,
} from '@/services/attribute';
import { createSchema, updateSchema } from '../utils/schema/attributeSchema';

const AttributeUpsert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();

  const isEdit = !!id;

  const { data: attributeData } = useGetAttributeById(id as string);
  console.log('att:', attributeData);

  const { mutate: createAttributeMutate, isPending: isCreatePending } =
    useCreateAttribute();
  const { mutate: updateAttributeMutate, isPending: isUpdatePending } =
    useUpdateAttribute();
  const formik = useFormik({
    initialValues: {
      type: '',
      value: '',
    },
    validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      if (isEdit) {
        updateAttributeMutate(
          { id: +id, ...values },
          {
            onSuccess() {
              queryClient.invalidateQueries({
                queryKey: [QueryKeys.Attribute],
              });
              showNotification('Cập nhật phân loại thành công', 'success');
              navigate('/attribute');
            },
          }
        );
      } else {
        createAttributeMutate(values, {
          onSuccess() {
            queryClient.invalidateQueries({ queryKey: [QueryKeys.Attribute] });
            showNotification('Tạo phân loại thành công', 'success');
            navigate('/attribute');
          },
        });
      }
    },
  });

  useEffect(() => {
    if (attributeData) {
      formik.setFieldValue('type', attributeData?.type);
      formik.setFieldValue('value', attributeData?.value);
    }
  }, [attributeData]);

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
            name='type'
            onChange={handleSelectChange}
            value={formik?.values?.type ?? ''}>
            {Object.values(ATTRIBUTE_TYPE)?.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            <Box component={'span'} sx={helperTextStyle}>
              {formik.errors?.type}
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
          <Button onClick={() => navigate('/attribute')} sx={{ mr: 2 }}>
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

export default AttributeUpsert;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
