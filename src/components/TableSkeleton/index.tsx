import { Box } from '@mui/material';

import { Skeleton } from '@mui/material';

import { TableCell } from '@mui/material';

import { TableRow } from '@mui/material';

// src/components/TableSkeleton/index.tsx
interface TableSkeletonProps {
  rowsPerPage: number;
  columns: {
    width?: string;
    align?: 'left' | 'center' | 'right';
    type?: 'text' | 'image' | 'action' | 'complex';
  }[];
}

export const TableSkeleton = ({ rowsPerPage, columns }: TableSkeletonProps) => {
  return (
    <>
      {Array.from(new Array(rowsPerPage)).map((_, index) => (
        <TableRow key={index}>
          {columns.map((column, colIndex) => (
            <TableCell
              key={colIndex}
              align={column.align ?? 'left'}
              sx={{
                width: column.width,
                minWidth: column.width,
                maxWidth: column.width,
                boxSizing: 'border-box',
              }}>
              {column.type === 'image' && (
                <Skeleton variant='rectangular' width={40} height={40} />
              )}
              {column.type === 'action' && (
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  <Skeleton variant='rectangular' width={32} height={32} />
                  <Skeleton variant='rectangular' width={32} height={32} />
                </Box>
              )}
              {column.type === 'complex' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Skeleton variant='rectangular' width={40} height={40} />
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                      }}>
                      <Skeleton width={80} />
                      <Skeleton width={60} />
                      <Skeleton width={70} />
                    </Box>
                  </Box>
                </Box>
              )}
              {column.type === 'text' && (
                <Skeleton
                  width={`calc(${column.width} - 32px)`}
                  sx={{ boxSizing: 'border-box' }}
                />
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};
