export interface IRevenueProfitDateStats {
    date: Date;
    revenue: number;
    profit: number;
}

export interface IRevenueProfitStats {
  revenueProfitStatsData: IRevenueProfitDateStats[];
  totals: {
    totalRevenue: number;
    totalProfit: number;
  };
}

export interface IRevenueProfitSummaryStats {
  totals: {
    totalRevenue: number;
    totalProfit: number;
  };
  growth: {
    revenuePercent: number;
    profitPercent: number;
  };
}

export interface IOrderDateStats {
    date: Date;
    orders: number;
}

export interface IOrderStats {
  orderStats: IOrderDateStats[];
  totals: {
    totalOrders: number;
    pendingOrders: number;
  };
}

export interface IOrderSummaryStats {
  totals: {
    delivered: number;
    pending: number;
    canceled: number;
    canceledThisMonthCount: number;
    deliveredThisMonthCount: number;
    deliveredLastMonthCount: number;
  };
  rates: {
    cancellationRate: number;
    cancellationRateThisMonth: number;
  };
  growth: { delivered: number };
}