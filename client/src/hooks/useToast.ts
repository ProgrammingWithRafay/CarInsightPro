import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

/**
 * Custom hook to easily trigger toast notifications from any component.
 * Throws an error if used outside of the ToastProvider.
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
