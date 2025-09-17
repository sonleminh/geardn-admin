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
  InputAdornment,
  Link,
  Popover,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import ActionButton from '@/components/ActionButton';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import ExcelUpload from '@/components/ExcelUpload';
import SuspenseLoader from '@/components/SuspenseLoader';
import TableFilter from '@/components/TableFilter';
import { TableSkeleton } from '@/components/TableSkeleton';
import { AddCircleOutlined } from '@mui/icons-material';
import AutoDeleteOutlinedIcon from '@mui/icons-material/AutoDeleteOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ListAltIcon from '@mui/icons-material/ListAlt';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search';
import { FiPackage } from 'react-icons/fi';

import { useAlertContext } from '@/contexts/AlertContext';
import useConfirmModal from '@/hooks/useModalConfirm';

import { ICategory } from '@/interfaces/ICategory';
import { ColumnAlign, TableColumn } from '@/interfaces/ITableColumn';

import { QueryKeys } from '@/constants/query-key';
import { ROUTES } from '@/constants/route';
import { IEnum } from '@/interfaces/IEnum';
import { useGetCategoryList } from '@/services/category';
import { useGetEnumByContext } from '@/services/enum';
import {
  useDeleteProduct,
  useGetProductList,
  useUpdateProductIsVisible,
} from '@/services/product';
import { truncateTextByLine } from '@/utils/css-helper.util';

interface Data {
  stt: number;
  id: number;
  name: string;
  image: string;
  variation: string;
  category: string;
  stock: number;
  status: string;
  isVisible: boolean;
  createdAt: string;
  isDeleted: string;
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
  status: string[];
}

const INITIAL_COLUMN_FILTERS: ColumnFilters = {
  category: [],
  status: [],
};

const headCells: readonly HeadCell[] = [
  {
    align: 'center',
    id: 'stt',
    disablePadding: false,
    label: 'STT',
    isFilter: false,
    width: '5%',
  },
  {
    id: 'name',
    disablePadding: false,
    label: 'Tên sản phẩm',
    isFilter: false,
    width: '26%',
  },
  {
    align: 'center',
    id: 'image',
    disablePadding: false,
    label: 'Ảnh',
    width: '8%',
  },
  {
    id: 'variation',
    disablePadding: false,
    align: 'center',
    label: 'Biến thế',
    width: '10%',
  },
  {
    id: 'category',
    disablePadding: false,
    align: 'center',
    label: 'Danh mục',
    isFilter: true,
    width: '13%',
  },
  {
    id: 'stock',
    disablePadding: false,
    align: 'center',
    label: 'Tồn kho',
    width: '8%',
  },
  {
    align: 'center',
    id: 'status',
    disablePadding: false,
    label: 'Trạng thái',
    width: '14%',
    isFilter: true,
  },
  {
    align: 'center',
    id: 'isVisible',
    disablePadding: false,
    label: 'Hiển thị',
    width: '8%',
  },
  {
    align: 'center',
    id: 'action',
    disablePadding: false,
    label: 'Hành động',
    width: '8%',
  },
];

const columns: TableColumn[] = [
  { width: '50px', align: 'center', type: 'text' },
  { width: '280px', type: 'text' },
  { width: '100px', align: 'center', type: 'image' },
  { width: '130px', type: 'text' },
  { width: '100px', align: 'center', type: 'text' },
  { width: '100px', align: 'center', type: 'text' },
  { width: '100px', align: 'center', type: 'text' },
  { width: '100px', align: 'center', type: 'text' },
  { width: '100px', align: 'center', type: 'action' },
];

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

interface FilterChipsProps {
  columnFilters: ColumnFilters;
  categoriesData: {
    data?: Array<ICategory>;
  };
  productStatusEnumData: {
    data?: Array<IEnum>;
  };
  onFilterChange: (column: string, value: string[]) => void;
}

const FilterChips = ({
  columnFilters,
  categoriesData,
  productStatusEnumData,
  onFilterChange,
}: FilterChipsProps) => {
  const getFilterLabels = useCallback(
    (filterKey: string, values: string[]) => {
      if (filterKey === 'category') {
        return values.map(
          (value: string) =>
            categoriesData?.data?.find((c) => c.id === +value)?.name || value
        );
      } else if (filterKey === 'status') {
        return values.map(
          (value: string) =>
            productStatusEnumData?.data?.find((e) => e.value === value)
              ?.label || value
        );
      }
      return [];
    },
    [categoriesData?.data, productStatusEnumData?.data]
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

export default function ProductList() {
  const navigate = useNavigate();
  const { confirmModal, showConfirmModal } = useConfirmModal();
  const queryClient = useQueryClient();
  const { showAlert } = useAlertContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [updateIsVisibleId, setUpdateIsVisibleId] = useState<number | null>(
    null
  );

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

  const { data: categoriesData } = useGetCategoryList();
  const { data: productsData, isLoading } = useGetProductList({
    page: page + 1,
    limit: rowsPerPage,
    search: searchQuery,
    categoryIds: columnFilters.category,
    statuses: columnFilters.status,
    isDeleted: 'false',
  });
  const {
    mutate: updateProductIsVisibleMutate,
    isPending: isUpdatingIsVisible,
  } = useUpdateProductIsVisible();
  const { mutate: deleteProductMutate, isPending: isDeleting } =
    useDeleteProduct();
  const { data: productStatusEnumData } = useGetEnumByContext('product-status');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleDelete = (id: number) => {
    deleteProductMutate(id, {
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Product] });
        showAlert('Xóa sản phẩm thành công', 'success');
      },
    });
  };

  const handleUpdateIsVisible = (id: number, isVisible: boolean) => {
    setUpdateIsVisibleId(id);
    updateProductIsVisibleMutate(
      { id, isVisible },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [QueryKeys.Product] });
          showAlert('Cập nhật trạng thái hiển thị thành công', 'success');
        },
        onError: () => {
          showAlert('Cập nhật trạng thái hiển thị thất bại', 'error');
        },
      }
    );
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
      case 'status':
        return (
          <TableFilter
            title='Lọc theo trạng thái'
            options={
              productStatusEnumData?.data?.map((status) => ({
                id: status.value,
                label: status.label,
              })) ?? []
            }
            selectedValues={columnFilters.status}
            onFilterChange={(newValues) =>
              handleColumnFilterChange('status', newValues)
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
    productStatusEnumData?.data,
    columnFilters.status,
  ]);

  const statusMap = useMemo(
    () =>
      Object.fromEntries(
        productStatusEnumData?.data?.map((item) => [item.value, item.label]) ??
          []
      ),
    [productStatusEnumData?.data]
  );

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
        <Typography color='text.primary'>Danh sách sản phẩm</Typography>
      </Breadcrumbs>
      <Card sx={{ mt: 3, borderRadius: 2 }}>
        <CardHeader
          title={
            <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
              Danh sách sản phẩm
            </Typography>
          }
          action={
            <Box sx={{ display: 'flex', gap: 2 }}>
              <ExcelUpload />
              <ButtonWithTooltip
                variant='outlined'
                onClick={() => navigate('deleted')}
                title='Đã xoá'
                sx={{ textTransform: 'none' }}>
                <AutoDeleteOutlinedIcon />
              </ButtonWithTooltip>
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
        <CardContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={headCells.length} sx={{ px: 0 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 2,
                      }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                        <FilterChips
                          columnFilters={columnFilters}
                          categoriesData={categoriesData || { data: [] }}
                          productStatusEnumData={
                            productStatusEnumData || { data: [] }
                          }
                          onFilterChange={handleColumnFilterChange}
                        />
                      </Box>
                    </Box>
                    <Box>
                      <TextField
                        fullWidth
                        size='small'
                        placeholder='Tìm kiếm sản phẩm...'
                        value={searchQuery}
                        onChange={handleSearchChange}
                        sx={{
                          '& .MuiInputBase-root': {
                            minHeight: 40,
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
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
                {isLoading ? (
                  <TableSkeleton rowsPerPage={rowsPerPage} columns={columns} />
                ) : productsData?.data?.length ? (
                  productsData?.data?.map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell align='center'>
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: 14,
                            color: '#000',
                            ...truncateTextByLine(2),
                          }}>
                          {product.name}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Box
                          sx={{
                            height: 48,
                            img: {
                              width: 48,
                              height: 48,
                              mr: 1,
                              objectFit: 'contain',
                            },
                          }}>
                          <img src={product?.images?.[0]} alt={product?.name} />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Link
                          component={RouterLink}
                          to={`${ROUTES.PRODUCT}/${product.id}/sku`}
                          sx={{
                            py: 0.5,
                            bgcolor: '#f8f8f8',
                            color: '#3e3e3e',
                            border: '1px solid #cccccc',
                            borderRadius: 1,
                            fontSize: 13,
                            textAlign: 'center',
                            textDecoration: 'none',
                            ...truncateTextByLine(1),
                            '&:hover': {
                              bgcolor: '#eeeeee',
                            },
                          }}>
                          {product.skus.length} biến thể
                        </Link>
                      </TableCell>

                      <TableCell align='center'>
                        <Typography
                          sx={{
                            fontSize: 14,
                            color: '#000',
                            ...truncateTextByLine(2),
                          }}>
                          {product.category?.name}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 1.5,
                          }}>
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              mb: 0.3,
                              fontSize: 24,
                            }}>
                            <FiPackage />
                          </Box>
                          <Typography>{product?.totalStock}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align='center'>
                        <Button
                          variant='outlined'
                          color={
                            product?.status === 'ACTIVE'
                              ? 'success'
                              : product?.status === 'DRAFT'
                              ? 'primary'
                              : product?.status === 'DISCONTINUED'
                              ? 'warning'
                              : 'error'
                          }
                          size='small'
                          sx={{
                            width: 120,
                            fontSize: 13,
                            textTransform: 'none',
                          }}>
                          {statusMap?.[product?.status] || 'Không xác định'}
                        </Button>
                      </TableCell>

                      <TableCell align='center'>
                        <Switch
                          color='primary'
                          checked={product?.isVisible}
                          onChange={(_, checked) =>
                            handleUpdateIsVisible(product.id, checked)
                          }
                          disabled={
                            isUpdatingIsVisible &&
                            product.id === updateIsVisibleId
                          }
                        />
                      </TableCell>
                      <TableCell align='center'>
                        <ActionButton>
                          <Box mb={1}>
                            <ButtonWithTooltip
                              color='primary'
                              variant='outlined'
                              title='Xem chi tiết'
                              placement='left'
                              onClick={() => navigate(`${product.id}`)}>
                              <InfoOutlinedIcon />
                            </ButtonWithTooltip>
                          </Box>
                          <Box mb={1}>
                            <ButtonWithTooltip
                              color='primary'
                              variant='outlined'
                              title='Danh sách mã hàng'
                              placement='left'
                              onClick={() => navigate(`${product.id}/sku`)}>
                              <ListAltIcon />
                            </ButtonWithTooltip>
                          </Box>
                          <Box mb={1}>
                            <ButtonWithTooltip
                              color='primary'
                              variant='outlined'
                              title='Chỉnh sửa'
                              placement='left'
                              onClick={() => navigate(`update/${product.id}`)}>
                              <EditOutlinedIcon />
                            </ButtonWithTooltip>
                          </Box>
                          <ButtonWithTooltip
                            color='error'
                            variant='outlined'
                            title='Xoá'
                            placement='left'
                            onClick={() =>
                              showConfirmModal({
                                title: 'Xoá sản phẩm',
                                content:
                                  'Bạn có chắc chắn muốn xoá sản phẩm này?',
                                onOk: () => handleDelete(product?.id),
                              })
                            }>
                            <DeleteOutlineOutlinedIcon />
                          </ButtonWithTooltip>
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
      {isDeleting && <SuspenseLoader />}
    </>
  );
}
