import { Box, Typography } from '@mui/material';

function Footer() {
  return (
    <Box
      display={{ xs: 'block', md: 'flex' }}
      alignItems='center'
      justifyContent='space-between'
      p='20px 24px'
      textAlign={{ xs: 'center', md: 'left' }}>
      <Box>
        <Typography sx={{ color: 'rgba(34, 51, 84, 0.7)', fontSize: 15 }}>
          &copy; GearDN Admin Dashboard
        </Typography>
      </Box>
    </Box>
  );
}

export default Footer;
