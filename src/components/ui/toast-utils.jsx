import { toast } from "sonner";

let lastToastMessage = '';
let lastToastTime = 0;
const DEBOUNCE_MS = 100;

const shouldShowToast = (message, type) => {
  const now = Date.now();
  const key = `${type}:${message}`;
  
  if (key === lastToastMessage && (now - lastToastTime) < DEBOUNCE_MS) {
    return false;
  }
  
  lastToastMessage = key;
  lastToastTime = now;
  return true;
};

const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || window.webkitAudioContext)() : null;

const playSound = (type) => {
  try {
    const soundsEnabled = localStorage.getItem('notification_sounds') !== 'false';
    if (!soundsEnabled || !audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'success':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
        
      case 'error':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
        
      case 'warning':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
        break;
        
      case 'info':
        oscillator.frequency.setValueAtTime(700, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
        break;
    }
  } catch (error) {
    console.log('Sound error:', error);
  }
};

export const showToast = {
  success: (message, options = {}) => {
    if (!shouldShowToast(message, 'success')) return;
    playSound('success');
    toast.success(message, {
      duration: options.duration || 3000,
      ...options
    });
  },
  
  error: (message, options = {}) => {
    if (!shouldShowToast(message, 'error')) return;
    playSound('error');
    toast.error(message, {
      duration: options.duration || 3000,
      ...options
    });
  },
  
  info: (message, options = {}) => {
    if (!shouldShowToast(message, 'info')) return;
    playSound('info');
    toast.info(message, {
      duration: options.duration || 3000,
      ...options
    });
  },
  
  warning: (message, options = {}) => {
    if (!shouldShowToast(message, 'warning')) return;
    playSound('warning');
    toast.warning(message, {
      duration: options.duration || 3000,
      ...options
    });
  },
  
  loading: (message, options = {}) => {
    return toast.loading(message, options);
  },

  profileUpdated: () => {
    if (!shouldShowToast('Profile updated successfully!', 'success')) return;
    playSound('success');
    toast.success('✅ Profile updated successfully!', { duration: 3000 });
  },
  
  profileCompleted: () => {
    if (!shouldShowToast('Profile completed! You can now start exploring.', 'success')) return;
    playSound('success');
    toast.success('🎉 Profile completed! You can now start exploring.', { duration: 4000 });
  },
  
  broadcasterApproved: () => {
    if (!shouldShowToast('Congratulations! Your broadcaster application has been approved.', 'success')) return;
    playSound('success');
    toast.success('🎉 Congratulations! Your broadcaster application has been approved. You can now go live!', { duration: 5000 });
  },
  
  broadcasterRejected: () => {
    if (!shouldShowToast('Your broadcaster application was not approved.', 'error')) return;
    playSound('error');
    toast.error('❌ Your broadcaster application was not approved. Please update your profile and try again.', { duration: 5000 });
  },
  
  broadcasterSubmitted: () => {
    if (!shouldShowToast('Application submitted!', 'success')) return;
    playSound('success');
    toast.success('✅ Application submitted! Your account will be reviewed within 24-48 hours.', { duration: 4000 });
  },
  
  photoUploaded: () => {
    if (!shouldShowToast('Photo uploaded successfully!', 'success')) return;
    playSound('success');
    toast.success('📸 Photo uploaded successfully!', { duration: 3000 });
  },
  
  photoDeleted: () => {
    if (!shouldShowToast('Photo deleted successfully!', 'info')) return;
    playSound('info');
    toast.success('🗑️ Photo deleted successfully!', { duration: 3000 });
  },
  
  streamStarted: () => {
    if (!shouldShowToast('You are now LIVE!', 'success')) return;
    playSound('success');
    toast.success('🟢 You are now LIVE! Viewers can watch your stream.', { duration: 3000 });
  },
  
  streamEnded: () => {
    if (!shouldShowToast('Stream ended.', 'info')) return;
    playSound('info');
    toast.success('🔴 Stream ended. You are now offline.', { duration: 3000 });
  },
  
  callStarted: () => {
    if (!shouldShowToast('Call started successfully!', 'success')) return;
    playSound('success');
    toast.success('📞 Call started successfully!', { duration: 3000 });
  },
  
  callEnded: () => {
    if (!shouldShowToast('Call ended.', 'info')) return;
    playSound('info');
    toast.info('📞 Call ended.', { duration: 3000 });
  },
  
  balanceAdded: (amount) => {
    if (!shouldShowToast(`Balance added: ${amount} minutes!`, 'success')) return;
    playSound('success');
    toast.success(`💰 Balance added: ${amount} minutes!`, { duration: 3000 });
  },
  
  paymentFailed: () => {
    if (!shouldShowToast('Payment failed.', 'error')) return;
    playSound('error');
    toast.error('❌ Payment failed. Please try again.', { duration: 3000 });
  },
  
  paymentSuccess: () => {
    if (!shouldShowToast('Payment processed successfully!', 'success')) return;
    playSound('success');
    toast.success('✅ Payment processed successfully!', { duration: 3000 });
  },
  
  missingFields: () => {
    if (!shouldShowToast('Please complete all required fields.', 'warning')) return;
    playSound('warning');
    toast.error('⚠️ Please complete all required fields.', { duration: 3000 });
  },
  
  settingsSaved: () => {
    if (!shouldShowToast('Settings saved successfully!', 'success')) return;
    playSound('success');
    toast.success('⚙️ Settings saved successfully!', { duration: 3000 });
  },
  
  accountDeleted: () => {
    if (!shouldShowToast('Account deletion request submitted.', 'warning')) return;
    playSound('warning');
    toast.success('✅ Account deletion request submitted.', { duration: 3000 });
  }
};

export const toggleNotificationSounds = (enabled) => {
  localStorage.setItem('notification_sounds', enabled.toString());
};

export const getNotificationSoundsEnabled = () => {
  const stored = localStorage.getItem('notification_sounds');
  return stored === null ? true : stored === 'true';
};