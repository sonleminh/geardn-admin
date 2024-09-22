import { MouseEvent, ReactNode, useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, Button, Popover } from '@mui/material';

export default function ActionButton({ children }: { children: ReactNode }) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  return (
    <Box>
      <Button aria-describedby={id} variant='text' onClick={handleClick}>
        <MoreVertIcon />
      </Button>
      <Popover id={id} open={open} anchorEl={anchorEl} onClose={handleClose}>
        <Box sx={{ p: 1 }}>{children}</Box>
      </Popover>
    </Box>
  );
}
