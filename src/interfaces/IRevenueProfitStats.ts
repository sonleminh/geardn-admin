export interface IRevenueProfitDateStats {
    date: Date;
    revenue: number;
    profit: number;
}

export interface IRevenueProfitStats {
    revenueProfitData: IRevenueProfitDateStats[];
    revenue: number;
    profit: number;
}

export interface IRevenueProfitSummaryStats {
    revenue: number;
    profit: number;
}