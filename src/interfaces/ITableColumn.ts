export type ColumnType = 'text' | 'image' | 'action' | 'complex';
export type ColumnAlign = 'left' | 'center' | 'right';

export interface TableColumn {
    width?: string;
    align?: ColumnAlign;
    type?: ColumnType;
  }