import { DateRange } from 'react-date-range';

import { Divider } from '@mui/material';

import { MenuItem } from '@mui/material';

import { Menu } from '@mui/material';

import { Box } from '@mui/material';
import { RangeKeyDict } from 'react-date-range';

interface DateRangeMenuProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  onClose: () => void;
  onSelect: (daysAgo: number) => void;
  dateRange: Array<{ startDate: Date; endDate: Date; key: string }>;
  onRangeChange: (rangesByKey: RangeKeyDict) => void;
}

function DateRangeMenu({
  anchorEl,
  open,
  onClose,
  onSelect,
  dateRange,
  onRangeChange,
}: DateRangeMenuProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      PaperProps={{ sx: { p: 1, minWidth: 200 } }}>
      <MenuItem onClick={() => onSelect(7)}>7 ngày trước</MenuItem>
      <MenuItem onClick={() => onSelect(14)}>14 ngày trước</MenuItem>
      <MenuItem onClick={() => onSelect(30)}>30 ngày trước</MenuItem>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ p: 1 }}>
        <DateRange
          ranges={dateRange}
          onChange={onRangeChange}
          months={1}
          direction='horizontal'
          showDateDisplay={false}
          showMonthAndYearPickers={false}
          rangeColors={['#1976d2']}
        />
      </Box>
    </Menu>
  );
}

export default DateRangeMenu;
