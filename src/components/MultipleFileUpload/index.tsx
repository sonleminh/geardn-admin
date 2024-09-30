import { ChangeEvent, ReactNode, useEffect, useRef, useState } from 'react';
import CircularProgressWithLabel from '../CircularProgress';
import { useUploadImage } from '@/services/product';

import { Box, Button, TextFieldProps, Typography } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ClearIcon from '@mui/icons-material/Clear';

type TUploadProps = {
  title?: ReactNode;
  required?: boolean;
  onClearValue?: () => void;
  onUploadChange: (images: string[]) => void;
  value: string[];
} & TextFieldProps;

const MultipleFileUpload = ({
  title,
  required,
  disabled,
  value,
  onUploadChange,
  helperText,
}: TUploadProps) => {
  const [images, setImages] = useState<string[]>([]);
  const [progress, setProgress] = useState<number | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadMutate } = useUploadImage();
  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e?.target?.files;
    if (files) {
      setProgress(0);
      uploadMutate(
        { files, onProgress: setProgress },
        {
          onSuccess(data) {
            setImages((prev) => [...prev, ...data.images]);
            setProgress(null);
          },
        }
      );
    }
  };

  useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(images)) {
      setImages(value);
    }
  }, [value]);

  useEffect(() => {
    onUploadChange(images);
  }, [images]);

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
            accept='image/*'
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
          {images?.length > 0 &&
            images?.map((item: string, index: number) => (
              <Box
                key={item}
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
                    const newImages = images.filter((_, i) => i !== index);
                    setImages(newImages);
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
          {progress !== null && <CircularProgressWithLabel value={progress} />}
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
