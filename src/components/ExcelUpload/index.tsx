import { Box, Button } from '@mui/material';
import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const ExcelUpload = () => {
  const [file, setFile] = useState<any>(null);
  const [fileData, setFileData] = useState<any>(null);
  const [error, setError] = useState('');
  const uploadInputRef = useRef<HTMLInputElement>(null);
  console.log('f:', file);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(selectedFile);
      reader.onload = async (e) => {
        setFile(e.target?.result);
      };
      // setFile(selectedFile);
    }
  };

  const handleFileUpload = async (e: any) => {
    e?.preventDefault();
    if (file != null) {
      const workbook = XLSX.read(file, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0]; // Get the first sheet
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      setFileData(data);
    }
  };

  console.log('fd:', fileData);
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
        variant='contained'
        onClick={() => {
          if (uploadInputRef.current) {
            uploadInputRef.current.click();
          }
        }}>
        <UploadFileIcon sx={{ mr: 1 }} /> Excel
      </Button>
      <Button onClick={handleFileUpload}>Upload</Button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </>
  );
};

export default ExcelUpload;
