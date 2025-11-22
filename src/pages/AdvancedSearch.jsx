import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ChevronLeft, Search, Check, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import BroadcasterCard from '../components/home/BroadcasterCard';

const CATEGORIES = ["Artwork and Creative", "ASMR and Relaxation", "Books and Novels", "Crafting and Making", "Debating and Talk shows", "Education and Tutorials", "Entertainment and Cinema", "Video games and Consoles", "Vlogging and Real life streaming", "Kitchen and Recipes", "Meditation and Wellness", "Music and Concerts", "Nature and Camping", "News and Politics", "Outdoor Activities", "Sports and Workouts", "Tech and Reviews"];

const LANGUAGES = ["Afrikaans", "Albanian", "Arabic", "Armenian", "Belarusian", "Bosnian", "Bulgarian", "Burmese", "Cantonese", "Catalan", "Croatian", "Czech", "Danish", "Dutch", "English", "Estonian", "Finnish", "French", "Georgian", "German", "Greek", "Haitian Creole", "Hindi", "Hungarian", "Indonesian", "Italian", "Japanese", "Khmer", "Korean", "Kurdish", "Kyrgyz", "Lao", "Latvian", "Lithuanian", "Macedonian", "Malagasy", "Malay", "Mandarin Chinese", "Mongolian", "Norwegian", "Polish", "Portuguese", "Romanian", "Russian", "Serbian", "Serbo-Croatian", "Slovak", "Slovenian", "Spanish", "Swedish", "Tagalog", "Tajik", "Thai", "Turkish", "Ukrainian", "Urdu", "Vietnamese", "Welsh"];

const COUNTRIES = ["Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iraq", "Ireland", "Italy", "Jamaica", "Japan", "Jordan", "Kenya", "Kiribati", "South Korea", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Lucia", "Samoa", "San Marino", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Taiwan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];

const COUNTRY_CODES = {
  "Albania": "AL", "Algeria": "DZ", "Andorra": "AD", "Angola": "AO",
  "Argentina": "AR", "Armenia": "AM", "Australia": "AU", "Austria": "AT",
  "Bahamas": "BS", "Bahrain": "BH", "Bangladesh": "BD", "Barbados": "BB", "Belarus": "BY",
  "Belgium": "BE", "Belize": "BZ", "Benin": "BJ", "Bhutan": "BT", "Bolivia": "BO",
  "Bosnia": "BA", "Botswana": "BW", "Brazil": "BR", "Brunei": "BN", "Bulgaria": "BG",
  "Burkina Faso": "BF", "Burundi": "BI", "Cambodia": "KH", "Cameroon": "CM", "Canada": "CA",
  "Cape Verde": "CV", "Chad": "TD", "Chile": "CL", "China": "CN", "Colombia": "CO",
  "Comoros": "KM", "Congo": "CG", "Costa Rica": "CR", "Croatia": "HR",
  "Cyprus": "CY", "Czech Republic": "CZ", "Denmark": "DK", "Djibouti": "DJ", "Dominica": "DM",
  "Dominican Republic": "DO", "Ecuador": "EC", "Egypt": "EG", "El Salvador": "SV", "Equatorial Guinea": "GQ",
  "Eritrea": "ER", "Estonia": "EE", "Ethiopia": "ET", "Fiji": "FJ", "Finland": "FI",
  "France": "FR", "Gabon": "GA", "Gambia": "GM", "Georgia": "GE", "Germany": "DE",
  "Ghana": "GH", "Greece": "GR", "Grenada": "GD", "Guatemala": "GT", "Guinea": "GN",
  "Guyana": "GY", "Haiti": "HT", "Honduras": "HN", "Hungary": "HU", "Iceland": "IS",
  "India": "IN", "Indonesia": "ID", "Iraq": "IQ", "Ireland": "IE",
  "Italy": "IT", "Jamaica": "JM", "Japan": "JP", "Jordan": "JO",
  "Kenya": "KE", "Kiribati": "KI", "South Korea": "KR",
  "Kosovo": "XK", "Kuwait": "KW", "Kyrgyzstan": "KG", "Laos": "LA", "Latvia": "LV",
  "Lebanon": "LB", "Lesotho": "LS", "Liberia": "LR", "Libya": "LY", "Liechtenstein": "LI",
  "Lithuania": "LT", "Luxembourg": "LU", "Macedonia": "MK", "Madagascar": "MG", "Malawi": "MW",
  "Malaysia": "MY", "Maldives": "MV", "Mali": "ML", "Malta": "MT", "Marshall Islands": "MH",
  "Mauritania": "MR", "Mauritius": "MU", "Mexico": "MX", "Micronesia": "FM", "Moldova": "MD",
  "Monaco": "MC", "Mongolia": "MN", "Montenegro": "ME", "Morocco": "MA", "Mozambique": "MZ",
  "Myanmar": "MM", "Namibia": "NA", "Nauru": "NR", "Nepal": "NP", "Netherlands": "NL",
  "New Zealand": "NZ", "Nicaragua": "NI", "Niger": "NE", "Nigeria": "NG", "Norway": "NO",
  "Oman": "OM", "Pakistan": "PK", "Palau": "PW", "Palestine": "PS", "Panama": "PA",
  "Papua New Guinea": "PG", "Paraguay": "PY", "Peru": "PE", "Philippines": "PH", "Poland": "PL",
  "Portugal": "PT", "Qatar": "QA", "Romania": "RO", "Russia": "RU", "Rwanda": "RW",
  "Saint Lucia": "LC", "Samoa": "WS", "San Marino": "SM", "Saudi Arabia": "SA", "Senegal": "SN",
  "Serbia": "RS", "Seychelles": "SC", "Sierra Leone": "SL", "Singapore": "SG", "Slovakia": "SK",
  "Slovenia": "SI", "Solomon Islands": "SB", "Somalia": "SO", "South Africa": "ZA",
  "Spain": "ES", "Sri Lanka": "LK", "Sudan": "SD", "Suriname": "SR", "Swaziland": "SZ",
  "Sweden": "SE", "Switzerland": "CH", "Taiwan": "TW",
  "Tanzania": "TZ", "Thailand": "TH", "Togo": "TG", "Tonga": "TO", "Trinidad and Tobago": "TT",
  "Tunisia": "TN", "Turkey": "TR", "Tuvalu": "TV", "Uganda": "UG",
  "Ukraine": "UA", "United Arab Emirates": "AE", "United Kingdom": "GB", "United States": "US",
  "Uruguay": "UY", "Vanuatu": "VU", "Vatican City": "VA", "Venezuela": "VE",
  "Vietnam": "VN", "Yemen": "YE", "Zambia": "ZM", "Zimbabwe": "ZW"
};

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

const ETHNICITIES = ["African", "American", "Arabic", "Asian", "European", "Latin American", "Pacific Islander"];
const GENDERS = ["male", "female"];
const GOALS = ["Language Exchange", "Make New Friends", "Open to All Possibilities"];

export default function AdvancedSearch() {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);

  const [searchMethods, setSearchMethods] = useState({
    country: false,
    category: false,
    ethnicity: false,
    gender: false,
    goal: false,
    language: false
  });

  const [filters, setFilters] = useState({
    gender: [],
    country: [],
    language: [],
    ethnicity: [],
    category: [],
    goal: []
  });

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: broadcasters, isLoading } = useQuery({
    queryKey: ['broadcasters'],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list('-last_active');
      return allUsers.filter((u) => u.role === 'broadcaster' && u.broadcaster_approved);
    },
    refetchInterval: 10000,
    initialData: []
  });

  const filteredBroadcasters = React.useMemo(() => {
    if (step !== 3) return [];

    return broadcasters.filter((b) => {
      if (searchMethods.gender && filters.gender.length > 0 && !filters.gender.includes(b.gender)) return false;
      if (searchMethods.country && filters.country.length > 0 && !filters.country.includes(b.country)) return false;
      if (searchMethods.ethnicity && filters.ethnicity.length > 0 && !filters.ethnicity.includes(b.ethnicity)) return false;
      if (searchMethods.category && filters.category.length > 0 && !filters.category.some((c) => [b.category_1, b.category_2].includes(c))) return false;
      if (searchMethods.goal && filters.goal.length > 0 && !filters.goal.includes(b.goal)) return false;
      if (searchMethods.language && filters.language.length > 0 && !filters.language.some((l) => [b.native_language, b.language_2, b.language_3, b.language_4].includes(l))) return false;
      return true;
    });
  }, [broadcasters, filters, searchMethods, step]);

  const handleMethodToggle = (method) => {
    setSearchMethods((prev) => ({ ...prev, [method]: !prev[method] }));
  };

  const handleContinue = () => {
    const hasAnyMethod = Object.values(searchMethods).some((v) => v);
    if (!hasAnyMethod) {
      alert('Please select at least one search method');
      return;
    }
    setStep(2);
  };

  const handleViewResults = () => {
    setStep(3);
  };

  const handleSearchAgain = () => {
    setStep(1);
    setSearchMethods({
      country: false,
      category: false,
      ethnicity: false,
      gender: false,
      goal: false,
      language: false
    });
    setFilters({
      gender: [],
      country: [],
      language: [],
      ethnicity: [],
      category: [],
      goal: []
    });
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  if (step === 1) {
    return (
      <div
        className="min-h-screen py-12 px-4 flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)',
          minHeight: '100vh'
        }}>

        <div className="relative z-10 text-center" style={{ maxWidth: '500px' }}>
          <h1 className="text-3xl font-bold mb-6 text-white" style={{ textShadow: '0 2px 10px rgba(0,85,164,0.3)' }}>
            How do you want to search?
          </h1>

          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2" style={{ borderColor: '#00BFFF' }}>
            <p className="mb-4 text-base font-bold" style={{ color: '#0055A4' }}>Choose one or more method below:</p>

            <div className="mb-4 space-y-2">
              {Object.keys(searchMethods).map((method) => (
                <div
                  key={method}
                  onClick={() => handleMethodToggle(method)}
                  className={`bg-white px-4 py-2 rounded-lg flex items-center space-x-3 transition-all cursor-pointer transform hover:scale-105 shadow-md hover:shadow-xl border-2 ${
                    searchMethods[method] ? 'border-blue-600' : 'border-gray-200'
                  }`}
                  style={{ borderColor: searchMethods[method] ? '#0055A4' : '#E5E7EB' }}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  searchMethods[method] ?
                  'border-blue-500 bg-blue-500' :
                  'border-gray-300 bg-white'}`
                  } style={{ borderColor: searchMethods[method] ? '#0055A4' : undefined, backgroundColor: searchMethods[method] ? '#0055A4' : undefined }}>
                    {searchMethods[method] && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-sm font-bold flex-1 text-left ${
                  searchMethods[method] ? '' : ''}`
                  } style={{ color: searchMethods[method] ? '#0055A4' : '#4A90E2' }}>
                    Search by {method.charAt(0).toUpperCase() + method.slice(1)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleContinue}
                className="px-8 py-2 text-base font-bold rounded-full shadow-xl hover:shadow-2xl transition-all"
                style={{ backgroundColor: '#0055A4' }}>

                Continue <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>);

  }

  if (step === 2) {
    return (
      <div
        className="min-h-screen py-12 px-4 flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)',
          minHeight: '100vh'
        }}>

        <div className="max-w-md relative z-10 text-center">
          <h1 className="text-3xl font-bold mb-6 text-white" style={{ textShadow: '0 2px 10px rgba(0,85,164,0.3)' }}>
            Select Your Filters
          </h1>
          <div className="space-y-3">
            {Object.entries(searchMethods).filter(([_, value]) => value).map(([key]) => (
              <div key={key} className="bg-white rounded-xl shadow-2xl p-4 transform hover:scale-102 transition-all border-2" style={{ borderColor: '#00BFFF' }}>
                <Label className="text-sm font-bold mb-2 block" style={{ color: '#0055A4' }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Label>
                <Select
                  value={filters[key][0] || 'none'}
                  onValueChange={(value) => setFilters({ ...filters, [key]: value === 'none' ? [] : [value] })}>
                  <SelectTrigger className="w-full h-9 text-sm font-semibold border-2" style={{ borderColor: '#87CEEB' }}>
                    <SelectValue placeholder={`Any ${key}...`} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="none">Any {key}...</SelectItem>
                    {key === 'country' ?
                      COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c} className="font-semibold">
                          <div className="flex items-center gap-2">
                            {COUNTRY_CODES[c] && (
                              <img
                                src={`https://flagcdn.com/w40/${COUNTRY_CODES[c].toLowerCase()}.png`}
                                alt={c}
                                className="w-7 h-5 object-cover rounded shadow-sm border"
                                style={{ borderColor: '#0055A4' }}
                              />
                            )}
                            <span>{c}</span>
                          </div>
                        </SelectItem>
                      ))
                    : key === 'language' ?
                      LANGUAGES.map((l) => (
                        <SelectItem key={l} value={l} className="font-semibold">
                          <div className="flex items-center gap-2">
                            {LANGUAGE_FLAGS[l] ? (
                              <img
                                src={`https://flagcdn.com/w40/${LANGUAGE_FLAGS[l].toLowerCase()}.png`}
                                alt={l}
                                className="w-7 h-5 object-cover rounded shadow-sm border"
                                style={{ borderColor: '#00BFFF' }}
                              />
                            ) : (
                              <Globe className="w-5 h-5" style={{ color: '#4A90E2' }} />
                            )}
                            <span>{l}</span>
                          </div>
                        </SelectItem>
                      ))
                    : (key === 'category' ? CATEGORIES :
                      key === 'ethnicity' ? ETHNICITIES :
                      key === 'gender' ? GENDERS :
                      key === 'goal' ? GOALS : []
                    ).map((item) => (
                      <SelectItem key={item} value={item} className="capitalize font-semibold">{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleBack}
                className="px-6 py-2 text-sm font-bold rounded-full border-2 shadow-xl"
                style={{ backgroundColor: 'white', color: '#0055A4', borderColor: '#00BFFF' }}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={handleViewResults}
                className="flex-1 px-6 py-2 text-base font-bold rounded-full shadow-xl hover:shadow-2xl transition-all"
                style={{ backgroundColor: '#0055A4' }}>
                <Search className="w-4 h-4 mr-2" />
                View Filtered Profiles
              </Button>
            </div>
          </div>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-center items-center">
          <h1 className="text-3xl font-bold text-white" style={{ textShadow: '0 2px 10px rgba(0,85,164,0.3)' }}>
            Filtered Streamers
          </h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-white bg-opacity-30 animate-pulse rounded-2xl shadow-lg"></div>
            ))}
          </div>
        ) : filteredBroadcasters.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-2xl p-12 inline-block border-2" style={{ borderColor: '#00BFFF' }}>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#0055A4' }}>Sorry, no records met your filter criteria.</h3>
              <p className="text-base mb-6 font-semibold" style={{ color: '#4A90E2' }}>Try adjusting your filters or selecting different criteria</p>
              <Button
                onClick={handleSearchAgain}
                className="px-8 py-2 text-base rounded-full shadow-2xl hover:shadow-3xl transition-all font-bold"
                style={{ backgroundColor: '#0055A4' }}>
                <Search className="w-5 h-5 mr-2" />
                Search Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBroadcasters.map((broadcaster) => (
              <BroadcasterCard key={broadcaster.id} broadcaster={broadcaster} currentUser={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}