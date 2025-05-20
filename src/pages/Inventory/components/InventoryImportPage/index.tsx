import { ChangeEvent, useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Input from '@/components/Input';
import SuspenseLoader from '@/components/SuspenseLoader';

import { QueryKeys } from '@/constants/query-key';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';

import { ROUTES } from '@/constants/route';

import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormHelperText,
  Grid2,
  InputLabel,
  MenuItem,
  Paper,
  Popper,
  Select,
  SelectChangeEvent,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Theme,
  Typography,
  IconButton,
  Popover,
  Checkbox,
  ListItemText,
  DialogActions,
  Chip,
} from '@mui/material';
import { createSchema, updateSchema } from '../utils/schema/warehouseSchema';
import { useGetEnumByContext } from '@/services/enum';
import { useGetProductList } from '@/services/product';
import { useGetSkusByProductId } from '@/services/sku';
import { IProductSku } from '@/interfaces/IProductSku';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { formatPrice } from '@/utils/format-price';
import { truncateTextByLine } from '@/utils/css-helper.util';
import { useGetWarehouseList } from '@/services/warehouse';
import { useCreateImportLog, useGetImportLogList } from '@/services/inventory';
import moment from 'moment';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import ActionButton from '@/components/ActionButton';
import { AddCircleOutlined } from '@mui/icons-material';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { IImportLogItem } from '@/interfaces/IImportLog';
import TableFilter from '@/components/TableFilter';
import { IEnum } from '@/interfaces/IEnum';
import { DateRangePicker } from 'react-date-range';
import { addDays } from 'date-fns';
interface IImportItem {
  sku: IProductSku;
  quantity: string;
  price: string;
}

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
}

const headCells: readonly HeadCell[] = [
  {
    align: 'center',
    id: 'stt',
    disablePadding: false,
    label: 'STT',
    isFilter: false,
  },
  {
    align: 'center',
    id: 'warehouse',
    disablePadding: false,
    label: 'Kho',
    isFilter: true,
  },
  {
    id: 'items',
    disablePadding: false,
    label: 'Sản phẩm',
    isFilter: true,
  },
  {
    align: 'center',
    id: 'type',
    disablePadding: false,
    label: 'Loại',
    isFilter: true,
  },
  {
    align: 'center',
    id: 'createdAt',
    disablePadding: false,
    label: 'Ngày nhập',
  },
  {
    align: 'center',
    id: 'note',
    disablePadding: false,
    label: 'Ghi chú',
  },
  {
    align: 'center',
    id: 'action',
    disablePadding: false,
    label: 'Hành động',
  },
];

const InventoryImportPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();

  const [productId, setProductId] = useState<number>();
  const [skuId, setSkuId] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [isEditItem, setIsEditItem] = useState<boolean>(false);
  const [editItemIndex, setEditItemIndex] = useState<number | null>(null);
  const [importItems, setImportItems] = useState<IImportItem[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [activeFilterColumn, setActiveFilterColumn] = useState<string>('');
  const [columnFilters, setColumnFilters] = useState<{
    warehouse: string[];
    items: string[];
    type: string[];
    // date: { start: string; end: string };
  }>({
    warehouse: [],
    items: [],
    type: [],
    // date: { start: '', end: '' },
  });

  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: 'selection',
    },
  ]);

  console.log('columnFilters', columnFilters);

  const { data: warehousesData } = useGetWarehouseList();
  const { data: productsData } = useGetProductList();

  const { data: enumData } = useGetEnumByContext('import-type');

  const { data: importLogsData, refetch: refetchImportLogs } =
    useGetImportLogList({
      warehouseIds: columnFilters.warehouse,
      productIds: columnFilters.items,
      types: columnFilters.type,
      // startDate: columnFilters.date.start,
      // endDate: columnFilters.date.end,
    });

  const { data: skusData } = useGetSkusByProductId(productId);

  const handleSkuSelect = (event: SelectChangeEvent<string>) => {
    setSkuId(event.target.value);
  };

  const handleSaveItem = () => {
    const isAlreadySelected = importItems.some((item) => {
      return item?.sku?.id === +skuId;
    });
    if (isAlreadySelected && !isEditItem) {
      return showNotification('Sku đã tồn tại', 'error');
    }

    const sku = skusData?.data?.find((sku) => sku?.id === +skuId);

    if (editItemIndex !== null && sku && skuId) {
      const updatedImportItems = importItems;
      updatedImportItems[editItemIndex] = {
        sku: sku,
        price: price,
        quantity: quantity,
      };
      setImportItems(updatedImportItems);
      setProductId(undefined);
      setSkuId('');
      setPrice('');
      setQuantity('');
    } else {
      if (sku && skuId && quantity && price) {
        setImportItems((prev) => [
          ...prev,
          { sku: sku, quantity: quantity, price: price },
        ]);
      }
      setProductId(undefined);
      setSkuId('');
      setPrice('');
      setQuantity('');
    }
  };

  const handleEditImportItem = (item: IImportItem, index: number) => {
    setIsEditItem(true);
    setProductId(item?.sku?.product?.id);
    setSkuId(item?.sku?.id?.toString() ?? '');
    setPrice(item?.price.toString() ?? '');
    setQuantity(item?.quantity.toString() ?? '');
    setEditItemIndex(index);
  };

  const handleDeleteImportItem = (itemIndex: number) => {
    const updAttributeList = importItems?.filter(
      (_, index) => index !== itemIndex
    );
    if (updAttributeList?.length === 0) {
      setIsEditItem(false);
    }
    setImportItems(updAttributeList);
  };

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
    value: string | string[] | { start: string; end: string }
  ) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
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
                    sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {Object.entries(columnFilters).map(
                        ([filterKey, filterValues]) => {
                          if (filterValues.length === 0) return null;

                          let filterLabels: string[] = [];
                          if (filterKey === 'warehouse') {
                            filterLabels = filterValues.map(
                              (value) =>
                                warehousesData?.data?.find(
                                  (w) => w.id === +value
                                )?.name || value
                            );
                          } else if (filterKey === 'items') {
                            filterLabels = filterValues.map(
                              (value) =>
                                productsData?.data?.find((p) => p.id === +value)
                                  ?.name || value
                            );
                          } else if (filterKey === 'type') {
                            filterLabels = filterValues.map(
                              (value) =>
                                enumData?.data?.find((e) => e.value === value)
                                  ?.label || value
                            );
                          }

                          return filterLabels.map((label) => (
                            <Chip
                              key={`${filterKey}-${label}`}
                              label={label}
                              onDelete={() => {
                                const newValues = filterValues.filter(
                                  (value) => {
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
                            />
                          ));
                        }
                      )}
                      {Object.values(columnFilters).some(
                        (values) => values.length > 0
                      ) && (
                        <Button
                          size='small'
                          onClick={() => {
                            setColumnFilters({
                              warehouse: [],
                              items: [],
                              type: [],
                            });
                          }}>
                          Clear
                        </Button>
                      )}
                    </Box>
                    <DateRangePicker
                      onChange={(item) => setState([item.selection])}
                      showSelectionPreview={true}
                      moveRangeOnFirstSelection={false}
                      months={2}
                      ranges={state}
                      direction='horizontal'
                    />
                  </Box>
                </TableCell>
              </TableRow>
              <TableRow>
                {headCells?.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.align ?? 'left'}
                    padding={headCell.disablePadding ? 'none' : 'normal'}>
                    {headCell.label}
                    {headCell.isFilter ? (
                      <>
                        {' '}
                        {columnFilters[
                          headCell.id as keyof typeof columnFilters
                        ]?.length > 0 && (
                          <Typography component='span' sx={{ fontSize: 14 }}>
                            (
                            {
                              columnFilters[
                                headCell.id as keyof typeof columnFilters
                              ].length
                            }
                            )
                          </Typography>
                        )}
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
              {importLogsData?.data?.length ? (
                importLogsData?.data?.map((importLog, index) => (
                  <TableRow key={index}>
                    <TableCell align='center'>{index + 1}</TableCell>
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
                              {/* {importLogItem?.sku?.productSkuAttributes
                                ?.length && ':'} */}
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

      {/* {isCreatePending && <SuspenseLoader />} */}
    </Card>
  );
};

export default InventoryImportPage;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
