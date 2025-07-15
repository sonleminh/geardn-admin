import React from 'react';
import { useRoutes } from 'react-router-dom';
import StatisticLayout from './components/StatisticLayout';
import {
  Button,
  Box,
  Card,
  CardContent,
  Container,
  Grid2,
  Typography,
  Divider,
} from '@mui/material';
import {
  useGetOverviewStats,
  useGetRevenueProfitStats,
  useGetRevenueProfitSummaryStats,
} from '@/services/statistic';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import { formatPrice } from '@/utils/format-price';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import RevenueProfitChart from '../RevenueProfitChart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const cardIconBox = (bgcolor: string) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  mr: 2,
  bgcolor,
  borderRadius: 3,
  p: 1,
});

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
  bgcolor?: string;
  iconBg?: string;
}

function InfoCard({
  icon,
  title,
  content,
  bgcolor = '#fff',
  iconBg = '#ebebeb',
}: InfoCardProps) {
  return (
    <Card
      sx={{
        bgcolor,
        color: bgcolor === '#000' ? '#fff' : undefined,
        borderRadius: '2px',
      }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
          }}>
          <Box sx={cardIconBox(iconBg)}>{icon}</Box>
          <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {content}
        </Box>
      </CardContent>
    </Card>
  );
}

interface SummaryStatProps {
  label: string;
  value: number;
  iconBg: string;
}

function SummaryStat({ label, value, iconBg }: SummaryStatProps) {
  return (
    <Box className='flex flex-col justify-between'>
      <Box className='flex items-center'>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            mr: 1,
            bgcolor: iconBg,
            borderRadius: '50%',
            p: 1,
          }}>
          <AttachMoneyIcon />
        </Box>
        <Typography sx={{ fontSize: 16, fontWeight: 500 }}>{label}</Typography>
      </Box>
      <Typography sx={{ fontSize: 24, fontWeight: 500 }}>
        {formatPrice(value)}
      </Typography>
    </Box>
  );
}

const RevenueProfit = () => {
  const { data: revenueProfitSummaryStats } = useGetRevenueProfitSummaryStats();
  const summaryStats = [
    {
      label: 'Tổng doanh thu',
      value: revenueProfitSummaryStats?.data.revenue || 0,
      iconBg: '#afe9bb',
    },
    {
      label: 'Tổng lợi nhuận',
      value: revenueProfitSummaryStats?.data.profit || 0,
      iconBg: '#ffcdd2',
    },
  ];
  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <RevenueProfitChart />
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          {summaryStats.map((stat, idx) => (
            <React.Fragment key={stat.label}>
              <SummaryStat {...stat} />
              {idx < summaryStats.length - 1 && (
                <Divider orientation='vertical' flexItem />
              )}
            </React.Fragment>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RevenueProfit;
