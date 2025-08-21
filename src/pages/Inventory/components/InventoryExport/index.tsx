// React and React Router
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Material-UI components
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  IconButton,
  Link,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';

// Material-UI icons
import { AddCircleOutlined } from '@mui/icons-material';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

// Third-party libraries
import { addDays } from 'date-fns';
import moment from 'moment';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';

// Local components
import ActionButton from '@/components/ActionButton';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import TableFilter from '@/components/TableFilter';
import { TableSkeleton } from '@/components/TableSkeleton';

// Local services
import { useGetEnumByContext } from '@/services/enum';
import { useGetExportLogList } from '@/services/inventory';
import { useGetProductList } from '@/services/product';
import { useGetWarehouseList } from '@/services/warehouse';

// Local interfaces
import { IEnum } from '@/interfaces/IEnum';
import { IExportLogItem } from '@/interfaces/IInventorytLog';

// Local utilities
import { truncateTextByLine } from '@/utils/css-helper.util';
import { formatPrice } from '@/utils/format-price';

// Local constants
import { ROUTES } from '@/constants/route';
import { ColumnAlign, TableColumn } from '@/interfaces/ITableColumn';

interface Data {
  stt: number;
  warehouse: string;
  items: IExportLogItem[];
  type: string;
  createdAt: Date;
  note: string;
  action: string;
}

interface HeadCell {
  align?: ColumnAlign;
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  isFilter?: boolean;
  width?: string;
}
interface ColumnFilters {
  warehouse: string[];
  items: string[];
  type: string[];
  date: { fromDate: string; toDate: string };
}

// Constants
const INITIAL_COLUMN_FILTERS: ColumnFilters = {
  warehouse: [],
  items: [],
  type: [],
  date: { fromDate: '', toDate: '' },
};

const INITIAL_DATE_STATE = [
  {
    startDate: new Date(),
    endDate: addDays(new Date(), 7),
    key: 'selection',
  },
];

const headCells: readonly HeadCell[] = [
  {
    align: 'center',
    id: 'stt',
    disablePadding: false,
    label: 'STT',
    isFilter: false,
    width: '7%',
  },
  {
    id: 'warehouse',
    disablePadding: false,
    label: 'Kho',
    isFilter: true,
    width: '10%',
  },
  {
    id: 'items',
    disablePadding: false,
    label: 'Sản phẩm',
    isFilter: true,
    width: '39%',
  },
  {
    align: 'center',
    id: 'type',
    disablePadding: false,
    label: 'Loại',
    isFilter: true,
    width: '12%',
  },
  {
    align: 'center',
    id: 'createdAt',
    disablePadding: false,
    label: 'Ngày xuất',
    width: '12%',
  },
  {
    align: 'center',
    id: 'note',
    disablePadding: false,
    label: 'Ghi chú',
    width: '10%',
  },
  {
    align: 'center',
    id: 'action',
    disablePadding: false,
    label: 'Hành động',
    width: '10%',
  },
];

const columns: TableColumn[] = [
  { width: '60px', align: 'center', type: 'text' },
  { width: '100px', type: 'text' },
  { width: '300px', type: 'complex' },
  { width: '120px', align: 'center', type: 'text' },
  { width: '120px', align: 'center', type: 'text' },
  { width: '120px', align: 'center', type: 'text' },
  { width: '120px', align: 'center', type: 'action' },
];

// Components
interface ExportLogItemProps {
  item: IExportLogItem;
}

const ExportLogItem = ({ item }: ExportLogItemProps) => {
  const productName = item?.sku?.product?.name;
  const imageUrl = item?.sku?.imageUrl ?? item?.sku?.product?.images?.[0];
  const quantity = item?.quantity;
  const unitCost = item?.unitCost;
  const attributes = item?.sku?.productSkuAttributes;

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
        <img src={imageUrl} className='thumbnail' alt={productName} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography
          sx={{
            width: 80,
            fontSize: 14,
            fontWeight: 500,
            ...truncateTextByLine(1),
          }}>
          {productName}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontSize: 13 }}>SL: {quantity}</Typography>
          <Typography sx={{ fontSize: 13 }}>
            Giá nhập: {formatPrice(unitCost)}
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
        {attributes?.length
          ? attributes.map((attr) => (
              <Typography key={attr?.id} sx={{ fontSize: 13 }}>
                {attr?.attributeValue?.attribute?.label}:{' '}
                {attr?.attributeValue?.value}
              </Typography>
            ))
          : null}
      </Box>
    </Box>
  );
};

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
  const getFilterLabels = useCallback(
    (filterKey: string, values: string[]) => {
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
            enumData?.data?.find((e: IEnum) => e.value === value)?.label ||
            value
        );
      }
      return [];
    },
    [warehousesData?.data, productsData?.data, enumData?.data]
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

// Custom hooks
const useFilterState = () => {
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [activeFilterColumn, setActiveFilterColumn] = useState<string>('');
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>(
    INITIAL_COLUMN_FILTERS
  );
  const [dateState, setDateState] = useState(INITIAL_DATE_STATE);
  const [dateFilterAnchorEl, setDateFilterAnchorEl] =
    useState<null | HTMLElement>(null);

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

  return {
    filterAnchorEl,
    activeFilterColumn,
    columnFilters,
    dateState,
    dateFilterAnchorEl,
    handleFilterClick,
    handleFilterClose,
    handleColumnFilterChange,
    handleDateRangeChange,
    handleDateFilterClick,
    handleDateFilterClose,
  };
};

const usePagination = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = useCallback((_: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    []
  );

  return {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
  };
};

// Main component
const InventoryExportList = () => {
  const navigate = useNavigate();
  const {
    filterAnchorEl,
    activeFilterColumn,
    columnFilters,
    dateState,
    dateFilterAnchorEl,
    handleFilterClick,
    handleFilterClose,
    handleColumnFilterChange,
    handleDateRangeChange,
    handleDateFilterClick,
    handleDateFilterClose,
  } = useFilterState();

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } =
    usePagination();

  const { data: warehousesData } = useGetWarehouseList();
  const { data: productsData } = useGetProductList();
  const { data: enumData } = useGetEnumByContext('export-type');

  const {
    data: exportLogsData,
    refetch: refetchExportLogs,
    isLoading: isLoadingExportLogs,
  } = useGetExportLogList({
    warehouseIds: columnFilters.warehouse,
    productIds: columnFilters.items,
    types: columnFilters.type,
    fromDate: columnFilters.date.fromDate,
    toDate: columnFilters.date.toDate,
    page: page + 1,
    limit: rowsPerPage,
  });

  const importTypeMap = useMemo(
    () =>
      Object.fromEntries(
        enumData?.data?.map((item) => [item.value, item.label]) ?? []
      ),
    [enumData?.data]
  );

  useEffect(() => {
    refetchExportLogs();
  }, [columnFilters, refetchExportLogs]);

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
    <>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize='small' />}
        aria-label='breadcrumb'
        sx={{ mb: 3 }}>
        <Link
          underline='hover'
          color='inherit'
          onClick={() => navigate(ROUTES.DASHBOARD)}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <HomeOutlinedIcon sx={{ fontSize: 24 }} />
        </Link>
        <Typography color='text.primary'>Xuất hàng</Typography>
      </Breadcrumbs>
      <Card>
        <CardHeader
          title={
            <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
              Xuất hàng
            </Typography>
          }
          action={
            <ButtonWithTooltip
              variant='contained'
              onClick={() => navigate(`${ROUTES.INVENTORY}/export/create`)}
              title='Xuất hàng'
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
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                            onClick={(e) => handleFilterClick(e, headCell.id)}>
                            <FilterAltOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </>
                      ) : null}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingExportLogs ? (
                  <TableSkeleton rowsPerPage={rowsPerPage} columns={columns} />
                ) : exportLogsData?.data?.length ? (
                  exportLogsData?.data?.map((exportLog, index) => (
                    <TableRow key={exportLog.id || index}>
                      <TableCell align='center'>
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell>{exportLog?.warehouse?.name}</TableCell>
                      <TableCell>
                        <Box>
                          {exportLog?.items?.map((exportLogItem) => (
                            <ExportLogItem
                              key={exportLogItem?.sku?.id}
                              item={exportLogItem}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align='center'>
                        {importTypeMap?.[exportLog?.type] || 'Không xác định'}
                      </TableCell>
                      <TableCell align='center'>
                        {moment(exportLog?.createdAt).format('DD/MM/YYYY')}
                      </TableCell>
                      <TableCell align='center'>
                        {exportLog?.note?.length ? exportLog?.note : 'Không có'}
                      </TableCell>
                      <TableCell align='center'>
                        <ActionButton>
                          <Box>
                            <ButtonWithTooltip
                              color='primary'
                              variant='outlined'
                              title='Chi tiết'
                              placement='left'
                              onClick={() =>
                                navigate(
                                  `${ROUTES.INVENTORY_EXPORT}/${exportLog.id}`
                                )
                              }>
                              <VisibilityOutlinedIcon />
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
            count={exportLogsData?.meta?.total || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 30, 50]}
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
    </>
  );
};

export default InventoryExportList;
