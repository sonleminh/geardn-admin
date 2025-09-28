import { FormikProps } from 'formik';

import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  SxProps,
  Theme,
  Typography,
  Autocomplete,
  TextField,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import Input from '@/components/Input';
import { IDistrict, IWards, IProvince } from '@/interfaces/IOrder';
import {
  useGetDistrict,
  useGetProvince,
  useGetProvinceList,
} from '@/services/order';
import DatePicker from 'react-datepicker';
import { useGetWarehouseList } from '@/services/warehouse';

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
  completedAt: Date | null;
}

interface ShipmentFormProps {
  formik: FormikProps<FormValues>;
  city: string;
  district: string;
  ward: string;
  detailAddress: string;
  shopAddress: string;
  setCity: React.Dispatch<React.SetStateAction<string>>;
  setDistrict: React.Dispatch<React.SetStateAction<string>>;
  setWard: React.Dispatch<React.SetStateAction<string>>;
  setDetailAddress: React.Dispatch<React.SetStateAction<string>>;
  setShopAddress: (shopAddress: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ShipmentForm: React.FC<ShipmentFormProps> = ({
  formik,
  city,
  district,
  ward,
  detailAddress,
  shopAddress,
  setCity,
  setDistrict,
  setWard,
  setDetailAddress,
  setShopAddress,
  handleChange,
}) => {
  const { data: provinceList } = useGetProvinceList();
  const { data: province } = useGetProvince(
    provinceList?.data?.find((item: IProvince) => item?.name === city)?.code
  );
  const { data: districtData } = useGetDistrict(
    province?.data?.districts?.find?.((item) => item?.name === district)?.code
  );
  const { data: warehouseData } = useGetWarehouseList();
  return (
    <>
      <RadioGroup
        sx={{ mb: 1 }}
        row
        name='shipment.method'
        onChange={handleChange}
        value={formik?.values?.shipment?.method}>
        <FormControlLabel
          value={1}
          control={<Radio size='small' />}
          label={
            <Typography sx={{ fontSize: 14 }}>Giao hàng tận nơi</Typography>
          }
        />
        <FormControlLabel
          value={2}
          control={<Radio size='small' />}
          label={
            <Typography sx={{ fontSize: 14 }}>Nhận tại cửa hàng</Typography>
          }
        />
      </RadioGroup>
      {formik?.values?.shipment?.method == 1 ? (
        <>
          <FormControl
            sx={{
              ...selectStyle,
            }}
            variant='filled'
            margin='dense'
            fullWidth>
            <Autocomplete
              size='small'
              options={provinceList?.data || []}
              getOptionLabel={(option: IProvince) => option.name}
              value={
                provinceList?.data?.find(
                  (item: IProvince) => item.name === city
                ) || null
              }
              onChange={(_, newValue) => setCity(newValue?.name || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Tỉnh/Thành phố'
                  variant='filled'
                  sx={{
                    '& .MuiFilledInput-root': {
                      borderRadius: '4px',
                    },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    disableUnderline: true,
                  }}
                />
              )}
            />
          </FormControl>
          <FormControl
            variant='filled'
            fullWidth
            margin='dense'
            sx={{
              ...selectStyle,
            }}>
            <Autocomplete
              size='small'
              options={province?.data?.districts || []}
              getOptionLabel={(option: IDistrict) => option.name}
              value={
                province?.data?.districts?.find(
                  (item: IDistrict) => item.name === district
                ) || null
              }
              onChange={(_, newValue) => setDistrict(newValue?.name || '')}
              disabled={!city}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Quận/Huyện'
                  variant='filled'
                  sx={{
                    '& .MuiFilledInput-root': {
                      borderRadius: '4px',
                    },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    disableUnderline: true,
                  }}
                />
              )}
            />
          </FormControl>
          <FormControl
            variant='filled'
            fullWidth
            margin='dense'
            sx={{
              ...selectStyle,
            }}>
            <Autocomplete
              size='small'
              options={districtData?.data?.wards || []}
              getOptionLabel={(option: IWards) => option.name}
              value={
                districtData?.data?.wards?.find(
                  (item: IWards) => item.name === ward
                ) || null
              }
              onChange={(_, newValue) => setWard(newValue?.name || '')}
              disabled={!district}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Phường/Xã'
                  variant='filled'
                  sx={{
                    '& .MuiFilledInput-root': {
                      borderRadius: '4px',
                    },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    disableUnderline: true,
                  }}
                />
              )}
            />
          </FormControl>
          <FormControl fullWidth margin='dense'>
            <Input
              label='Địa chỉ cụ thể'
              variant='filled'
              size='small'
              rows={3}
              onChange={(e) => setDetailAddress(e?.target?.value)}
              value={detailAddress}
            />
          </FormControl>
        </>
      ) : (
        <FormControl variant='filled' fullWidth margin='dense' sx={selectStyle}>
          <InputLabel>Chọn shop có hàng gần nhất</InputLabel>
          <Select
            disableUnderline
            size='small'
            onChange={(e) => setShopAddress(e?.target?.value)}
            value={shopAddress}>
            {warehouseData?.data?.map((item) => (
              <MenuItem key={item?.id} value={item?.address}>
                {item?.address}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
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
        <Typography sx={{ mb: 1 }}>Thời gian chọn giao hàng:</Typography>
        <DatePicker
          showTimeSelect
          showIcon
          icon={<CalendarTodayOutlinedIcon />}
          selected={formik?.values?.shipment?.deliveryDate}
          onChange={(e) => formik.setFieldValue('shipment.deliveryDate', e)}
          dateFormat='dd/MM/yyyy HH:mm'
          timeFormat='HH:mm'
          className='date-picker'
          popperPlacement='bottom-start'
          portalId='root'
        />
      </FormControl>
      <FormControl
        variant='filled'
        fullWidth
        margin='dense'
        sx={{
          textarea: {
            fontFamily: 'Roboto, sans-serif',
            '::placeholder': {
              fontSize: 14,
            },
          },
        }}>
        <textarea
          placeholder='Ghi chú (Ví dụ: Hãy gọi cho tôi khi chuẩn bị hàng xong)'
          name='note'
          rows={4}
          onChange={(e) => formik.setFieldValue(e.target.name, e.target.value)}
          value={formik?.values?.note}
          style={{
            width: '100%',
            padding: '8.5px 14px',
            border: '1px solid rgba(0, 0, 0, 0.23)',
            borderRadius: '4px',
            fontSize: 16,
          }}
          onFocus={(e) => (e.target.style.outline = '1px solid #000')}
          onBlur={(e) => (e.target.style.outline = 'none')}
        />
        <FormHelperText sx={helperTextStyle}>
          {formik?.errors?.note}
        </FormHelperText>
      </FormControl>
    </>
  );
};

export default ShipmentForm;

const selectStyle: SxProps<Theme> = {
  '& .Mui-disabled': {
    cursor: 'not-allowed',
  },
};

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
