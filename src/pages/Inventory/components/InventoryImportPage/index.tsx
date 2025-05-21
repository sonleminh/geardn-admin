import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SuspenseLoader from '@/components/SuspenseLoader';

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
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
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
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Typography,
  TablePagination,
  Skeleton,
} from '@mui/material';
import { addDays } from 'date-fns';
import moment from 'moment';
import { DateRangePicker } from 'react-date-range';

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
    align: 'center',
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

type ColumnFilterValue = string[] | { fromDate: string; toDate: string };

interface ColumnFilters {
  warehouse: string[];
  items: string[];
  type: string[];
  date: { fromDate: string; toDate: string };
}

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

  const { data: warehousesData } = useGetWarehouseList();
  const { data: productsData } = useGetProductList();

  const { data: enumData } = useGetEnumByContext('import-type');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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

  const handleFilterClick = (
    event: React.MouseEvent<HTMLElement>,
    column: string
  ) => {
    setFilterAnchorEl(event.currentTarget);
    setActiveFilterColumn(column);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
    setActiveFilterColumn('');
  };

  const handleColumnFilterChange = (
    column: string,
    value: string | string[] | { fromDate: string; toDate: string }
  ) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  const handleDateRangeChange = (item: {
    selection: { startDate: Date; endDate: Date };
  }) => {
    setDateState([{ ...item.selection, key: 'selection' }]);

    // Set start date to beginning of day (00:00:00) in UTC
    const fromDate = new Date(
      Date.UTC(
        item.selection.startDate.getFullYear(),
        item.selection.startDate.getMonth(),
        item.selection.startDate.getDate(),
        0,
        0,
        0,
        0
      )
    );

    // Set end date to end of day (23:59:59) in UTC
    const toDate = new Date(
      Date.UTC(
        item.selection.endDate.getFullYear(),
        item.selection.endDate.getMonth(),
        item.selection.endDate.getDate(),
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
  };

  const handleDateFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setDateFilterAnchorEl(event.currentTarget);
  };

  const handleDateFilterClose = () => {
    setDateFilterAnchorEl(null);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    refetchImportLogs();
  }, [columnFilters, refetchImportLogs]);

  const renderFilterContent = () => {
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
  };

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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FilterListIcon />
                      {Object.entries(columnFilters).map(
                        ([filterKey, filterValues]) => {
                          if (filterKey === 'date') {
                            const dateValues = filterValues as {
                              fromDate: string;
                              toDate: string;
                            };
                            if (!dateValues.fromDate || !dateValues.toDate)
                              return null;
                            return (
                              <Chip
                                key='date-filter'
                                label={`${moment(dateValues.fromDate).format(
                                  'DD/MM/YYYY'
                                )} - ${moment(dateValues.toDate).format(
                                  'DD/MM/YYYY'
                                )}`}
                                onDelete={() => {
                                  setColumnFilters((prev) => ({
                                    ...prev,
                                    date: { fromDate: '', toDate: '' },
                                  }));
                                }}
                                size='small'
                              />
                            );
                          }

                          const values = filterValues as string[];
                          if (values.length === 0) return null;

                          let filterLabels: string[] = [];
                          if (filterKey === 'warehouse') {
                            filterLabels = values.map(
                              (value: string) =>
                                warehousesData?.data?.find(
                                  (w) => w.id === +value
                                )?.name || value
                            );
                          } else if (filterKey === 'items') {
                            filterLabels = values.map(
                              (value: string) =>
                                productsData?.data?.find((p) => p.id === +value)
                                  ?.name || value
                            );
                          } else if (filterKey === 'type') {
                            filterLabels = values.map(
                              (value: string) =>
                                enumData?.data?.find((e) => e.value === value)
                                  ?.label || value
                            );
                          }

                          return filterLabels.map((label) => (
                            <Chip
                              key={`${filterKey}-${label}`}
                              label={label}
                              onDelete={() => {
                                const newValues = values.filter(
                                  (value: string) => {
                                    const itemLabel =
                                      filterKey === 'warehouse'
                                        ? warehousesData?.data?.find(
                                            (w) => w.id === +value
                                          )?.name
                                        : filterKey === 'items'
                                        ? productsData?.data?.find(
                                            (p) => p.id === +value
                                          )?.name
                                        : enumData?.data?.find(
                                            (e) => e.value === value
                                          )?.label;
                                    return itemLabel !== label;
                                  }
                                );
                                handleColumnFilterChange(filterKey, newValues);
                              }}
                              size='small'
                              sx={{ maxWidth: 120 }}
                            />
                          ));
                        }
                      )}
                      {Object.values(columnFilters).some(
                        (values: ColumnFilterValue) => {
                          if (
                            typeof values === 'object' &&
                            'fromDate' in values
                          ) {
                            return (
                              values.fromDate !== '' && values.toDate !== ''
                            );
                          }
                          return Array.isArray(values) && values.length > 0;
                        }
                      ) && (
                        <Button
                          variant='outlined'
                          size='small'
                          sx={{ textTransform: 'none' }}
                          onClick={() => {
                            setColumnFilters({
                              warehouse: [],
                              items: [],
                              type: [],
                              date: { fromDate: '', toDate: '' },
                            });
                          }}>
                          <FilterListOffIcon sx={{ mr: 0.5, fontSize: 16 }} />
                          Xóa bộ lọc
                        </Button>
                      )}
                    </Box>
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
              {isLoadingImportLogs ? (
                Array.from(new Array(rowsPerPage)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell
                      align='center'
                      padding='normal'
                      sx={{ width: '60px' }}>
                      <Skeleton width={30} />
                    </TableCell>
                    <TableCell padding='normal' sx={{ width: '120px' }}>
                      <Skeleton width={100} />
                    </TableCell>
                    <TableCell padding='normal' sx={{ width: '400px' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}>
                        {Array.from(new Array(1)).map((_, itemIndex) => (
                          <Box
                            key={itemIndex}
                            sx={{
                              display: 'flex',
                              p: 1,
                              bgcolor: '#fafafa',
                              border: '1px solid #dadada',
                              borderRadius: 1,
                            }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}>
                              <Skeleton
                                variant='rectangular'
                                width={40}
                                height={40}
                              />
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 0.5,
                                }}>
                                <Skeleton width={80} />
                                <Skeleton width={60} />
                                <Skeleton width={70} />
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell
                      align='center'
                      padding='normal'
                      sx={{ width: '120px' }}>
                      <Skeleton width={80} />
                    </TableCell>
                    <TableCell
                      align='center'
                      padding='normal'
                      sx={{ width: '120px' }}>
                      <Skeleton width={100} />
                    </TableCell>
                    <TableCell
                      align='center'
                      padding='normal'
                      sx={{ width: '150px' }}>
                      <Skeleton width={60} />
                    </TableCell>
                    <TableCell
                      align='center'
                      padding='normal'
                      sx={{ width: '150px' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                          alignItems: 'center',
                        }}>
                        <Skeleton
                          variant='rectangular'
                          width={32}
                          height={32}
                        />
                        <Skeleton
                          variant='rectangular'
                          width={32}
                          height={32}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : importLogsData?.data?.length ? (
                importLogsData?.data?.map((importLog, index) => (
                  <TableRow key={index}>
                    <TableCell align='center'>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell>{importLog?.warehouse?.name}</TableCell>
                    <TableCell>
                      <Box sx={{}}>
                        {importLog?.items?.map((importLogItem) => (
                          <Box
                            key={importLogItem?.sku?.id}
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
                                src={
                                  importLogItem?.sku?.imageUrl ??
                                  importLogItem?.sku?.product?.images?.[0]
                                }
                                className='thumbnail'
                              />
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                              }}>
                              <Typography
                                sx={{
                                  width: 80,
                                  fontSize: 14,
                                  fontWeight: 500,
                                  ...truncateTextByLine(1),
                                }}>
                                {importLogItem?.sku?.product?.name}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                }}>
                                <Typography sx={{ fontSize: 13 }}>
                                  SL: {importLogItem?.quantity}
                                </Typography>
                                <Typography sx={{ fontSize: 13 }}>
                                  Giá nhập:{' '}
                                  {formatPrice(importLogItem?.costPrice)}
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
                              {importLogItem?.sku?.productSkuAttributes?.length
                                ? importLogItem?.sku?.productSkuAttributes?.map(
                                    (item) => (
                                      <Typography
                                        key={item?.id}
                                        sx={{ fontSize: 13 }}>
                                        {item?.attributeValue?.attribute?.label}
                                        : {item?.attributeValue?.value}
                                      </Typography>
                                    )
                                  )
                                : ''}
                            </Box>
                          </Box>
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
                            // onClick={() => navigate(`update/${item?.}`)}
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
          onChange={(item: any) => {
            handleDateRangeChange({
              selection: {
                startDate: item.selection.startDate,
                endDate: item.selection.endDate,
              },
            });
          }}
          moveRangeOnFirstSelection={false}
          months={2}
          ranges={[
            {
              startDate: new Date(dateState[0].startDate),
              endDate: new Date(dateState[0].endDate),
              key: 'selection',
            },
          ]}
          direction='horizontal'
        />
      </Popover>

      {/* {isLoadingImportLogs && <SuspenseLoader />} */}
    </Card>
  );
};

export default InventoryImportPage;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
