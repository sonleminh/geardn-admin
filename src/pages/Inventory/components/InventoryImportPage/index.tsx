import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/route';

import ActionButton from '@/components/ActionButton';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import TableFilter from '@/components/TableFilter';
import { IEnum } from '@/interfaces/IEnum';
import { IImportLogItem } from '@/interfaces/IImportLog';
import { useGetEnumByContext } from '@/services/enum';
import { useGetImportLogList } from '@/services/inventory';
import { useGetProductList } from '@/services/product';
import { useGetWarehouseList } from '@/services/warehouse';
import { truncateTextByLine } from '@/utils/css-helper.util';
import { formatPrice } from '@/utils/format-price';
import { AddCircleOutlined } from '@mui/icons-material';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  IconButton,
  Popover,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { addDays } from 'date-fns';
import moment from 'moment';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';
import { TableSkeleton } from '@/components/TableSkeleton';

interface Data {
  stt: number;
  warehouse: string;
  items: IImportLogItem[];
  type: string;
  createdAt: Date;
  note: string;
  action: string;
}

interface HeadCell {
  align?: 'center' | 'left' | 'right' | 'inherit' | 'justify' | undefined;
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  isFilter?: boolean;
  width?: string;
}

const headCells: readonly HeadCell[] = [
  {
    align: 'center',
    id: 'stt',
    disablePadding: false,
    label: 'STT',
    isFilter: false,
    width: '60px',
  },
  {
    id: 'warehouse',
    disablePadding: false,
    label: 'Kho',
    isFilter: true,
    width: '120px',
  },
  {
    id: 'items',
    disablePadding: false,
    label: 'Sản phẩm',
    isFilter: true,
    width: '400px',
  },
  {
    align: 'center',
    id: 'type',
    disablePadding: false,
    label: 'Loại',
    isFilter: true,
    width: '120px',
  },
  {
    align: 'center',
    id: 'createdAt',
    disablePadding: false,
    label: 'Ngày nhập',
    width: '120px',
  },
  {
    align: 'center',
    id: 'note',
    disablePadding: false,
    label: 'Ghi chú',
    width: '150px',
  },
  {
    align: 'center',
    id: 'action',
    disablePadding: false,
    label: 'Hành động',
    width: '150px',
  },
];

type ColumnType = 'text' | 'image' | 'action' | 'complex';
type ColumnAlign = 'left' | 'center' | 'right';

interface TableColumn {
  width: string;
  align?: ColumnAlign;
  type: ColumnType;
}

const columns: TableColumn[] = [
  { width: '60px', align: 'center', type: 'text' },
  { width: '120px', type: 'text' },
  { width: '400px', type: 'complex' },
  { width: '120px', align: 'center', type: 'text' },
  { width: '120px', align: 'center', type: 'text' },
  { width: '150px', align: 'center', type: 'text' },
  { width: '150px', align: 'center', type: 'action' },
];

interface ColumnFilters {
  warehouse: string[];
  items: string[];
  type: string[];
  date: { fromDate: string; toDate: string };
}

interface FilterChipsProps {
  columnFilters: ColumnFilters;
  warehousesData: {
    data?: Array<{
      id: number;
      name: string;
    }>;
  };
  productsData: {
    data?: Array<{
      id: number;
      name: string;
    }>;
  };
  enumData: {
    data?: Array<IEnum>;
  };
  onFilterChange: (
    column: string,
    value: string | string[] | { fromDate: string; toDate: string }
  ) => void;
}

const FilterChips = ({
  columnFilters,
  warehousesData,
  productsData,
  enumData,
  onFilterChange,
}: FilterChipsProps) => {
  const getFilterLabels = (filterKey: string, values: string[]) => {
    if (filterKey === 'warehouse') {
      return values.map(
        (value: string) =>
          warehousesData?.data?.find(
            (w: { id: number; name: string }) => w.id === +value
          )?.name || value
      );
    } else if (filterKey === 'items') {
      return values.map(
        (value: string) =>
          productsData?.data?.find(
            (p: { id: number; name: string }) => p.id === +value
          )?.name || value
      );
    } else if (filterKey === 'type') {
      return values.map(
        (value: string) =>
          enumData?.data?.find((e: IEnum) => e.value === value)?.label || value
      );
    }
    return [];
  };

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
                  filterKey === 'warehouse'
                    ? warehousesData?.data?.find((w) => w.id === +value)?.name
                    : filterKey === 'items'
                    ? productsData?.data?.find((p) => p.id === +value)?.name
                    : enumData?.data?.find((e) => e.value === value)?.label;
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

interface ImportLogItemProps {
  item: IImportLogItem;
}

const ImportLogItem = ({ item }: ImportLogItemProps) => {
  return (
    <Box
      my={1}
      sx={{
        display: 'flex',
        p: 1,
        bgcolor: '#fafafa',
        border: '1px solid #dadada',
        borderRadius: 1,
      }}>
      <Box
        sx={{
          height: 40,
          '.thumbnail': {
            width: 40,
            height: 40,
            mr: 1,
            objectFit: 'contain',
          },
        }}>
        <img
          src={item?.sku?.imageUrl ?? item?.sku?.product?.images?.[0]}
          className='thumbnail'
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography
          sx={{
            width: 80,
            fontSize: 14,
            fontWeight: 500,
            ...truncateTextByLine(1),
          }}>
          {item?.sku?.product?.name}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontSize: 13 }}>SL: {item?.quantity}</Typography>
          <Typography sx={{ fontSize: 13 }}>
            Giá nhập: {formatPrice(item?.costPrice)}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          ml: 2,
        }}>
        {item?.sku?.productSkuAttributes?.length
          ? item?.sku?.productSkuAttributes?.map((attr) => (
              <Typography key={attr?.id} sx={{ fontSize: 13 }}>
                {attr?.attributeValue?.attribute?.label}:{' '}
                {attr?.attributeValue?.value}
              </Typography>
            ))
          : ''}
      </Box>
    </Box>
  );
};

const InventoryImportPage = () => {
  const navigate = useNavigate();
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [activeFilterColumn, setActiveFilterColumn] = useState<string>('');
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({
    warehouse: [],
    items: [],
    type: [],
    date: { fromDate: '', toDate: '' },
  });

  const [dateState, setDateState] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: 'selection',
    },
  ]);

  const [dateFilterAnchorEl, setDateFilterAnchorEl] =
    useState<null | HTMLElement>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { data: warehousesData } = useGetWarehouseList();
  const { data: productsData } = useGetProductList();
  const { data: enumData } = useGetEnumByContext('import-type');

  const {
    data: importLogsData,
    refetch: refetchImportLogs,
    isLoading: isLoadingImportLogs,
  } = useGetImportLogList({
    warehouseIds: columnFilters.warehouse,
    productIds: columnFilters.items,
    types: columnFilters.type,
    fromDate: columnFilters.date.fromDate,
    toDate: columnFilters.date.toDate,
    page: page + 1,
    limit: rowsPerPage,
  });

  const importTypeMap = useMemo(() => {
    return Object.fromEntries(
      enumData?.data?.map((item) => [item.value, item.label]) ?? []
    );
  }, [enumData?.data]);

  const handleFilterClick = useCallback(
    (event: React.MouseEvent<HTMLElement>, column: string) => {
      setFilterAnchorEl(event.currentTarget);
      setActiveFilterColumn(column);
    },
    []
  );

  const handleFilterClose = useCallback(() => {
    setFilterAnchorEl(null);
    setActiveFilterColumn('');
  }, []);

  const handleColumnFilterChange = useCallback(
    (
      column: string,
      value: string | string[] | { fromDate: string; toDate: string }
    ) => {
      setColumnFilters((prev) => ({
        ...prev,
        [column]: value,
      }));
    },
    []
  );

  const handleDateRangeChange = useCallback((rangesByKey: RangeKeyDict) => {
    const selection = rangesByKey.selection;
    if (!selection?.startDate || !selection?.endDate) return;

    setDateState([
      {
        startDate: selection.startDate,
        endDate: selection.endDate,
        key: 'selection',
      },
    ]);

    const fromDate = new Date(
      Date.UTC(
        selection.startDate.getFullYear(),
        selection.startDate.getMonth(),
        selection.startDate.getDate(),
        0,
        0,
        0,
        0
      )
    );

    const toDate = new Date(
      Date.UTC(
        selection.endDate.getFullYear(),
        selection.endDate.getMonth(),
        selection.endDate.getDate(),
        23,
        59,
        59,
        999
      )
    );

    setColumnFilters((prev) => ({
      ...prev,
      date: {
        fromDate: fromDate.toISOString().split('T')[0],
        toDate: toDate.toISOString().split('T')[0],
      },
    }));
  }, []);

  const handleDateFilterClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setDateFilterAnchorEl(event.currentTarget);
    },
    []
  );

  const handleDateFilterClose = useCallback(() => {
    setDateFilterAnchorEl(null);
  }, []);

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    []
  );

  useEffect(() => {
    refetchImportLogs();
  }, [columnFilters, refetchImportLogs]);

  const renderFilterContent = useCallback(() => {
    switch (activeFilterColumn) {
      case 'warehouse':
        return (
          <TableFilter
            title='Lọc theo kho'
            options={
              warehousesData?.data?.map((warehouse) => ({
                id: warehouse.id,
                label: warehouse.name,
              })) ?? []
            }
            selectedValues={columnFilters.warehouse}
            onFilterChange={(newValues) =>
              handleColumnFilterChange('warehouse', newValues)
            }
            onClose={handleFilterClose}
          />
        );
      case 'items':
        return (
          <TableFilter
            title='Lọc theo sản phẩm'
            options={
              productsData?.data?.map((product) => ({
                id: product.id,
                label: product.name,
              })) ?? []
            }
            selectedValues={columnFilters.items}
            onFilterChange={(newValues) =>
              handleColumnFilterChange('items', newValues)
            }
            onClose={handleFilterClose}
            sx={{ maxWidth: 300 }}
          />
        );
      case 'type':
        return (
          <TableFilter
            title='Lọc theo loại nhập'
            options={
              enumData?.data?.map((type: IEnum) => ({
                id: type.value,
                label: type.label,
              })) ?? []
            }
            selectedValues={columnFilters.type}
            onFilterChange={(newValues) =>
              handleColumnFilterChange('type', newValues)
            }
            onClose={handleFilterClose}
          />
        );
      default:
        return null;
    }
  }, [
    activeFilterColumn,
    warehousesData,
    productsData,
    enumData,
    columnFilters,
    handleColumnFilterChange,
    handleFilterClose,
  ]);

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
            Nhập hàng
          </Typography>
        }
        action={
          <ButtonWithTooltip
            variant='contained'
            onClick={() => navigate(`${ROUTES.INVENTORY}/import/create`)}
            title='Nhập hàng'
            sx={{ textTransform: 'none' }}>
            <AddCircleOutlined />
          </ButtonWithTooltip>
        }
      />
      <Divider />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell colSpan={headCells.length}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <FilterChips
                      columnFilters={columnFilters}
                      warehousesData={warehousesData || { data: [] }}
                      productsData={productsData || { data: [] }}
                      enumData={enumData || { data: [] }}
                      onFilterChange={handleColumnFilterChange}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={handleDateFilterClick}
                        startIcon={<DateRangeOutlinedIcon />}
                        sx={{
                          textTransform: 'none',
                          borderColor: columnFilters.date.fromDate
                            ? 'primary.main'
                            : 'inherit',
                          color: columnFilters.date.fromDate
                            ? 'primary.main'
                            : 'inherit',
                          '&:hover': {
                            borderColor: 'primary.main',
                          },
                        }}>
                        {columnFilters.date.fromDate
                          ? `${moment(columnFilters.date.fromDate).format(
                              'DD/MM/YYYY'
                            )} - ${moment(columnFilters.date.toDate).format(
                              'DD/MM/YYYY'
                            )}`
                          : 'Chọn ngày'}
                      </Button>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
              <TableRow>
                {headCells?.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.align ?? 'left'}
                    padding={headCell.disablePadding ? 'none' : 'normal'}
                    sx={{ width: headCell.width }}>
                    {headCell.label}
                    {headCell.isFilter ? (
                      <>
                        {' '}
                        {(() => {
                          const filterValue =
                            columnFilters[
                              headCell.id as keyof typeof columnFilters
                            ];
                          if (
                            Array.isArray(filterValue) &&
                            filterValue.length > 0
                          ) {
                            return (
                              <Typography
                                component='span'
                                sx={{ fontSize: 14 }}>
                                ({filterValue.length})
                              </Typography>
                            );
                          }
                          return null;
                        })()}
                        <IconButton
                          size='small'
                          onClick={(e) => handleFilterClick(e, headCell.id)}
                          sx={{ ml: 1 }}>
                          <FilterAltOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </>
                    ) : null}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* <TableSkeleton rowsPerPage={rowsPerPage} columns={columns} /> */}
              {isLoadingImportLogs ? (
                <TableSkeleton rowsPerPage={rowsPerPage} columns={columns} />
              ) : importLogsData?.data?.length ? (
                importLogsData?.data?.map((importLog, index) => (
                  <TableRow key={index}>
                    <TableCell align='center'>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell>{importLog?.warehouse?.name}</TableCell>
                    <TableCell>
                      <Box>
                        {importLog?.items?.map((importLogItem) => (
                          <ImportLogItem
                            key={importLogItem?.sku?.id}
                            item={importLogItem}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align='center'>
                      {importTypeMap?.[importLog?.type] || 'Không xác định'}
                    </TableCell>
                    <TableCell align='center'>
                      {moment(importLog?.createdAt).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell align='center'>
                      {importLog?.note ?? 'Không có'}
                    </TableCell>
                    <TableCell align='center'>
                      <ActionButton>
                        <Box mb={1}>
                          <ButtonWithTooltip
                            color='primary'
                            variant='outlined'
                            title='Chỉnh sửa'
                            placement='left'>
                            <EditOutlinedIcon />
                          </ButtonWithTooltip>
                        </Box>
                        <Box>
                          <ButtonWithTooltip
                            color='error'
                            variant='outlined'
                            title='Xoá'
                            placement='left'>
                            <DeleteOutlineOutlinedIcon />
                          </ButtonWithTooltip>
                        </Box>
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell align='center' colSpan={7}>
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component='div'
          count={importLogsData?.meta?.total || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage='Số hàng mỗi trang'
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </CardContent>

      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}>
        {renderFilterContent()}
      </Popover>

      <Popover
        open={Boolean(dateFilterAnchorEl)}
        anchorEl={dateFilterAnchorEl}
        onClose={handleDateFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            p: 2,
            mt: 1,
          },
        }}>
        <DateRangePicker
          onChange={handleDateRangeChange}
          moveRangeOnFirstSelection={false}
          months={2}
          ranges={dateState}
          direction='horizontal'
        />
      </Popover>
    </Card>
  );
};

export default InventoryImportPage;
