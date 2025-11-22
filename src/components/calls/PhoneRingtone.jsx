import { useEffect, useRef } from 'react';

export function usePhoneRingtone(isRinging) {
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRinging) {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      const playRing = () => {
        if (!audioContextRef.current) return;
        
        const context = audioContextRef.current;
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        // Classic phone ring frequencies (dual tone)
        oscillator.frequency.value = 440; // A4 note
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.4);
        
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.4);
        
        // Second tone
        setTimeout(() => {
          const oscillator2 = context.createOscillator();
          const gainNode2 = context.createGain();
          
          oscillator2.connect(gainNode2);
          gainNode2.connect(context.destination);
          
          oscillator2.frequency.value = 480; // Slightly higher
          oscillator2.type = 'sine';
          
          gainNode2.gain.setValueAtTime(0, context.currentTime);
          gainNode2.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.01);
          gainNode2.gain.linearRampToValueAtTime(0, context.currentTime + 0.4);
          
          oscillator2.start(context.currentTime);
          oscillator2.stop(context.currentTime + 0.4);
        }, 200);
      };
      
      // Play immediately
      playRing();
      
      // Repeat every 3 seconds
      intervalRef.current = setInterval(playRing, 3000);
      
    } else {
      // Stop ringing
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [isRinging]);
}