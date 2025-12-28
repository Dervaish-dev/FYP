import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle2, Info } from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'info', // 'info', 'warning', 'success', 'error'
  isDangerous = false
}) => {
  const getIconAndColor = () => {
    switch (type) {
      case 'warning':
        return { icon: AlertCircle, color: '#f59e0b', bg: '#fef3c7' };
      case 'success':
        return { icon: CheckCircle2, color: '#10b981', bg: '#d1fae5' };
      case 'error':
        return { icon: AlertCircle, color: '#ef4444', bg: '#fee2e2' };
      default:
        return { icon: Info, color: '#3b82f6', bg: '#dbeafe' };
    }
  };

  const { icon: Icon, color, bg } = getIconAndColor();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blurred backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="rounded-2xl shadow-2xl max-w-md w-full"
              style={{ backgroundColor: 'var(--theme-card)' }}
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with icon */}
              <div
                className="p-6 flex items-center gap-4"
                style={{ backgroundColor: bg }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <h2 className="text-lg font-bold flex-1" style={{ color: 'var(--theme-text)' }}>
                  {title}
                </h2>
                <button
                  onClick={onCancel}
                  className="transition-colors"
                  style={{ color: 'var(--theme-muted-text)' }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--theme-text)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--theme-muted-text)'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Message */}
              <div className="px-6 py-4">
                <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-muted-text)' }}>
                  {message}
                </p>
              </div>

              {/* Action buttons */}
              <div className="px-6 py-4 rounded-b-2xl flex gap-3 justify-end" style={{ backgroundColor: 'var(--theme-background)' }}>
                <button
                  onClick={onCancel}
                  className="px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{ 
                    color: 'var(--theme-text)',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--theme-muted-bg)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
                  style={{
                    backgroundColor: isDangerous ? '#ef4444' : color,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                  }}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
