import { FormikProps } from 'formik';
import moment, { Moment } from 'moment';

import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid2,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import Input from '@/components/Input';

import { IDistrict, IWards } from '@/interfaces/IOrder';

import {
  useGetDistrict,
  useGetProvince,
  useGetProvinceList,
} from '@/services/order';

interface FormValues {
  customer: {
    name: string;
    phone: string;
    mail: string;
  };
  shipment: {
    method: number;
    delivery_date: Moment | null;
  };
  payment: {
    method: string;
  };
  flag: {
    is_online_order: boolean;
  };
  note: string;
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
    provinceList?.find?.((item) => item?.name === city)?.code
  );
  const { data: districtData } = useGetDistrict(
    province?.districts?.find?.((item) => item?.name === district)?.code
  );
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
      <Grid2 mb={2} container rowSpacing={2} columnSpacing={4}>
        {formik?.values?.shipment?.method === 1 ? (
          <>
            <Grid2 size={6}>
              <FormControl sx={selectStyle} variant='filled' fullWidth>
                <InputLabel>Tỉnh/Thành phố</InputLabel>
                <Select
                  disableUnderline
                  size='small'
                  onChange={(e) => setCity(e?.target?.value)}
                  value={
                    provinceList?.some((item) => item.name === city) ? city : ''
                  }>
                  {provinceList?.map((item) => (
                    <MenuItem key={item?.code} value={item?.name}>
                      {item?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 size={6}>
              <FormControl variant='filled' fullWidth sx={selectStyle}>
                <InputLabel>Quận/Huyện</InputLabel>
                <Select
                  disableUnderline
                  size='small'
                  onChange={(e) => setDistrict(e?.target?.value)}
                  value={
                    province?.districts?.some((item) => item.name === district)
                      ? district
                      : ''
                  }
                  disabled={!city}>
                  {province?.districts?.map((item: IDistrict) => (
                    <MenuItem key={item?.code} value={item?.name}>
                      {item?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 size={6}>
              <FormControl variant='filled' fullWidth sx={selectStyle}>
                <InputLabel>Phường/Xã</InputLabel>
                <Select
                  disableUnderline
                  size='small'
                  onChange={(e) => setWard(e?.target?.value)}
                  value={
                    districtData?.wards?.some((item) => item.name === ward)
                      ? ward
                      : ''
                  }
                  disabled={!district}>
                  {districtData?.wards?.map((item: IWards) => (
                    <MenuItem key={item?.code} value={item?.name}>
                      {item?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 size={6}>
              <FormControl fullWidth>
                <Input
                  label='Địa chỉ cụ thể'
                  variant='filled'
                  size='small'
                  rows={3}
                  onChange={(e) => setDetailAddress(e?.target?.value)}
                  value={detailAddress}
                />
              </FormControl>
            </Grid2>
            {/* <Grid2 size={6}>
              <FormControl
                fullWidth
                sx={{
                  '.MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0,0,0,0.23) !important',
                  },
                }}>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <DateTimePicker
                    name='shipment.delivery_date'
                    ampm={false}
                    shouldDisableTime={(timeValue, clockType) => {
                      if (clockType === 'hours') {
                        const hour = timeValue.hour();
                        return hour < 8 || hour > 23;
                      }
                      return false;
                    }}
                    minDate={moment()}
                    onChange={(e) =>
                      formik.setFieldValue('shipment.delivery_date', e)
                    }
                    value={moment(formik?.values?.shipment?.delivery_date)}
                  />
                </LocalizationProvider>
              </FormControl>
            </Grid2> */}
          </>
        ) : (
          <Grid2 size={12}>
            <FormControl variant='filled' fullWidth sx={selectStyle}>
              <InputLabel>Chọn shop có hàng gần nhất</InputLabel>
              <Select
                disableUnderline
                size='small'
                onChange={(e) => setShopAddress(e?.target?.value)}
                value={shopAddress}>
                <MenuItem
                  value={
                    '39/48 Cù Chính Lan, P.Hòa Khê, Q.Thanh Khê, TP.Đà Nẵng'
                  }>
                  39/48 Cù Chính Lan, P.Hòa Khê, Q.Thanh Khê, TP.Đà Nẵng
                </MenuItem>
                <MenuItem
                  value={'02 Tô Hiến Thành, P.Phước Mỹ, Q.Sơn Trà, TP.Đà Nẵng'}>
                  02 Tô Hiến Thành, P.Phước Mỹ, Q.Sơn Trà, TP.Đà Nẵng
                </MenuItem>
              </Select>
            </FormControl>
          </Grid2>
        )}
        <Grid2 size={12}>
          <FormControl
            variant='filled'
            fullWidth
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
              onChange={(e) =>
                formik.setFieldValue(e.target.name, e.target.value)
              }
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
        </Grid2>
      </Grid2>
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
