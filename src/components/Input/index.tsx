import {
  OutlinedInputProps,
  TextField,
  TextFieldProps,
  styled,
} from '@mui/material';

const Input = styled((props: TextFieldProps) => (
  <TextField
    slotProps={{
      input: { disableunderline: 'true' } as Partial<OutlinedInputProps>,
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiFilledInput-root': {
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: theme.palette.mode === 'light' ? '#fff' : '#1A2027',
    border: '1px solid',
    borderColor:
      theme.palette.mode === 'light' ? 'rgba(0,0,0,0.23)' : '#2D3843',
    transition: theme.transitions.create([
      'border-color',
      'background-color',
      'box-shadow',
    ]),
    '&.Mui-focused': {
      backgroundColor: 'transparent',
      border: '2px solid',
      borderColor: theme.palette.primary.main,
    },
    '&:before': {
      borderBottom: 'none !important',
    },
    '&:after': {
      borderBottom: 'none',
    },
  },
  '& .MuiInputLabel-asterisk': {
    color: 'red',
  },
}));

export default Input;
