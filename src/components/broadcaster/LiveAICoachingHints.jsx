import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smile, Mic, MessageCircle, Activity, Users, Heart, AlertCircle, AlertTriangle } from "lucide-react";
import { HINT_TYPES, getRandomHintMessage } from "@/components/ai/AIPerformanceUtils";

export default function LiveAICoachingHints({ viewerCount, isStreaming, broadcasterId, onIdleStateChange }) {
  const [activeHints, setActiveHints] = useState([]);
  const [hintIdCounter, setHintIdCounter] = useState(0);
  const [isExtremelyIdle, setIsExtremelyIdle] = useState(false);
  const audioContextRef = useRef(null);
  const idleTimerRef = useRef(null);

  // GLOBAL ACTIVATION RULE: Only activate when viewerCount >= 2
  const isAIActive = viewerCount >= 2 && isStreaming;

  const playIdleAlertSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Soft alert tone (warning sound)
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } catch (error) {
      console.log('Audio error:', error);
    }
  };

  const getHintIcon = (hintType) => {
    const iconMap = {
      silence_detected: Mic,
      low_facial_expression: Smile,
      chat_ignored: MessageCircle,
      idle_detected: Activity,
      extreme_idle: AlertTriangle,
      new_viewer_unacknowledged: Users,
      negative_tone: Heart,
      low_voice_energy: Mic,
      low_movement: Activity,
      viewer_drop: AlertCircle
    };
    return iconMap[hintType] || AlertCircle;
  };

  const getHintColor = (hintType) => {
    const priorityColors = {
      critical: '#ef4444',
      high: '#f97316',
      medium: '#eab308',
      low: '#3b82f6'
    };
    const priority = HINT_TYPES[hintType]?.priority || 'medium';
    return priorityColors[priority] || priorityColors.medium;
  };

  const showHint = (hintType, isUrgent = false) => {
    if (!isAIActive) return;

    const message = getRandomHintMessage(hintType);
    const newHint = {
      id: hintIdCounter,
      type: hintType,
      message,
      timestamp: new Date().toISOString(),
      isUrgent
    };

    setHintIdCounter(prev => prev + 1);
    setActiveHints(prev => [...prev, newHint]);

    if (isUrgent) {
      playIdleAlertSound();
    }

    setTimeout(() => {
      dismissHint(newHint.id);
    }, isUrgent ? 12000 : 8000);
  };

  const dismissHint = (hintId) => {
    setActiveHints(prev => prev.filter(h => h.id !== hintId));
  };

  // Extreme idle detection system (only when audience ≥1)
  useEffect(() => {
    if (!isAIActive) {
      // Clear all hints and idle state when AI becomes inactive
      setActiveHints([]);
      setIsExtremelyIdle(false);
      if (onIdleStateChange) onIdleStateChange(false);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      return;
    }

    // Simulate extreme idle detection after 30 seconds of low activity
    idleTimerRef.current = setTimeout(() => {
      const idleMessages = [
        "You are idle — try engaging your audience! 🎯",
        "Very low activity detected. Try interacting! 💬",
        "Your audience is waiting — say something! 👋",
        "Engagement alert: Show some energy! ⚡"
      ];
      
      setIsExtremelyIdle(true);
      if (onIdleStateChange) onIdleStateChange(true);
      
      const randomMessage = idleMessages[Math.floor(Math.random() * idleMessages.length)];
      showHint('extreme_idle', true);
      
      // Reset idle state after 15 seconds
      setTimeout(() => {
        setIsExtremelyIdle(false);
        if (onIdleStateChange) onIdleStateChange(false);
      }, 15000);
    }, 30000);

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isAIActive]);

  // Simulation of regular AI detection triggers (in production, these would come from real AI analysis)
  useEffect(() => {
    if (!isAIActive) return;

    // Simulate random AI detections for demo purposes
    const detectionInterval = setInterval(() => {
      const randomDetections = [
        'silence_detected',
        'low_facial_expression',
        'chat_ignored',
        'new_viewer_unacknowledged',
        'low_voice_energy',
        'idle_detected'
      ];
      
      // Randomly trigger a hint (10% chance every 15 seconds when active)
      if (Math.random() < 0.1) {
        const randomHintType = randomDetections[Math.floor(Math.random() * randomDetections.length)];
        showHint(randomHintType);
      }
    }, 15000);

    return () => clearInterval(detectionInterval);
  }, [isAIActive]);

  if (!isAIActive) {
    return null; // Don't render anything if AI is not active
  }

  return (
    <div className="absolute top-20 right-4 z-40 pointer-events-none">
      <AnimatePresence>
        {activeHints.map((hint, index) => {
          const Icon = getHintIcon(hint.type);
          const color = getHintColor(hint.type);
          
          return (
            <motion.div
              key={hint.id}
              initial={{ opacity: 0, x: 50, y: 0 }}
              animate={{ opacity: 1, x: 0, y: index * 80 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="mb-2 pointer-events-auto"
              style={{ position: 'relative', top: 0 }}
            >
              <motion.div
                className="rounded-xl p-3 shadow-2xl backdrop-blur-sm flex items-start gap-3 min-w-[280px] max-w-[320px] border-2"
                animate={hint.isUrgent ? {
                  borderColor: ['#f97316', '#ef4444', '#f97316'],
                  boxShadow: [
                    '0 0 20px rgba(239, 68, 68, 0.3)',
                    '0 0 30px rgba(239, 68, 68, 0.5)',
                    '0 0 20px rgba(239, 68, 68, 0.3)'
                  ]
                } : {}}
                transition={hint.isUrgent ? { duration: 1.5, repeat: Infinity } : {}}
                style={{ 
                  backgroundColor: hint.isUrgent ? 'rgba(254, 243, 199, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                  borderColor: hint.isUrgent ? '#f97316' : color
                }}
              >
                <div
                  className="p-2 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold leading-tight" style={{ color: hint.isUrgent ? '#ef4444' : '#0055A4' }}>
                    {hint.message}
                  </p>
                  <p className="text-xs font-semibold mt-1" style={{ color: hint.isUrgent ? '#f97316' : '#87CEEB' }}>
                    {hint.isUrgent ? '🚨 URGENT ALERT' : 'AI Coaching'} • Streamer Only
                  </p>
                </div>

                <button
                  onClick={() => dismissHint(hint.id)}
                  className="flex-shrink-0 hover:bg-gray-100 rounded-full p-1 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}