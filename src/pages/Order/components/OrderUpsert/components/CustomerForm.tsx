import { Box, FormControl, SxProps, Theme } from '@mui/material';
import Input from '@/components/Input';
import { FormikProps } from 'formik';

interface FormValues {
  fullName: string;
  phoneNumber: string;
  email: string;
  shipment: {
    method: number;
    deliveryDate: Date | null;
  };
  paymentMethodId: number;
  flag: {
    isOnlineOrder: boolean;
  };
  note: string;
}

interface CustomerInfoFormProps {
  formik: FormikProps<FormValues>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomerForm: React.FC<CustomerInfoFormProps> = ({
  formik,
  handleChange,
}) => {
  return (
    <Box>
      <FormControl fullWidth margin='dense'>
        <Input
          label='Tên khách hàng'
          name='fullName'
          variant='filled'
          size='small'
          helperText={
            <Box component={'span'} sx={helperTextStyle}>
              {formik?.errors?.fullName}
            </Box>
          }
          value={formik?.values?.fullName}
          onChange={handleChange}
        />
      </FormControl>
      <FormControl fullWidth margin='dense'>
        <Input
          label='Email'
          name='email'
          variant='filled'
          size='small'
          helperText={
            <Box component={'span'} sx={helperTextStyle}>
              {formik?.errors?.email}
            </Box>
          }
          value={formik?.values?.email}
          onChange={handleChange}
        />
      </FormControl>
      <FormControl fullWidth margin='dense'>
        <Input
          label='Số điện thoại'
          name='phoneNumber'
          variant='filled'
          size='small'
          helperText={
            <Box component={'span'} sx={helperTextStyle}>
              {formik?.errors?.phoneNumber}
            </Box>
          }
          value={formik?.values?.phoneNumber}
          onChange={handleChange}
        />
      </FormControl>
    </Box>
  );
};

export default CustomerForm;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
