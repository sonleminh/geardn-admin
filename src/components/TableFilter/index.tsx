import { truncateTextByLine } from '@/utils/css-helper.util';
import {
  Box,
  Typography,
  Checkbox,
  DialogActions,
  Button,
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

interface FilterOption {
  id: string | number;
  label: string;
}

interface TableFilterProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onFilterChange: (newValues: string[]) => void;
  sx?: SxProps<Theme>;
  onClose: () => void;
}

const TableFilter = ({
  title,
  options,
  selectedValues,
  onFilterChange,
  sx,
  onClose,
}: TableFilterProps) => {
  return (
    <>
      <Box sx={{ p: 2, minWidth: 200, ...sx }}>
        <Typography variant='subtitle2' sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
          {options.map((option) => (
            <Box
              key={option.id}
              sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
              <Checkbox
                checked={selectedValues.includes(option.id.toString())}
                onChange={(e) => {
                  const newValue = e.target.checked
                    ? [...selectedValues, option.id.toString()]
                    : selectedValues.filter(
                        (id) => id !== option.id.toString()
                      );
                  onFilterChange(newValue);
                }}
              />
              <Typography variant='body2' sx={{ ...truncateTextByLine(1) }}>
                {option.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </>
  );
};

export default TableFilter;
