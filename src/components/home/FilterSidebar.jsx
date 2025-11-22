import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

const LANGUAGES = ["Afrikaans", "Albanian", "Arabic", "Armenian", "Belarusian", "Bosnian", "Bulgarian", "Burmese", "Cantonese", "Catalan", "Croatian", "Czech", "Danish", "Dutch", "English", "Estonian", "Finnish", "French", "Georgian", "German", "Greek", "Haitian Creole", "Hindi", "Hungarian", "Indonesian", "Italian", "Japanese", "Khmer", "Korean", "Kurdish", "Kyrgyz", "Lao", "Latvian", "Lithuanian", "Macedonian", "Malagasy", "Malay", "Mandarin Chinese", "Mongolian", "Norwegian", "Polish", "Portuguese", "Romanian", "Russian", "Serbian", "Serbo-Croatian", "Slovak", "Slovenian", "Spanish", "Swedish", "Tagalog", "Tajik", "Thai", "Turkish", "Ukrainian", "Urdu", "Vietnamese", "Welsh"];

const LANGUAGE_FLAGS = {
  "Afrikaans": "ZA", "Albanian": "AL", "Arabic": "SA", "Armenian": "AM",
  "Belarusian": "BY", "Bosnian": "BA", "Bulgarian": "BG",
  "Burmese": "MM", "Cantonese": "HK", "Catalan": "ES",
  "Croatian": "HR", "Czech": "CZ", "Danish": "DK",
  "Dutch": "NL", "English": "GB", "Estonian": "EE", "Finnish": "FI",
  "French": "FR", "Georgian": "GE", "German": "DE",
  "Greek": "GR", "Haitian Creole": "HT", "Hindi": "IN",
  "Hungarian": "HU", "Indonesian": "ID", "Italian": "IT",
  "Japanese": "JP", "Khmer": "KH", "Korean": "KR",
  "Kurdish": "IQ", "Kyrgyz": "KG", "Lao": "LA", "Latvian": "LV", "Lithuanian": "LT",
  "Macedonian": "MK", "Malagasy": "MG", "Malay": "MY",
  "Mandarin Chinese": "CN", "Mongolian": "MN",
  "Norwegian": "NO", "Polish": "PL", "Portuguese": "PT",
  "Romanian": "RO", "Russian": "RU",
  "Serbian": "RS", "Serbo-Croatian": "RS", "Slovak": "SK",
  "Slovenian": "SI", "Spanish": "ES",
  "Swedish": "SE", "Tagalog": "PH", "Tajik": "TJ",
  "Thai": "TH", "Turkish": "TR",
  "Ukrainian": "UA", "Urdu": "PK",
  "Vietnamese": "VN", "Welsh": "GB"
};

const COUNTRIES = ["Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iraq", "Ireland", "Italy", "Jamaica", "Japan", "Jordan", "Kenya", "Kiribati", "South Korea", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Lucia", "Samoa", "San Marino", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Taiwan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];

const ETHNICITIES = ["African", "American", "Arabic", "Asian", "European", "Latin American", "Pacific Islander"];
const GOALS = ["Language Exchange", "Make New Friends", "Open to All Possibilities"];

export default function FilterSidebar({ filters, setFilters, categories, onClose }) {
  const { t } = useLanguage();
  
  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" style={{ color: '#11009E' }} />
              <h2 className="text-xl font-bold" style={{ color: '#11009E' }}>{t('filter.filters')}</h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">{t('filter.gender')}</label>
              <Select value={filters.gender} onValueChange={(value) => setFilters({...filters, gender: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filter.all')}</SelectItem>
                  <SelectItem value="male">{t('filter.male')}</SelectItem>
                  <SelectItem value="female">{t('filter.female')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">{t('filter.country')}</label>
              <Select value={filters.country || 'none'} onValueChange={(value) => setFilters({...filters, country: value === 'none' ? '' : value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filter.selectCountry')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('filter.all')}</SelectItem>
                  {COUNTRIES.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">{t('filter.language')}</label>
              <Select value={filters.language || 'none'} onValueChange={(value) => setFilters({...filters, language: value === 'none' ? '' : value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filter.selectLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('filter.all')}</SelectItem>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">{t('filter.ethnicity')}</label>
              <Select value={filters.ethnicity} onValueChange={(value) => setFilters({...filters, ethnicity: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filter.selectEthnicity')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filter.all')}</SelectItem>
                  {ETHNICITIES.map(eth => (
                    <SelectItem key={eth} value={eth}>{t(`ethnicity.${eth}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">{t('filter.category')}</label>
              <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filter.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filter.all')}</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{t(`category.${cat}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">{t('filter.goal')}</label>
              <Select value={filters.goal} onValueChange={(value) => setFilters({...filters, goal: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filter.selectGoal')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filter.all')}</SelectItem>
                  {GOALS.map(goal => (
                    <SelectItem key={goal} value={goal}>{t(`goal.${goal}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(filters.gender !== 'all' || filters.country || filters.language || 
              filters.ethnicity !== 'all' || filters.category !== 'all' || filters.goal !== 'all') && (
              <Button
                onClick={() => setFilters({
                  gender: 'all', country: '', language: '', 
                  ethnicity: 'all', category: 'all', goal: 'all'
                })}
                variant="outline"
                className="w-full"
              >
                {t('filter.clearAll')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}