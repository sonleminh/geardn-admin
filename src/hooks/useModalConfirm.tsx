import { ReactNode, useState } from 'react';
import {
  Box,
  Button,
  ButtonPropsColorOverrides,
  Modal,
  Typography,
} from '@mui/material';
import { OverridableStringUnion } from '@mui/types';

export interface IShowConfirmModal {
  onOk?: () => void;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  title?: ReactNode;
  content?: ReactNode;
  showBtnOk?: boolean;
  showBtnCancel?: boolean;
  hideIconBtnOk?: boolean;
  hideIconBtnCancel?: boolean;
  btnOkColor?: OverridableStringUnion<
    | 'primary'
    | 'inherit'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning',
    ButtonPropsColorOverrides
  >;
}

const useConfirmModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalProps, setModalProps] = useState<IShowConfirmModal>();

  const showConfirmModal = ({
    title = '',
    content = '',
    okText = 'OK',
    cancelText = 'Hủy bỏ',
    onOk = () => setIsOpen(false),
    onCancel = () => setIsOpen(false),
    showBtnCancel = true,
    showBtnOk = true,
    hideIconBtnOk = false,
    hideIconBtnCancel = false,
    btnOkColor = 'primary',
  }: IShowConfirmModal) => {
    setIsOpen(true);
    setModalProps({
      title,
      content,
      okText,
      cancelText,
      onOk: () => {
        onOk?.();
        setIsOpen(false);
      },
      onCancel: () => {
        onCancel?.();
        setIsOpen(false);
      },
      showBtnCancel,
      showBtnOk,
      hideIconBtnOk,
      hideIconBtnCancel,
      btnOkColor,
    });
  };

  const confirmModal = () => {
    return (
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        disableScrollLock={true}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 3,
            borderRadius: 2,
          }}>
          <Typography sx={{ mb: 3, fontSize: 16 }}>
            {modalProps?.title}
          </Typography>
          <Box id='modal-modal-description' sx={{ my: 2 }}>
            {modalProps?.content}
          </Box>
          <Box sx={{ textAlign: 'end' }}>
            {modalProps?.showBtnCancel && (
              <Button
                variant='outlined'
                sx={{ mr: 2, width: 100, textTransform: 'none' }}
                onClick={() => modalProps?.onCancel?.()}>
                {modalProps?.cancelText}
              </Button>
            )}
            {modalProps?.showBtnOk && (
              <Button
                variant='contained'
                color={modalProps?.btnOkColor}
                onClick={() => modalProps?.onOk?.()}
                sx={{ width: 100, textTransform: 'none' }}>
                {modalProps?.okText}
              </Button>
            )}
          </Box>
        </Box>
      </Modal>
    );
  };

  return { showConfirmModal, confirmModal };
};

export default useConfirmModal;
