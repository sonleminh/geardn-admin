export interface IRevenueProfitDateStats {
    date: Date;
    revenue: number;
    profit: number;
}

export interface IRevenueProfitStats {
  revenueProfitData: IRevenueProfitDateStats[];
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