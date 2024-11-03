import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useQueryClient } from '@tanstack/react-query';
import {
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Tooltip,
  Typography,
  Paper,
  Box,
  Checkbox,
  IconButton,
  Grid2,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { AddCircleOutlined } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';

import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import HtmlRenderBox from '@/components/HtmlRenderBox';
import ActionButton from '@/components/ActionButton';
import ExcelUpload from '@/components/ExcelUpload';

import useConfirmModal from '@/hooks/useModalConfirm';
import { useNotificationContext } from '@/contexts/NotificationContext';

import { ITagOptions } from '@/interfaces/IProduct';
import { ICategory } from '@/interfaces/ICategory';
import { QueryKeys } from '@/constants/query-key';
import { IQuery } from '@/interfaces/IQuery';

import {
  useDeleteManyProduct,
  useGetProductByCategory,
  useGetProductList,
} from '@/services/product';
import { getBgColor } from '@/utils/getTagBgColor';

interface Data {
  stt: number;
  name: string;
  category: string;
  images: string;
  created_at: string;
}

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

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler =
    (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding='checkbox'>
          <Checkbox
            color='primary'
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all desserts',
            }}
          />
        </TableCell>
        <TableCell
          align={'center'}
          padding={'none'}
          sortDirection={orderBy === 'stt' ? order : false}>
          <TableSortLabel
            active={orderBy === 'stt'}
            direction={orderBy === 'stt' ? order : 'asc'}
            onClick={createSortHandler('stt')}>
            STT
            {orderBy === 'stt' ? (
              <Box component='span' sx={visuallyHidden}>
                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
              </Box>
            ) : null}
          </TableSortLabel>
        </TableCell>
        <TableCell
          align={'center'}
          padding={'none'}
          sortDirection={orderBy === 'name' ? order : false}>
          <TableSortLabel
            active={orderBy === 'name'}
            direction={orderBy === 'name' ? order : 'asc'}
            onClick={createSortHandler('name')}>
            Tên sản phẩm
            {orderBy === 'name' ? (
              <Box component='span' sx={visuallyHidden}>
                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
              </Box>
            ) : null}
          </TableSortLabel>
        </TableCell>
        <TableCell
          align={'center'}
          padding={'none'}
          sx={{ width: '18%' }}
          sortDirection={orderBy === 'category' ? order : false}>
          <TableSortLabel
            active={orderBy === 'category'}
            direction={orderBy === 'category' ? order : 'asc'}
            onClick={createSortHandler('category')}>
            Danh mục
            {orderBy === 'category' ? (
              <Box component='span' sx={visuallyHidden}>
                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
              </Box>
            ) : null}
          </TableSortLabel>
        </TableCell>
        <TableCell
          align={'center'}
          padding={'none'}
          sx={{ width: 80 }}
          sortDirection={orderBy === 'images' ? order : false}>
          Ảnh
        </TableCell>
        <TableCell
          align={'center'}
          padding={'none'}
          sortDirection={orderBy === 'created_at' ? order : false}>
          <TableSortLabel
            active={orderBy === 'created_at'}
            direction={orderBy === 'created_at' ? order : 'asc'}
            onClick={createSortHandler('created_at')}>
            Ngày tạo
            {orderBy === 'created_at' ? (
              <Box component='span' sx={visuallyHidden}>
                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
              </Box>
            ) : null}
          </TableSortLabel>
        </TableCell>
        <TableCell align={'center'}>Hành động</TableCell>
      </TableRow>
    </TableHead>
  );
}
interface EnhancedTableToolbarProps {
  numSelected: number;
  categoryList: ICategory[];
  onCategoryChange: (event: SelectChangeEvent<string>) => void;
  categoryValue: string;
  handleDeleteFilter: () => void;
  selected: string[];
  handleDeleteSelected: () => void;
}
function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const {
    numSelected,
    categoryList,
    onCategoryChange,
    categoryValue,
    handleDeleteFilter,
    selected,
    handleDeleteSelected,
  } = props;

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showNotification } = useNotificationContext();

  const delManyPrdMutation = useDeleteManyProduct();

  const handleDelete = () => {
    delManyPrdMutation.mutate(selected, {
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Product] });
        handleDeleteSelected();
        showNotification('Xóa sản phẩm thành công', 'success');
      },
    });
  };

  return (
    <Toolbar
      sx={[
        {
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
        },
        numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        },
      ]}>
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color='inherit'
          variant='subtitle1'
          component='div'>
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant='h6'
          id='tableTitle'
          component='div'>
          Danh sách sản phẩm
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title='Delete'>
          <IconButton>
            <DeleteIcon onClick={handleDelete} />
          </IconButton>
        </Tooltip>
      ) : (
        <>
          <FormControl
            size='small'
            sx={{
              width: 250,
              mr: 2,
              '& .MuiInputBase-root': {
                minHeight: 40,
              },
            }}>
            <InputLabel>Danh mục</InputLabel>
            <Select
              label='Danh mục'
              onChange={onCategoryChange}
              value={categoryValue}>
              {categoryList?.map((item) => (
                <MenuItem key={item._id} value={item?._id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
            {categoryValue && (
              <ClearIcon
                sx={{
                  position: 'absolute',
                  right: 30,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  p: '2px',
                  ':hover': {
                    bgcolor: '#eee',
                    borderRadius: '50%',
                    cursor: 'pointer',
                  },
                }}
                onClick={handleDeleteFilter}
              />
            )}
          </FormControl>
          <ExcelUpload />
          <ButtonWithTooltip
            sx={{ ml: 2 }}
            variant='contained'
            onClick={() => navigate('create')}
            title='Thêm gói cước'>
            <AddCircleOutlined />
          </ButtonWithTooltip>
          {/* <Tooltip title='Filter list'>
            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Tooltip> */}
        </>
      )}
    </Toolbar>
  );
}
export default function ProductList() {
  const navigate = useNavigate();
  const { confirmModal, showConfirmModal } = useConfirmModal();

  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Data>('stt');
  const [category, setCategory] = useState<string>('');
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState<IQuery>({
    limit: 10,
    page: 0,
  });

  const { data } = useGetProductList({ ...query });
  const { data: productByCategory, isLoading } =
    useGetProductByCategory(category);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = (productByCategory ?? data?.productList)?.map(
        (n) => n?._id
      );
      if (newSelected) {
        setSelected(newSelected);
      }
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

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

  const handleChangePage = (event: unknown, newPage: number) => {
    setQuery((prev) => ({ ...prev, ...{ page: newPage } }));
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setQuery((prev) => ({
      ...prev,
      ...{ limit: +event.target.value },
    }));
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    (query?.page ?? 0) > 0
      ? Math.max(
          0,
          (1 + (query.page ?? 0)) * (query.limit ?? 10) - (data?.total ?? 0)
        )
      : 0;

  const rows = useMemo(
    () =>
      (productByCategory ?? data?.productList)?.map((product, index) => ({
        stt: index + 1,
        _id: product._id,
        name: product.name,
        category: product.category?.name || '',
        images: product.images[0] || '',
        created_at: moment(product?.createdAt)?.format('DD/MM/YYYY'),
      })) || [],
    [data, productByCategory]
  );

  const visibleRows = useMemo(
    () => rows.sort(getComparator(order, orderBy)),
    [order, orderBy, query.limit, rows]
  );

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setCategory(event.target.value);
  };

  const handleDetailClick = (row: Data) => {
    const detailPrd = data?.productList?.find((prd) => prd.name === row.name);
    showConfirmModal({
      title: (
        <Typography sx={{ fontSize: 20, fontWeight: 'bold' }}>
          Chi tiết sản phẩm
        </Typography>
      ),
      content: (
        <Grid2 container rowSpacing={1}>
          <Grid2 size={3.5} fontSize={15}>
            Tên:
          </Grid2>
          <Grid2 size={8.5}> {detailPrd?.name}</Grid2>
          <Grid2 size={3.5}>Danh mục: </Grid2>
          <Grid2 size={8.5}> {detailPrd?.category?.name}</Grid2>
          <Grid2 size={3.5}>Ảnh:</Grid2>
          <Grid2 size={8.5}>
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
                <img src={img} className='thumbnail' />
              </Box>
            ))}
          </Grid2>
          {detailPrd?.tags && detailPrd?.tags?.length > 0 && (
            <Grid2 size={3.5}>Tags: </Grid2>
          )}
          {detailPrd?.tags && detailPrd?.tags?.length > 0 && (
            <Grid2 size={8.5}>
              {detailPrd?.tags?.map((tag: ITagOptions) => (
                <Box
                  key={tag.value}
                  sx={{
                    width: 100,
                    padding: '4px 2px',
                    my: 1,
                    bgcolor: getBgColor(tag.value),
                    color: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontSize: 13,
                  }}>
                  {tag.label}
                </Box>
              ))}
            </Grid2>
          )}
          {/* <Grid2 size={3.5}>Thuộc tính: </Grid2>
          <Grid2 size={8.5}>
            {detailPrd?.attributes?.map((att: string) => (
              <Box key={att}>{att}</Box>
            ))}
          </Grid2> */}
          {/* <Grid2 size={3.5}>Mã sản phẩm: </Grid2>
          <Grid2 size={8.5}>{detailPrd?.sku_name}</Grid2> */}
          <Grid2 size={3.5}>Chi tiết: </Grid2>
          <Grid2 size={8.5}>
            {Object.keys(detailPrd?.details || {}).length === 0 ? (
              <>Không có</>
            ) : (
              <Grid2 container>
                {detailPrd?.details.guarantee && (
                  <>
                    <Grid2 size={4.5}>- Bảo hành:</Grid2>
                    <Grid2 size={7.5}>{detailPrd?.details.guarantee}</Grid2>
                  </>
                )}
                {detailPrd?.details.weight && (
                  <>
                    <Grid2 size={4.5}>- Trọng lượng:</Grid2>
                    <Grid2 size={7.5}>{detailPrd?.details.weight}</Grid2>
                  </>
                )}
                {detailPrd?.details.material && (
                  <>
                    <Grid2 size={4.5}>- Chất liệu:</Grid2>
                    <Grid2 size={7.5}>{detailPrd?.details.material}</Grid2>
                  </>
                )}
              </Grid2>
            )}
          </Grid2>
          <Grid2 size={3.5}>Mô tả: </Grid2>
          <Grid2 size={8.5}>
            <HtmlRenderBox html={detailPrd?.description ?? ''} />
          </Grid2>
        </Grid2>
      ),
      showBtnOk: false,
      cancelText: 'Đóng',
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          categoryList={data?.categories ?? []}
          onCategoryChange={handleCategoryChange}
          categoryValue={category}
          handleDeleteFilter={() => {
            setCategory('');
          }}
          selected={selected}
          handleDeleteSelected={() => {
            setSelected([]);
          }}
        />
        <TableContainer sx={{ overflow: 'unset' }}>
          <Table sx={{ minWidth: 750 }} aria-labelledby='tableTitle'>
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={data?.total || 0}
            />
            <TableBody
              sx={{
                position: 'relative',
                height: !productByCategory
                  ? 80 *
                    ((data?.total ?? 0) < (query?.limit ?? 2)
                      ? data?.total ?? 10
                      : query?.limit ?? 10)
                  : '',
                // + 1 *
                // ((data?.total ?? 0) < (query?.limit ?? 10)
                //   ? data?.total ?? 0
                //   : query?.limit ?? 10),
              }}>
              {isLoading ? (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    right: '50%',
                    transform: 'translate(50%, -50%)',
                  }}>
                  <CircularProgress size={64} disableShrink thickness={3} />
                </Box>
              ) : (
                visibleRows?.map((row, index) => {
                  const isItemSelected = selected.includes(row._id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row._id)}
                      role='checkbox'
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.stt}
                      selected={isItemSelected}
                      sx={{ cursor: 'pointer' }}>
                      <TableCell padding='checkbox' sx={{ height: 80 }}>
                        <Checkbox
                          color='primary'
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        component='th'
                        id={labelId}
                        scope='row'
                        padding='none'
                        align='center'
                        sx={{ height: 80 }}>
                        {index + 1}
                      </TableCell>
                      <TableCell
                        component='th'
                        id={labelId}
                        scope='row'
                        padding='none'
                        sx={{ height: 80 }}>
                        {row.name}
                      </TableCell>
                      <TableCell
                        padding='none'
                        align='center'
                        sx={{ width: '16%', height: 80 }}>
                        {row?.category}
                      </TableCell>
                      <TableCell
                        padding='none'
                        align='center'
                        sx={{ width: 80, height: 80 }}>
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
                            src={row?.images}
                            className='thumbnail'
                            style={{ width: 80, height: 80 }}
                          />
                        </Box>
                      </TableCell>

                      <TableCell
                        padding='none'
                        align='center'
                        sx={{ height: 80 }}>
                        {row?.created_at}
                      </TableCell>
                      <TableCell
                        align='center'
                        sx={{ width: '10%', height: 80 }}>
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
                            <Box mb={1}>
                              <ButtonWithTooltip
                                color='primary'
                                onClick={() => navigate(`update/${row?._id}`)}
                                variant='outlined'
                                title='Chỉnh sửa'
                                placement='left'>
                                <EditOutlinedIcon />
                              </ButtonWithTooltip>
                            </Box>
                          </ActionButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
              {emptyRows > 0 && data && (
                <TableRow
                  style={{
                    height: 80 * emptyRows + 1 * emptyRows,
                  }}>
                  <TableCell colSpan={12} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 20]}
          component='div'
          count={productByCategory?.length ?? data?.total ?? 0}
          rowsPerPage={query?.limit ?? 10}
          page={query?.page ?? 0}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      {confirmModal()}
    </Box>
  );
}
