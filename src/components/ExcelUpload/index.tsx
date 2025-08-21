import { Box, Button, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import useConfirmModal from '@/hooks/useModalConfirm';
import { useUploadProductsFile } from '@/services/product';
import { QueryKeys } from '@/constants/query-key';
import { useQueryClient } from '@tanstack/react-query';
import { useAlertContext } from '@/contexts/AlertContext';
import axios, { AxiosError } from 'axios';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SuspenseLoader from '../SuspenseLoader';

const ExcelUpload = () => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const { showAlert } = useAlertContext();
  const { confirmModal, showConfirmModal } = useConfirmModal();

  const { mutate: uploadProductsFile, isPending: isCreatePending } =
    useUploadProductsFile();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
      triggerModal(selectedFile);
    }
  };

  const handleFileUpload = async (file: File | null) => {
    if (file) {
      uploadProductsFile(file, {
        onSuccess() {
          queryClient.invalidateQueries({ queryKey: [QueryKeys.Product] });
          showAlert('Thêm danh sách sản phẩm thành công', 'success');
          setFile(null);
        },

        onError: (err: Error | AxiosError) => {
          if (axios.isAxiosError(err)) {
            showAlert(err.response?.data?.message, 'error');
          } else {
            showAlert(err.message, 'error');
          }
        },
      });
    }
  };

  const triggerModal = (selectedFile: File | null) => {
    showConfirmModal({
      title: 'Nhập file Excel sản phẩm:',
      content: (
        <Box display={'flex'} alignItems={'center'}>
          <Button
            sx={{ mr: 2, border: '2px solid#000' }}
            variant='outlined'
            onClick={() => {
              if (uploadInputRef.current) {
                uploadInputRef.current.click();
              }
            }}>
            <FileUploadIcon />
          </Button>
          {selectedFile ? (
            <Typography> {selectedFile.name}</Typography>
          ) : (
            <Typography sx={{ fontSize: 13 }}>
              Không có tệp nào được chọn
            </Typography>
          )}
        </Box>
      ),
      cancelText: 'Quay lại',
      onOk: () => handleFileUpload(selectedFile),
      okText: 'Thêm',
    });
  };

  return (
    <>
      <input
        type='file'
        accept='.xlsx, .xls'
        onChange={handleFileChange}
        ref={uploadInputRef}
        style={{ display: 'none' }}
      />
      <Button
        sx={{ border: '2px solid#157641', color: '#157641' }}
        variant='outlined'
        onClick={() => triggerModal(file)}>
        <UploadFileIcon sx={{ mr: 1 }} /> Excel
      </Button>
      {confirmModal()}
      {isCreatePending && <SuspenseLoader />}
    </>
  );
};

export default ExcelUpload;
