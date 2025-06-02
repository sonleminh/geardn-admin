import { useUploadImage } from '@/services/product';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import CircularProgressWithLabel from '../CircularProgress';

import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import { Box, Button, TextFieldProps, Typography } from '@mui/material';

type TUploadProps = {
  onClearValue?: () => void;
  onUploadChange: (image: string) => void;
  value: string;
} & TextFieldProps;

const ImageUpload = ({
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
            setImage(data.data?.[0]);
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
          <input
            type='file'
            multiple
            accept='image/*'
            ref={uploadInputRef}
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
          <Button
            sx={{ width: 60, height: 60, mr: 2 }}
            variant='outlined'
            disabled={disabled}
            onClick={() => {
              if (uploadInputRef.current) {
                uploadInputRef.current.click();
              }
            }}>
            <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 30 }} />
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
        {!progress && image !== '' && (
          <Box
            sx={{
              position: 'relative',
              width: 60,
              height: 60,
              img: {
                width: 60,
                height: 60,
                objectFit: 'contain',
                border: '1px solid #aaaaaa',
              },
            }}>
            <img src={image} />
            <ClearIcon
              onClick={() => {
                setImage('');
              }}
              sx={{
                position: 'absolute',
                top: '-6px',
                right: '-8px',
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
  );
};

export default ImageUpload;
