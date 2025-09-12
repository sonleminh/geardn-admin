import { Box } from '@mui/material';

import { Skeleton } from '@mui/material';

import { TableCell } from '@mui/material';

import { TableRow } from '@mui/material';

import { TableColumn } from '@/interfaces/ITableColumn';

interface TableSkeletonProps {
  rowsPerPage: number;
  columns: TableColumn[];
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
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Skeleton variant='rectangular' width={40} height={40} />
                </Box>
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
                      <Skeleton width={150} />
                    </Box>
                  </Box>
                </Box>
              )}
              {(!column.type || column.type === 'text') && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent:
                      column.align === 'right'
                        ? 'flex-end'
                        : column.align === 'center'
                        ? 'center'
                        : 'flex-start',
                    width: '100%',
                  }}>
                  <Skeleton
                    width={column.width}
                    sx={{
                      boxSizing: 'border-box',
                      maxWidth: '100%',
                    }}
                  />
                </Box>
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};
