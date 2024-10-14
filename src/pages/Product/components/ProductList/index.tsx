import ActionButton from '@/components/ActionButton';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import { IQuery } from '@/interfaces/IQuery';
import { useGetProductList } from '@/services/product';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import useConfirmModal from '@/hooks/useModalConfirm';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExcelUpload from '@/components/ExcelUpload';
import { AddCircleOutlined } from '@mui/icons-material';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { ICategory } from '@/interfaces/ICategory';

interface Data {
  stt: number;
  name: string;
  category: number;
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
}
function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const navigate = useNavigate();
  const { numSelected, categoryList, onCategoryChange, categoryValue } = props;
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
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <>
          <FormControl
            variant='filled'
            size='small'
            sx={{
              width: 300,
              mr: 2,
              '& .MuiFilledInput-root': {
                overflow: 'hidden',
                borderRadius: 1,
                backgroundColor: '#fff !important',
                border: '1px solid',
                borderColor: 'rgba(0,0,0,0.23)',
                '&:hover': {
                  backgroundColor: 'transparent',
                },
                '&.Mui-focused': {
                  backgroundColor: 'transparent',
                  border: '2px solid',
                },
              },
              '& .MuiInputLabel-asterisk': {
                color: 'red',
              },
            }}>
            <InputLabel>Danh mục</InputLabel>
            <Select
              disableUnderline
              name='category'
              onChange={onCategoryChange}
              value={categoryValue}>
              {categoryList?.map((item) => (
                <MenuItem key={item._id} value={item?._id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ExcelUpload />
          <ButtonWithTooltip
            sx={{ ml: 2 }}
            variant='contained'
            onClick={() => navigate('create')}
            title='Thêm gói cước'>
            <AddCircleOutlined />
          </ButtonWithTooltip>
          <Tooltip title='Filter list'>
            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
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
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [query, setQuery] = useState<IQuery>({
    limit: 10,
    page: 0,
  });

  console.log(category);

  const { data } = useGetProductList({ ...query });

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
      const newSelected = data?.productList?.map((n, index) => index);
      console.log(newSelected);
      if (newSelected) {
        setSelected(newSelected);
      }
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

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
      data?.productList?.map((product, index) => ({
        stt: index + 1,
        _id: product._id,
        name: product.name,
        category: product.category?.name || '',
        images: product.images[0] || '',
        created_at: moment(product?.createdAt)?.format('DD/MM/YYYY'),
      })) || [],
    [data]
  );

  const visibleRows = useMemo(
    () => rows.sort(getComparator(order, orderBy)),
    [order, orderBy, query.limit, rows]
  );

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setCategory(event.target.value);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          categoryList={data?.categories ?? []}
          onCategoryChange={handleCategoryChange}
          categoryValue={category}
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
                height:
                  80 *
                    ((data?.total ?? 10) < (query?.limit ?? 2)
                      ? data?.total ?? 10
                      : query?.limit ?? 10) +
                  1 *
                    ((data?.total ?? 0) < (query?.limit ?? 10)
                      ? data?.total ?? 0
                      : query?.limit ?? 10),
              }}>
              {visibleRows?.map((row, index) => {
                const isItemSelected = selected.includes(index);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, index)}
                    role='checkbox'
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.stt}
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
                    <TableCell
                      component='th'
                      id={labelId}
                      scope='row'
                      padding='none'
                      align='center'>
                      {index + 1}
                    </TableCell>
                    <TableCell
                      component='th'
                      id={labelId}
                      scope='row'
                      padding='none'>
                      {row.name}
                    </TableCell>
                    <TableCell
                      padding='none'
                      align='center'
                      sx={{ width: '16%' }}>
                      {row?.category}
                    </TableCell>
                    <TableCell padding='none' align='center' sx={{ width: 80 }}>
                      <Box
                        sx={{
                          height: 80,
                          '.thumbnail': {
                            width: 80,
                            height: 80,
                            objectFit: 'contain',
                          },
                        }}>
                        <img src={row?.images} className='thumbnail' />
                      </Box>
                    </TableCell>

                    <TableCell padding='none' align='center'>
                      {row?.created_at}
                    </TableCell>
                    <TableCell align='center' width={'10%'}>
                      <Box onClick={(e) => e.stopPropagation()}>
                        <ActionButton>
                          <Box mb={1}>
                            <ButtonWithTooltip
                              color='primary'
                              variant='outlined'
                              title='Chi tiết'
                              placement='left'>
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
              })}
              {emptyRows > 0 && data && (
                <TableRow
                  style={{
                    height: 80 * emptyRows,
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
          count={data?.total ?? 0}
          rowsPerPage={query?.limit ?? 10}
          page={query?.page ?? 0}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
