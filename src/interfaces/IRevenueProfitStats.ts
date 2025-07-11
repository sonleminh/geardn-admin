export interface IRevenueProfitDateStats {
    date: Date;
    revenue: number;
    profit: number;
}

export interface IRevenueProfitStats {
    revenueProfitData: IRevenueProfitDateStats[];
    totalRevenue: number;
    totalProfit: number;
}