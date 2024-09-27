import {
  Box,
  CircularProgress,
  CircularProgressProps,
  Typography,
} from '@mui/material';

const CircularProgressWithLabel = (
  props: CircularProgressProps & { value: number }
) => {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        width: 40,
        height: 40,
        ml: 2,
      }}>
      <CircularProgress variant='determinate' {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Typography
          variant='caption'
          component='div'
          sx={{ color: 'text.secondary' }}>{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
};

export default CircularProgressWithLabel;
