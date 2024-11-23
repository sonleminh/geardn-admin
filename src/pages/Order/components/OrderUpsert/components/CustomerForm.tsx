import { Box, FormControl, Grid2, SxProps, Theme } from '@mui/material';
import Input from '@/components/Input';

interface CustomerInfoFormProps {
  values: {
    name: string;
    phone: string;
    mail: string;
  };
  errors: {
    name?: string;
    phone?: string;
    mail?: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomerForm: React.FC<CustomerInfoFormProps> = ({
  values,
  errors,
  handleChange,
}) => {
  return (
    <Grid2 container rowSpacing={2} columnSpacing={4} mb={2}>
      <Grid2 size={6}>
        <FormControl fullWidth>
          <Input
            label='Tên khách hàng'
            name='customer.name'
            variant='filled'
            size='small'
            helperText={
              <Box component={'span'} sx={helperTextStyle}>
                {errors.name}
              </Box>
            }
            value={values.name}
            onChange={handleChange}
          />
        </FormControl>
      </Grid2>
      <Grid2 size={6}>
        <FormControl fullWidth>
          <Input
            label='Mail'
            name='customer.mail'
            variant='filled'
            size='small'
            helperText={
              <Box component={'span'} sx={helperTextStyle}>
                {errors?.mail}
              </Box>
            }
            value={values?.mail}
            onChange={handleChange}
          />
        </FormControl>
      </Grid2>
      <Grid2 size={6}>
        <FormControl fullWidth>
          <Input
            label='Số điện thoại'
            name='customer.phone'
            variant='filled'
            size='small'
            helperText={
              <Box component={'span'} sx={helperTextStyle}>
                {errors?.phone}
              </Box>
            }
            value={values?.phone}
            onChange={handleChange}
          />
        </FormControl>
      </Grid2>
    </Grid2>
  );
};

export default CustomerForm;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
