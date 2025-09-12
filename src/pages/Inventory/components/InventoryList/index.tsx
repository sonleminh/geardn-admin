import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid2,
  IconButton,
  InputAdornment,
  Link,
  Skeleton,
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
import { FiPackage } from 'react-icons/fi';
import { LuPackageX } from 'react-icons/lu';

import { ROUTES } from '@/constants/route';

import { useGetStocks } from '@/services/stock';

import { TableSkeleton } from '@/components/TableSkeleton';
import { TableColumn } from '@/interfaces/ITableColumn';
import { truncateTextByLine } from '@/utils/css-helper.util';

const cardIconBox = (bgcolor: string) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: { lg: 42, xl: 48 },
  height: { lg: 42, xl: 48 },
  mr: 2,
  bgcolor,
  borderRadius: 3,
  p: 1,
});
const cardTitle = {
  fontSize: { lg: 18, xl: 20 },
  fontWeight: 500,
  lineHeight: { lg: 1.2, xl: 1.3 },
};
const cardSubTitle = {
  color: '#828384',
  fontSize: { lg: 14, xl: 15 },
  fontWeight: 500,
};
const cardValue = { mb: 2, fontSize: { lg: 22, xl: 24 }, fontWeight: 600 };

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value: React.ReactNode;
  trend?: React.ReactNode;
  extra?: React.ReactNode;
  bgcolor?: string;
  iconBg?: string;
  isLoading?: boolean;
}

function SummaryCard({
  icon,
  title,
  subtitle,
  value,
  trend,
  extra,
  bgcolor = '#fff',
  iconBg = '#ebebeb',
  isLoading = false,
}: SummaryCardProps) {
  return (
    <Card
      sx={{
        bgcolor,
        color: bgcolor === '#000' ? '#fff' : undefined,
        borderRadius: 2,
      }}>
      <CardContent sx={{ p: { lg: 3, xl: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={cardIconBox(iconBg)}>
              {isLoading ? (
                <Skeleton
                  variant='circular'
                  width={24}
                  height={24}
                  sx={{
                    bgcolor:
                      bgcolor === '#000'
                        ? 'rgba(255, 255, 255, 0.3)'
                        : undefined,
                  }}
                />
              ) : (
                icon
              )}
            </Box>
            <Box>
              {isLoading ? (
                <>
                  <Skeleton
                    variant='text'
                    width={120}
                    height={24}
                    sx={{
                      mb: 1,
                      bgcolor:
                        bgcolor === '#000'
                          ? 'rgba(255, 255, 255, 0.3)'
                          : undefined,
                    }}
                  />
                  <Skeleton
                    variant='text'
                    width={80}
                    height={16}
                    sx={{
                      bgcolor:
                        bgcolor === '#000'
                          ? 'rgba(255, 255, 255, 0.3)'
                          : undefined,
                    }}
                  />
                </>
              ) : (
                <>
                  <Typography sx={cardTitle}>{title}</Typography>
                  {subtitle && (
                    <Typography sx={cardSubTitle}>{subtitle}</Typography>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Box>
        {isLoading ? (
          <Skeleton
            variant='text'
            width={100}
            height={32}
            sx={{
              mb: 2,
              bgcolor:
                bgcolor === '#000' ? 'rgba(255, 255, 255, 0.3)' : undefined,
            }}
          />
        ) : (
          <Typography sx={cardValue}>{value}</Typography>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {isLoading ? (
            <>
              <Skeleton
                variant='text'
                width={80}
                height={20}
                sx={{
                  bgcolor:
                    bgcolor === '#000' ? 'rgba(255, 255, 255, 0.3)' : undefined,
                }}
              />
              <Skeleton
                variant='text'
                width={80}
                height={20}
                sx={{
                  bgcolor:
                    bgcolor === '#000' ? 'rgba(255, 255, 255, 0.3)' : undefined,
                }}
              />
            </>
          ) : (
            <>
              {trend}
              {extra}
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

const columns: TableColumn[] = [
  { width: '60px', align: 'center' },
  { width: '300px', type: 'complex' },
  { width: '120px', align: 'center' },
  { width: '120px', align: 'center' },
  { width: '120px', align: 'center', type: 'action' },
];

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

const InventoryList = () => {
  const navigate = useNavigate();

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } =
    usePagination();

  const [searchQuery, setSearchQuery] = useState('');

  const { data: stocksData, isLoading: isLoadingStocks } = useGetStocks({
    page: page + 1,
    limit: rowsPerPage,
    search: searchQuery,
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

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
        <Typography color='text.primary'>Tồn kho</Typography>
      </Breadcrumbs>

      <Grid2 container spacing={3} sx={{ mb: 3 }}>
        <Grid2 size={3}>
          <SummaryCard
            title='Tổng tồn kho'
            value={stocksData?.meta?.total || 0}
            isLoading={isLoadingStocks}
            icon={<Inventory2OutlinedIcon />}
          />
        </Grid2>
        <Grid2 size={3}>
          <SummaryCard
            title='Tổng sản phẩm'
            value={stocksData?.meta?.total || 0}
            isLoading={isLoadingStocks}
            icon={
              <Box
                sx={{
                  svg: {
                    fontSize: 24,
                  },
                }}>
                <FiPackage />
              </Box>
            }
          />
        </Grid2>
        <Grid2 size={3}>
          <SummaryCard
            title='Tổng giá trị'
            value={stocksData?.meta?.total || 0}
            isLoading={isLoadingStocks}
            icon={<CurrencyExchangeIcon />}
          />
        </Grid2>
        <Grid2 size={3}>
          <SummaryCard
            title='Hết hàng'
            value={stocksData?.meta?.total || 0}
            isLoading={isLoadingStocks}
            icon={
              <Box
                sx={{
                  svg: {
                    fontSize: 24,
                  },
                }}>
                <LuPackageX />
              </Box>
            }
          />
        </Grid2>
      </Grid2>
      <Card>
        <CardHeader
          title={
            <Typography sx={{ mr: 2, fontSize: 20, fontWeight: 500 }}>
              Quản lý tồn kho
            </Typography>
          }
        />
        <Box sx={{ px: 2, pb: 2 }}>
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
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align='center'>STT</TableCell>
                <TableCell>Sản phẩm</TableCell>
                <TableCell align='center'>Tổn kho</TableCell>
                <TableCell align='center'>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingStocks ? (
                <TableSkeleton rowsPerPage={rowsPerPage} columns={columns} />
              ) : stocksData?.data?.length ? (
                stocksData?.data?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell width={'2%'} align='center'>
                      {index + 1}
                    </TableCell>
                    <TableCell width={'58%'}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            height: 60,
                            '.thumbnail': {
                              width: 60,
                              height: 60,
                              objectFit: 'contain',
                            },
                          }}>
                          <img src={item?.images?.[0]} className='thumbnail' />
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            ml: 2,
                          }}>
                          <Typography sx={{ ...truncateTextByLine(2) }}>
                            {item?.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell width={'15%'} align='center'>
                      {item?.totalStock}
                    </TableCell>
                    <TableCell width={'20%'} align='center'>
                      <IconButton
                        onClick={() =>
                          navigate(`${ROUTES.INVENTORY}/${item?.id}/stocks`)
                        }>
                        <VisibilityOutlinedIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell align='center' colSpan={6}>
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component='div'
          count={stocksData?.meta?.total || 0}
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
      </Card>
    </>
  );
};

export default InventoryList;
