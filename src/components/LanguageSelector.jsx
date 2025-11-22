
import React from 'react';
import { useLanguage } from './LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Flag mapping using country codes
const FLAG_URLS = {
  'en': 'https://flagcdn.com/w40/gb.png',
  'ru': 'https://flagcdn.com/w40/ru.png',
  'es': 'https://flagcdn.com/w40/es.png',
  'zh': 'https://flagcdn.com/w40/cn.png',
  'ar': 'https://flagcdn.com/w40/sa.png',
  'de': 'https://flagcdn.com/w40/de.png',
  'fr': 'https://flagcdn.com/w40/fr.png',
  'ja': 'https://flagcdn.com/w40/jp.png',
  'it': 'https://flagcdn.com/w40/it.png',
  'ro': 'https://flagcdn.com/w40/ro.png',
  'ko': 'https://flagcdn.com/w40/kr.png',
  'pt': 'https://flagcdn.com/w40/pt.png',
  'tr': 'https://flagcdn.com/w40/tr.png'
};

export default function LanguageSelector() {
  const { language, setLanguage, languages } = useLanguage();

  const getLanguageCode = (code) => {
    const codes = {
      'en': 'EN',
      'de': 'DE',
      'fr': 'FR',
      'ja': 'JA',
      'it': 'IT',
      'ro': 'RO',
      'ko': 'KO',
      'pt': 'PT',
      'tr': 'TR',
      'ru': 'RU',
      'es': 'ES',
      'zh': 'ZH',
      'ar': 'AR'
    };
    return codes[code] || code.toUpperCase();
  };

  return (
    <div className="relative">
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className="w-24 h-8 text-xs px-2.5">
          <SelectValue>
            <div className="flex items-center gap-1.5">
              <img 
                src={FLAG_URLS[language]} 
                alt={language}
                className="w-5 h-4 object-cover rounded-sm"
              />
              <span className="text-xs font-semibold">{getLanguageCode(language)}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                <img 
                  src={FLAG_URLS[lang.code]} 
                  alt={lang.code}
                  className="w-6 h-4 object-cover rounded-sm"
                />
                <span className="text-xs font-semibold">{getLanguageCode(lang.code)}</span>
                <span className="text-xs text-gray-500">- {lang.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
