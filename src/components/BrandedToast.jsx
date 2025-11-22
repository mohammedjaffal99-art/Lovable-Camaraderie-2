import React, { useEffect } from 'react';
import { CheckCircle2, Sparkles, PartyPopper } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BrandedToast({ message, type = 'success', show, onClose, duration = 5000 }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle2,
      bgColor: '#10B981',
      borderColor: '#059669',
      title: '✅ Success!'
    },
    celebration: {
      icon: PartyPopper,
      bgColor: '#00BFFF',
      borderColor: '#0055A4',
      title: '🎉 Congratulations!'
    }
  };

  const { icon: Icon, bgColor, borderColor, title } = config[type] || config.success;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] w-full max-w-md px-4"
        >
          <div
            className="rounded-2xl shadow-2xl p-6 border-4"
            style={{ 
              backgroundColor: 'white',
              borderColor: borderColor
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl flex-shrink-0"
                style={{ backgroundColor: bgColor }}
              >
                <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-extrabold mb-2" style={{ color: '#0055A4' }}>
                  {title}
                </h3>
                <p className="text-base font-semibold leading-relaxed" style={{ color: '#4A90E2' }}>
                  {message}
                </p>
              </div>
            </div>
            <div className="mt-4 h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#E0F4FF' }}>
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                className="h-full"
                style={{ backgroundColor: bgColor }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}