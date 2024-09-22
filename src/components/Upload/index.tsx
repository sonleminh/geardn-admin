import { ChangeEvent, ReactNode, useRef, useState } from 'react';
import { Box, Button, TextFieldProps, Typography } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';

type TUploadProps = {
  title?: ReactNode;
  required?: boolean;
  onClearValue?: () => void;
} & TextFieldProps;

const Upload = ({
  title,
  required,
  disabled,
  value,
  onChange,
  helperText,
}: TUploadProps) => {
  const [previewSource, setPreviewSource] = useState<string>();

  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      previewFile(file);
    }
  };

  const previewFile = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreviewSource(reader.result as string);
    };
  };
  return (
    <Box>
      {title && (
        <Typography mb={1}>
          {title}{' '}
          {required && (
            <Typography component={'span'} color='red'>
              *
            </Typography>
          )}
        </Typography>
      )}
      <Box>
        <Box display={'flex'} mb={1}>
          <input
            type='file'
            ref={uploadInputRef}
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
          <Button
            sx={{ width: '150px', height: '30px', mr: 5 }}
            variant='contained'
            disabled={disabled}
            onClick={() => {
              if (uploadInputRef.current) {
                uploadInputRef.current.click();
              }
            }}>
            <FileUploadIcon sx={{ mr: 1 }} />
            Upload
          </Button>
          {previewSource && (
            <>
              <Box
                sx={{
                  '.thumbnail': {
                    width: '100%',
                    maxHeight: 120,
                    mr: 1,
                    border: '1px solid #aaaaaa',
                  },
                }}>
                <img
                  src={previewSource || (value as string)}
                  className='thumbnail'
                />
              </Box>
              {/* <HighlightOffIcon
                onClick={() => {
                  setPreviewSource(undefined);
                  onClearValue?.();
                }}
                sx={{
                  fontSize: 28,
                  cursor: 'pointer',
                  ':hover': {
                    color: '#757575',
                  },
                }}
              /> */}
            </>
          )}
          {(value as string)?.length > 0 && (
            <>
              <Box
                sx={{
                  '.thumbnail': {
                    width: '100%',
                    maxHeight: 120,
                    mr: 1,
                    border: '1px solid #aaaaaa',
                  },
                }}>
                <img src={value as string} className='thumbnail' />
              </Box>
              {/* <HighlightOffIcon
                onClick={() => {
                  onClearValue?.();
                }}
                sx={{
                  fontSize: 28,
                  cursor: 'pointer',
                  ':hover': {
                    color: '#757575',
                  },
                }}
              /> */}
            </>
          )}
        </Box>
        {helperText && (
          <Typography
            component={'span'}
            sx={{ color: 'red', ml: 1.7, fontSize: 12 }}
            className='MuiFormHelperText-root'>
            {helperText}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Upload;
