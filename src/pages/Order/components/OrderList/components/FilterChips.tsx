import { useCallback } from 'react';
import { IEnum } from '@/interfaces/IEnum';
import { Box } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import Chip from '@mui/material/Chip';
import moment from 'moment';

interface ColumnFilters {
  items: string[];
  status: string[];
  date: { fromDate: string; toDate: string };
}

interface FilterChipsProps {
  columnFilters: ColumnFilters;
  productsData: {
    data?: Array<{
      id: number;
      name: string;
    }>;
  };
  orderStatusEnumData: {
    data?: Array<IEnum>;
  };
  onFilterChange: (
    column: string,
    value: string | string[] | { fromDate: string; toDate: string }
  ) => void;
}

export const FilterChips = ({
  columnFilters,
  productsData,
  orderStatusEnumData,
  onFilterChange,
}: FilterChipsProps) => {
  const getFilterLabels = useCallback(
    (filterKey: string, values: string[]) => {
      if (filterKey === 'items') {
        return values.map(
          (value: string) =>
            productsData?.data?.find(
              (p: { id: number; name: string }) => p.id === +value
            )?.name || value
        );
      } else if (filterKey === 'status') {
        return values.map(
          (value: string) =>
            orderStatusEnumData?.data?.find((e: IEnum) => e.value === value)
              ?.label || value
        );
      }
      return [];
    },
    [productsData?.data, orderStatusEnumData?.data]
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <FilterListIcon />
      {Object.entries(columnFilters).map(([filterKey, filterValues]) => {
        if (filterKey === 'date') {
          const dateValues = filterValues as {
            fromDate: string;
            toDate: string;
          };
          if (!dateValues.fromDate || !dateValues.toDate) return null;
          return (
            <Chip
              key='date-filter'
              label={`${moment(dateValues.fromDate).format(
                'DD/MM/YYYY'
              )} - ${moment(dateValues.toDate).format('DD/MM/YYYY')}`}
              onDelete={() => {
                onFilterChange('date', { fromDate: '', toDate: '' });
              }}
              size='small'
            />
          );
        }

        const values = filterValues as string[];
        if (values.length === 0) return null;

        const filterLabels = getFilterLabels(filterKey, values);

        return filterLabels.map((label) => (
          <Chip
            key={`${filterKey}-${label}`}
            label={label}
            onDelete={() => {
              const newValues = values.filter((value: string) => {
                const itemLabel =
                  filterKey === 'items'
                    ? productsData?.data?.find((p) => p.id === +value)?.name
                    : orderStatusEnumData?.data?.find((e) => e.value === value)
                        ?.label;
                return itemLabel !== label;
              });
              onFilterChange(filterKey, newValues);
            }}
            size='small'
            sx={{ maxWidth: 120 }}
          />
        ));
      })}
    </Box>
  );
};
