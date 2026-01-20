import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $modal, closeModal } from '../store/modal';

const Modal: React.FC = () => {
  const { isOpen, type, title, message, onConfirm, onCancel } = useStore($modal);
  const [promptValue, setPromptValue] = useState('');

  useEffect(() => {
    // Reset prompt input when modal opens
    if (isOpen) {
      setPromptValue('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    if (onConfirm) {
      if (type === 'prompt') {
        onConfirm(promptValue);
      } else {
        onConfirm();
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h3 id="modal-title" className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        {type === 'prompt' && (
          <input
            type="text"
            value={promptValue}
            onChange={(e) => setPromptValue(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition mb-6"
            autoFocus
          />
        )}
        
        <div className={`flex ${type === 'alert' ? 'justify-end' : 'justify-between'}`}>
          {type !== 'alert' && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition cursor-pointer"
            >
              取消
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition cursor-pointer"
          >
            {type === 'confirm' ? '確定' : '好的'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
