
import React from 'react';
import Button from './Button';

interface ConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm text-center transform transition-all scale-95 opacity-0 animate-scale-in">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50">
          <span className="material-icons-sharp text-red-600 dark:text-red-400">warning</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{message}</p>
        <div className="mt-6 flex justify-center gap-4">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>Delete</Button>
        </div>
      </div>
       <style>{`
            .animate-fade-in {
                animation: fadeIn 0.2s ease-out forwards;
            }
            .animate-scale-in {
                animation: scaleIn 0.2s ease-out forwards;
            }
            @keyframes fadeIn {
                to { opacity: 1; }
            }
            @keyframes scaleIn {
                to { transform: scale(1); opacity: 1; }
            }
        `}</style>
    </div>
  );
};

export default ConfirmationModal;