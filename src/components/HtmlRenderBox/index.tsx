import { memo } from 'react';
import { Box } from '@mui/material';

const HtmlRenderBox = ({ html }: { html: string | TrustedHTML }) => {
  return (
    <Box
      sx={{
        maxHeight: '100%', // Limit the maximum height to the viewport height
        maxWidth: '100%', // Limit the maximum width to the viewport width
        '*:has(table)': {
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            height: '8px',
          },
        },

        'figure.image': {
          textAlign: 'center',
        },

        '& table, th, td': {
          borderCollapse: 'collapse', // Optional: Improve table appearance
          border: '1px solid #ddd', // Optional: Add borders to table cells
        },

        '& img': {
          maxWidth: '100%', // Make images fill the container
          height: 'auto', // Maintain aspect ratio
        },
      }}
      dangerouslySetInnerHTML={{
        __html: html ? String(html) : 'Đang cập nhật...',
      }}
    />
  );
};

export default memo(HtmlRenderBox);
