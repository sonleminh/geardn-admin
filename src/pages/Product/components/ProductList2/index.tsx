import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useQueryClient } from '@tanstack/react-query';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
  Checkbox,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';

import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { AddCircleOutlined } from '@mui/icons-material';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import HtmlRenderBox from '@/components/HtmlRenderBox';
import ActionButton from '@/components/ActionButton';
import ExcelUpload from '@/components/ExcelUpload';
import TableFilter from '@/components/TableFilter';
import { TableSkeleton } from '@/components/TableSkeleton';

import useConfirmModal from '@/hooks/useModalConfirm';
import { useNotificationContext } from '@/contexts/NotificationContext';

import { ITagOptions } from '@/interfaces/IProduct';
import { ICategory } from '@/interfaces/ICategory';
import { QueryKeys } from '@/constants/query-key';
import { IQuery } from '@/interfaces/IQuery';
import { ColumnAlign, TableColumn } from '@/interfaces/ITableColumn';

import { useDeleteManyProduct, useGetProductList } from '@/services/product';
import { getBgColor } from '@/utils/getTagBgColor';
import { useGetCategoryList } from '@/services/category';
import { ROUTES } from '@/constants/route';

interface Data {
  stt: number;
  id: number;
  name: string;
  category: string;
  images: string;
  created_at: string;
  slug: string;
}

interface IProductQuery extends IQuery {
  category?: string[];
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
  category: string[];
}

// Constants
const INITIAL_COLUMN_FILTERS: ColumnFilters = {
  category: [],
};

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
    id: 'name',
    disablePadding: false,
    label: 'Tên sản phẩm',
    isFilter: false,
    width: '25%',
  },
  {
    id: 'category',
    disablePadding: false,
    label: 'Danh mục',
    isFilter: true,
    width: '18%',
  },
  {
    align: 'center',
    id: 'images',
    disablePadding: false,
    label: 'Ảnh',
    width: '10%',
  },
  {
    align: 'center',
    id: 'created_at',
    disablePadding: false,
    label: 'Ngày tạo',
    width: '15%',
  },
];

const columns: TableColumn[] = [
  { width: '60px', align: 'center', type: 'text' },
  { width: '250px', type: 'text' },
  { width: '180px', type: 'text' },
  { width: '100px', align: 'center', type: 'image' },
  { width: '150px', align: 'center', type: 'text' },
  { width: '150px', align: 'center', type: 'action' },
  { width: '100px', align: 'center', type: 'action' },
];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Custom hooks
const useFilterState = () => {
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [activeFilterColumn, setActiveFilterColumn] = useState<string>('');
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>(
    INITIAL_COLUMN_FILTERS
  );

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
    (column: string, value: string[]) => {
      setColumnFilters((prev) => ({
        ...prev,
        [column]: value,
      }));
    },
    []
  );

  return {
    filterAnchorEl,
    activeFilterColumn,
    columnFilters,
    handleFilterClick,
    handleFilterClose,
    handleColumnFilterChange,
  };
};

const usePagination = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  return {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
  };
};

// Components
interface FilterChipsProps {
  columnFilters: ColumnFilters;
  categoriesData: {
    data?: Array<ICategory>;
  };
  onFilterChange: (column: string, value: string[]) => void;
}

const FilterChips = ({
  columnFilters,
  categoriesData,
  onFilterChange,
}: FilterChipsProps) => {
  const getFilterLabels = useCallback(
    (filterKey: string, values: string[]) => {
      if (filterKey === 'category') {
        return values.map(
          (value: string) =>
            categoriesData?.data?.find((c) => c.id === +value)?.name || value
        );
      }
      return [];
    },
    [categoriesData?.data]
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <FilterListIcon />
      {Object.entries(columnFilters).map(([filterKey, filterValues]) => {
        const values = filterValues as string[];
        if (values.length === 0) return null;

        const filterLabels = getFilterLabels(filterKey, values);

        return filterLabels.map((label) => (
          <Chip
            key={`${filterKey}-${label}`}
            label={label}
            onDelete={() => {
              const newValues = values.filter((value: string) => {
                const itemLabel = categoriesData?.data?.find(
                  (c) => c.id === +value
                )?.name;
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

export default function ProductList2() {
  const navigate = useNavigate();
  const { confirmModal, showConfirmModal } = useConfirmModal();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();

  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Data>('stt');
  const [selected, setSelected] = useState<number[]>([]);

  const {
    filterAnchorEl,
    activeFilterColumn,
    columnFilters,
    handleFilterClick,
    handleFilterClose,
    handleColumnFilterChange,
  } = useFilterState();

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } =
    usePagination();
  console.log(page);

  const { data: categoriesData } = useGetCategoryList();
  const { data: productsData, isLoading } = useGetProductList({
    page: page + 1,
    limit: rowsPerPage,
    categories: columnFilters.category,
  });

  const delManyPrdMutation = useDeleteManyProduct();

  const handleRequestSort = (
    _: React.MouseEvent<unknown>,
    property: keyof Data
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = productsData?.data?.map((n) => n?.id);
      if (newSelected) {
        setSelected(newSelected);
      }
      return;
    }
    setSelected([]);
  };

  const handleClick = (_: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleDelete = () => {
    delManyPrdMutation.mutate(selected, {
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Product] });
        setSelected([]);
        showNotification('Xóa sản phẩm thành công', 'success');
      },
    });
  };

  const handleDetailClick = (row: Data) => {
    const detailPrd = productsData?.data?.find((prd) => prd.name === row.name);
    showConfirmModal({
      title: (
        <Typography sx={{ fontSize: 20, fontWeight: 'bold' }}>
          Chi tiết sản phẩm
        </Typography>
      ),
      content: (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex' }}>
            <Typography sx={{ width: 100, fontWeight: 500 }}>Tên:</Typography>
            <Typography>{detailPrd?.name}</Typography>
          </Box>
          <Box sx={{ display: 'flex' }}>
            <Typography sx={{ width: 100, fontWeight: 500 }}>
              Danh mục:
            </Typography>
            <Typography>{detailPrd?.category?.name}</Typography>
          </Box>
          <Box sx={{ display: 'flex' }}>
            <Typography sx={{ width: 100, fontWeight: 500 }}>Ảnh:</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {detailPrd?.images?.map((img) => (
                <Box
                  sx={{
                    height: 60,
                    '.thumbnail': {
                      width: 60,
                      height: 60,
                      objectFit: 'contain',
                      border: '1px solid #ccc',
                    },
                  }}
                  key={img}>
                  <img src={img} className='thumbnail' alt={detailPrd?.name} />
                </Box>
              ))}
            </Box>
          </Box>
          {detailPrd?.tags && detailPrd?.tags?.length > 0 && (
            <Box sx={{ display: 'flex' }}>
              <Typography sx={{ width: 100, fontWeight: 500 }}>
                Tags:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {detailPrd?.tags?.map((tag: ITagOptions) => (
                  <Box
                    key={tag.value}
                    sx={{
                      padding: '4px 8px',
                      bgcolor: getBgColor(tag.value),
                      color: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: 13,
                    }}>
                    {tag.label}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
          <Box sx={{ display: 'flex' }}>
            <Typography sx={{ width: 100, fontWeight: 500 }}>
              Chi tiết:
            </Typography>
            <Box>
              {Object.keys(detailPrd?.details || {}).length === 0 ? (
                <Typography>Không có</Typography>
              ) : (
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {detailPrd?.details.guarantee && (
                    <Typography>
                      - Bảo hành: {detailPrd?.details.guarantee}
                    </Typography>
                  )}
                  {detailPrd?.details.weight && (
                    <Typography>
                      - Trọng lượng: {detailPrd?.details.weight}
                    </Typography>
                  )}
                  {detailPrd?.details.material && (
                    <Typography>
                      - Chất liệu: {detailPrd?.details.material}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex' }}>
            <Typography sx={{ width: 100, fontWeight: 500 }}>Mô tả:</Typography>
            <Box sx={{ flex: 1 }}>
              <HtmlRenderBox html={detailPrd?.description ?? ''} />
            </Box>
          </Box>
        </Box>
      ),
      showBtnOk: false,
      cancelText: 'Đóng',
    });
  };

  const renderFilterContent = useCallback(() => {
    switch (activeFilterColumn) {
      case 'category':
        return (
          <TableFilter
            title='Lọc theo danh mục'
            options={
              categoriesData?.data?.map((category) => ({
                id: category.id,
                label: category.name,
              })) ?? []
            }
            selectedValues={columnFilters.category}
            onFilterChange={(newValues) =>
              handleColumnFilterChange('category', newValues)
            }
            onClose={handleFilterClose}
          />
        );
      default:
        return null;
    }
  }, [
    activeFilterColumn,
    categoriesData?.data,
    columnFilters.category,
    handleColumnFilterChange,
    handleFilterClose,
  ]);

  const rows = useMemo(
    () =>
      productsData?.data?.map((product, index) => ({
        stt: index + 1,
        id: product.id,
        name: product.name,
        category: product.category?.name || '',
        images: product.images[0] || '',
        created_at: moment(product?.createdAt)?.format('DD/MM/YYYY'),
        slug: product.slug,
      })) || [],
    [productsData]
  );

  const visibleRows = useMemo(
    () => rows.sort(getComparator(order, orderBy)),
    [order, orderBy, rows]
  );

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => navigate(ROUTES.PRODUCT)} sx={{ mr: 1 }}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
              Danh sách sản phẩm
            </Typography>
          </Box>
        }
        action={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <ExcelUpload />
            <ButtonWithTooltip
              variant='contained'
              onClick={() => navigate('create')}
              title='Thêm sản phẩm'
              sx={{ textTransform: 'none' }}>
              <AddCircleOutlined />
            </ButtonWithTooltip>
          </Box>
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
                      categoriesData={categoriesData || { data: [] }}
                      onFilterChange={handleColumnFilterChange}
                    />
                  </Box>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding='checkbox'>
                  <Checkbox
                    color='primary'
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < (productsData?.meta?.total || 0)
                    }
                    checked={
                      productsData?.meta?.total
                        ? selected.length === productsData.meta.total
                        : false
                    }
                    onChange={handleSelectAllClick}
                    inputProps={{
                      'aria-label': 'select all products',
                    }}
                  />
                </TableCell>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.align ?? 'left'}
                    padding={headCell.disablePadding ? 'none' : 'normal'}
                    sortDirection={orderBy === headCell.id ? order : false}
                    sx={{ width: headCell.width }}>
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={(e) => handleRequestSort(e, headCell.id)}>
                      {headCell.label}
                      {orderBy === headCell.id ? (
                        <Box component='span' sx={visuallyHidden}>
                          {order === 'desc'
                            ? 'sorted descending'
                            : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
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
              {isLoading ? (
                <TableSkeleton rowsPerPage={rowsPerPage} columns={columns} />
              ) : visibleRows?.length ? (
                visibleRows.map((row, index) => {
                  const isItemSelected = selected.includes(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      role='checkbox'
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                      sx={{ cursor: 'pointer' }}>
                      <TableCell padding='checkbox'>
                        <Checkbox
                          color='primary'
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                      <TableCell align='center'>{row.stt}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell align='center'>
                        <Box
                          sx={{
                            height: 80,
                            '.thumbnail': {
                              width: 80,
                              height: 80,
                              objectFit: 'contain',
                            },
                          }}>
                          <img
                            src={row.images}
                            className='thumbnail'
                            alt={row.name}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align='center'>{row.created_at}</TableCell>
                      <TableCell align='center'>
                        <Box onClick={(e) => e.stopPropagation()}>
                          <ActionButton>
                            <Box mb={1}>
                              <ButtonWithTooltip
                                color='primary'
                                variant='outlined'
                                title='Chi tiết'
                                placement='left'
                                onClick={() => handleDetailClick(row)}>
                                <InfoOutlinedIcon />
                              </ButtonWithTooltip>
                            </Box>
                            <Box>
                              <ButtonWithTooltip
                                color='primary'
                                onClick={() => navigate(`update/${row.id}`)}
                                variant='outlined'
                                title='Chỉnh sửa'
                                placement='left'>
                                <EditOutlinedIcon />
                              </ButtonWithTooltip>
                            </Box>
                          </ActionButton>
                        </Box>
                      </TableCell>
                      <TableCell align='center'>
                        <Button
                          variant='contained'
                          onClick={(e) => {
                            navigate(`/product/${row.slug}`);
                            e.stopPropagation();
                          }}>
                          <KeyboardReturnIcon />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell align='center' colSpan={headCells.length + 1}>
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component='div'
          count={productsData?.meta?.total || 0}
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

      {confirmModal()}
    </Card>
  );
}
