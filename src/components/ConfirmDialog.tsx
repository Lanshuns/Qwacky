import { MdWarning, MdInfo } from 'react-icons/md';
import { ReactNode } from 'react';
import { useI18n } from '../i18n';
import {
  DialogOverlay,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogMessage,
  DialogButtonContainer,
  DialogButton
} from '../styles/ui.styles';

interface ConfirmDialogProps {
  title: string;
  message: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isOpen: boolean;
  singleButton?: boolean;
  variant?: 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  isOpen,
  singleButton = false,
  variant = 'warning'
}) => {
  const { t } = useI18n();

  if (!isOpen) return null;

  const Icon = variant === 'info' ? MdInfo : MdWarning;
  const confirmText = confirmLabel ?? t('common.confirm');
  const cancelText = cancelLabel ?? t('common.cancel');

  return (
    <DialogOverlay onClick={(e) => {
      if (e.target === e.currentTarget && onCancel) {
        onCancel();
      }
    }}>
      <Dialog>
        <DialogHeader>
          <Icon size={24} />
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogMessage>{message}</DialogMessage>
        <DialogButtonContainer singleButton={singleButton}>
          {!singleButton && onCancel && (
            <DialogButton
              onClick={onCancel}
              variant="primary"
            >
              {cancelText}
            </DialogButton>
          )}
          <DialogButton
            onClick={onConfirm}
            singleButton={singleButton}
          >
            {confirmText}
          </DialogButton>
        </DialogButtonContainer>
      </Dialog>
    </DialogOverlay>
  );
};
