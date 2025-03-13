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
  onUploadChange: (image: string) => void;
  value: string;
} & TextFieldProps;

const ImageUpload = ({
  title,
  required,
  disabled,
  value,
  onUploadChange,
  helperText,
}: TUploadProps) => {
  const [image, setImage] = useState<string>('');
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
            setImage(data.data.images[0]);
            setProgress(null);
          },
        }
      );
    }
  };

  useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(image)) {
      setImage(value);
    }
  }, [value]);

  useEffect(() => {
    onUploadChange(image);
  }, [image]);

  return (
    <Box display={'flex'}>
      <Box mr={2}>
        <Box display={'flex'}>
          {title && (
            <Typography mr={2} mb={1.5}>
              {title}{' '}
              {required && (
                <Typography component={'span'} color='red'>
                  *
                </Typography>
              )}
            </Typography>
          )}
          <input
            type='file'
            multiple
            accept='image/*'
            ref={uploadInputRef}
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
          <Button
            sx={{ width: '120px', height: '30px', mr: 2 }}
            variant='contained'
            disabled={disabled}
            onClick={() => {
              if (uploadInputRef.current) {
                uploadInputRef.current.click();
              }
            }}>
            <FileUploadIcon />
            {/* Upload */}
          </Button>
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
      <Box>
        <Box display={'flex'}>
          {!progress && image !== '' && (
            <Box
              sx={{
                position: 'relative',
                mr: 1.5,
                '.thumbnail': {
                  maxWidth: 60,
                  maxHeight: 60,
                  mr: 1,
                  border: '1px solid #aaaaaa',
                },
              }}>
              <img src={image} className='thumbnail' />
              <ClearIcon
                onClick={() => {
                  setImage('');
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
          )}
          {progress !== null && <CircularProgressWithLabel value={progress} />}
        </Box>
      </Box>
    </Box>
  );
};

export default ImageUpload;
