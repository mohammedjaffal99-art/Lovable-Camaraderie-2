import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/AuthContext';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

export default function CaptionDisplay({ audioContext, sessionId, isLiveStream = false }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [currentCaption, setCurrentCaption] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = () => {
    if (!isSupported || !user?.captions_enabled) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    const captionLanguage = user.caption_language === 'auto' ? user.native_language : user.caption_language;
    const langMap = {
      'English': 'en-US', 'Spanish': 'es-ES', 'French': 'fr-FR', 'German': 'de-DE',
      'Italian': 'it-IT', 'Portuguese': 'pt-PT', 'Russian': 'ru-RU', 'Chinese': 'zh-CN',
      'Japanese': 'ja-JP', 'Korean': 'ko-KR', 'Arabic': 'ar-SA', 'Hindi': 'hi-IN',
      'Turkish': 'tr-TR', 'Dutch': 'nl-NL', 'Polish': 'pl-PL'
    };

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = langMap[captionLanguage] || 'en-US';

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) {
        setCurrentCaption(transcript.trim());
        setTimeout(() => setCurrentCaption(''), 4000);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setCurrentCaption('');
    }
  };

  if (!user?.captions_enabled) return null;

  const sizeClasses = { small: 'text-sm', medium: 'text-base', large: 'text-lg' };
  const sizeClass = sizeClasses[user.caption_size] || sizeClasses.medium;

  return (
    <>
      {isSupported && (
        <div className="absolute top-4 right-4 z-50">
          <Button
            onClick={isListening ? stopListening : startListening}
            size="sm"
            className={`shadow-lg ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
            {isListening ? 'Stop Captions' : 'Start Captions'}
          </Button>
        </div>
      )}

      {currentCaption && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none max-w-4xl w-full px-4">
          <div className="bg-black/90 backdrop-blur-sm rounded-lg px-6 py-3 shadow-2xl border-2 border-white/20">
            <p className={`${sizeClass} text-white text-center font-bold leading-relaxed`}>
              {currentCaption}
            </p>
          </div>
        </div>
      )}
    </>
  );
}