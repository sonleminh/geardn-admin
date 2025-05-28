import {
  Box,
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
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AddCircleOutlined } from '@mui/icons-material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';

import ActionButton from '@/components/ActionButton';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import ExcelUpload from '@/components/ExcelUpload';
import TableFilter from '@/components/TableFilter';
import { TableSkeleton } from '@/components/TableSkeleton';

import { useNotificationContext } from '@/contexts/NotificationContext';
import useConfirmModal from '@/hooks/useModalConfirm';

import { ICategory } from '@/interfaces/ICategory';
import { IProduct } from '@/interfaces/IProduct';
import { ColumnAlign, TableColumn } from '@/interfaces/ITableColumn';

import { ROUTES } from '@/constants/route';
import { useGetCategoryList } from '@/services/category';
import { useGetProductList } from '@/services/product';

interface Data {
  stt: number;
  id: number;
  name: string;
  category: string;
  image: string;
  createdAt: string;
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
    align: 'center',
    label: 'Danh mục',
    isFilter: true,
    width: '18%',
  },
  {
    align: 'center',
    id: 'image',
    disablePadding: false,
    label: 'Ảnh',
    width: '10%',
  },
  {
    align: 'center',
    id: 'createdAt',
    disablePadding: false,
    label: 'Ngày tạo',
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

  // const handleDelete = () => {
  //   delManyPrdMutation.mutate(selected, {
  //     onSuccess() {
  //       queryClient.invalidateQueries({ queryKey: [QueryKeys.Product] });
  //       setSelected([]);
  //       showNotification('Xóa sản phẩm thành công', 'success');
  //     },
  //   });
  // };

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
              {isLoading ? (
                <TableSkeleton rowsPerPage={rowsPerPage} columns={columns} />
              ) : productsData?.data?.length ? (
                productsData?.data?.map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell align='center'>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell>
                      <Typography>{product.name}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography>{product.category?.name}</Typography>
                    </TableCell>
                    <TableCell align='center'>
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
                          src={product?.images?.[0]}
                          className='thumbnail'
                          alt={product?.name}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography>
                        {moment(product?.createdAt).format('DD/MM/YYYY')}
                      </Typography>
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
