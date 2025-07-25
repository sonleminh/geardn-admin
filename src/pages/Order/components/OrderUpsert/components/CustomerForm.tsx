import { Box, FormControl, SxProps, Theme, Typography } from '@mui/material';
import Input from '@/components/Input';
import { FormikProps } from 'formik';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

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
      <FormControl
        sx={{
          '.MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0,0,0,0.23) !important',
          },
          '.date-picker': {
            width: '100%',
            height: 50,
            pl: 5,
            fontSize: 15,
          },
          '.react-datepicker__calendar-icon': {
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
          },
        }}
        fullWidth
        margin='dense'>
        <Typography sx={{ mb: 1 }}>Thời gian nhận hàng:</Typography>
        <DatePicker
          showTimeSelect
          showIcon
          icon={<CalendarTodayOutlinedIcon />}
          selected={formik?.values?.shipment?.deliveryDate}
          onChange={(e) => formik.setFieldValue('shipment.delivery_date', e)}
          dateFormat='dd/MM/yyyy HH:mm'
          // timeFormat='HH:mm'
          timeFormat='HH:mm'
          className='date-picker'
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
