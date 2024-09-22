import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useState } from 'react';
// import { useAuthContext } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutate } from '@/services/auth';
import { useAuthContext } from '@/contexts/AuthContext';
// import Cookies from 'js-cookie';
const Header = () => {
  const auth = useAuthContext();
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'end',
        alignItems: 'center',
        width: '100%',
        height: 80,
        bgcolor: '#fefeff',
        boxShadow:
          '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }}>
      <Button
        endIcon={<KeyboardArrowDownIcon />}
        sx={{ mr: 4 }}
        onClick={handleClick}>
        <Typography sx={{ fontWeight: 500, textTransform: 'none' }}>
          Son Le
        </Typography>
      </Button>
      <Menu
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}>
        {/* <MenuItem>{auth?.user?.name}</MenuItem> */}

        <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
      </Menu>
    </Box>
  );
};

export default Header;
