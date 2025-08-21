import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Box, Button, TextFieldProps, Typography } from '@mui/material';

import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import ClearIcon from '@mui/icons-material/Clear';

import { useUploadImage } from '@/services/product';
import CircularProgressWithLabel from '../CircularProgress';

type TUploadProps = {
  onClearValue?: () => void;
  onUploadChange: (images: string[]) => void;
  value: string[];
} & TextFieldProps;

const MultipleImageUpload = ({
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
            setImages((prev) => [...prev, ...data.data]);
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
    <Box display={'flex'}>
      <Box height={'60px'}>
        <Box>
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
        <Box display={'flex'}>
          {images?.length > 0 &&
            images?.map((item: string, index: number) => (
              <Box
                key={item}
                sx={{
                  position: 'relative',
                  height: 60,
                  mr: 1.5,
                  img: {
                    width: 60,
                    height: 60,
                    mr: 1,
                    objectFit: 'contain',
                    border: '1px solid #aaaaaa',
                  },
                }}>
                <img src={item} />
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
      </Box>
    </Box>
  );
};

export default MultipleImageUpload;
