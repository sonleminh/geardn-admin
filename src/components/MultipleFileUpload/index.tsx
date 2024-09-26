import { ChangeEvent, ReactNode, useRef, useState } from 'react';
import { Box, Button, TextFieldProps, Typography } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ClearIcon from '@mui/icons-material/Clear';

type TUploadProps = {
  title?: ReactNode;
  required?: boolean;
  onClearValue?: () => void;
} & TextFieldProps;

const MultipleFileUpload = ({
  title,
  required,
  disabled,
  value,
  onChange,
  helperText,
}: TUploadProps) => {
  // const [previewSource, setPreviewSource] = useState<string>();
  const [previewSource, setPreviewSource] = useState<any[]>([]);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    const files = e.target.files;
    // const file = e.target.files ? e.target.files[0] : null;
    if (files) {
      previewFile(files);
    }
  };
  console.log(previewSource);

  const previewFile = (files: FileList) => {
    const fileArray = Array.from(files);

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setPreviewSource((preState) => [...preState, reader.result]);
      };
    });
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
            multiple
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
          {previewSource?.length > 0 &&
            previewSource?.map((item: string, index: number) => (
              <Box
                sx={{
                  position: 'relative',
                  mr: 1.5,
                  '.thumbnail': {
                    maxWidth: 120,
                    maxHeight: 120,
                    mr: 1,
                    border: '1px solid #aaaaaa',
                  },
                }}>
                <img src={item} className='thumbnail' />
                <ClearIcon
                  onClick={() => {
                    const newPreviewSource = previewSource.filter(
                      (_, i) => i !== index
                    );
                    setPreviewSource(newPreviewSource);
                  }}
                  sx={{
                    position: 'absolute',
                    top: '-6px',
                    right: '0px',
                    bgcolor: 'white',
                    fontSize: 16,
                    border: '1px solid #696969',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    ':hover': {
                      bgcolor: '#eaeaea',
                    },
                  }}
                />
              </Box>
            ))}
          {/* {(value as string)?.length > 0 && (
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
            </>
          )} */}
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

export default MultipleFileUpload;

{
  /* <HighlightOffIcon
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
              /> */
}
