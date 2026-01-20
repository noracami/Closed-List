import { atom, map } from 'nanostores';

type ModalType = 'alert' | 'confirm' | 'prompt';

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message: string;
  inputValue: string | null;
  onConfirm: ((value?: string) => void) | null;
  onCancel: (() => void) | null;
}

export const $modal = map<ModalState>({
  isOpen: false,
  type: 'alert',
  title: '',
  message: '',
  inputValue: null,
  onConfirm: null,
  onCancel: null,
});

// --- Action Functions ---

export function openAlert(title: string, message: string, onConfirm?: () => void) {
  $modal.set({
    isOpen: true,
    type: 'alert',
    title,
    message,
    inputValue: null,
    onConfirm: onConfirm || closeModal,
    onCancel: null,
  });
}

export function openConfirm(title: string, message: string, onConfirm: () => void, onCancel?: () => void) {
  $modal.set({
    isOpen: true,
    type: 'confirm',
    title,
    message,
    inputValue: null,
    onConfirm: () => {
      onConfirm();
      closeModal();
    },
    onCancel: () => {
      if (onCancel) onCancel();
      closeModal();
    },
  });
}

export function openPrompt(title: string, message: string, onConfirm: (value: string) => void, onCancel?: () => void) {
  $modal.set({
    isOpen: true,
    type: 'prompt',
    title,
    message,
    inputValue: '', // For prompt, we need an input value
    onConfirm: (value) => {
      if (value) onConfirm(value);
      closeModal();
    },
    onCancel: () => {
      if (onCancel) onCancel();
      closeModal();
    },
  });
}

export function closeModal() {
  $modal.setKey('isOpen', false);
}
