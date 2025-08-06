import { ColumnAlign, TableColumn } from '@/interfaces/ITableColumn';

export interface Data {
  stt: number;
  info: string;
  items: any[];
  status: string;
  totalPrice: number;
  createdAt: Date;
  note: string;
  action: string;
}

export interface HeadCell {
  align?: ColumnAlign;
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  isFilter?: boolean;
  width?: string;
}

export interface ColumnFilters {
  items: string[];
  status: string[];
  date: { fromDate: string; toDate: string };
}

export const INITIAL_COLUMN_FILTERS: ColumnFilters = {
  items: [],
  status: [],
  date: { fromDate: '', toDate: '' },
};

export const INITIAL_DATE_STATE = [
  {
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    key: 'selection',
  },
];

export const headCells: readonly HeadCell[] = [
  {
    align: 'center',
    id: 'stt',
    disablePadding: false,
    label: 'STT',
    isFilter: false,
    width: '2%',
  },
  {
    id: 'info',
    disablePadding: false,
    label: 'Thông tin',
    width: '15%',
  },
  {
    align: 'center',
    id: 'items',
    disablePadding: false,
    label: 'Sản phẩm',
    isFilter: true,
    width: '36%',
  },
  {
    align: 'center',
    id: 'totalPrice',
    disablePadding: false,
    label: 'Tổng tiền',
    width: '10%',
  },
  {
    align: 'center',
    id: 'status',
    disablePadding: false,
    label: 'Trạng thái',
    isFilter: true,
    width: '15%',
  },
  {
    align: 'center',
    id: 'createdAt',
    disablePadding: false,
    label: 'Ngày tạo',
    width: '12%',
  },
  {
    align: 'center',
    id: 'action',
    disablePadding: false,
    label: 'Hành động',
    width: '10%',
  },
];

export const columns: TableColumn[] = [
  { width: '60px', align: 'center', type: 'text' },
  { width: '100px', type: 'text' },
  { width: '300px', type: 'complex' },
  { width: '120px', align: 'center', type: 'text' },
  { width: '120px', align: 'center', type: 'text' },
  { width: '120px', align: 'center', type: 'text' },
  { width: '120px', align: 'center', type: 'action' },
];