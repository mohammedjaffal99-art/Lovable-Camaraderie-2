import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthContext';

const COUNTRY_CODES = {
  "Albania": "AL", "Algeria": "DZ", "Andorra": "AD", "Angola": "AO",
  "Argentina": "AR", "Armenia": "AM", "Australia": "AU", "Austria": "AT",
  "Bahamas": "BS", "Bahrain": "BH", "Bangladesh": "BD", "Barbados": "BB", "Belarus": "BY",
  "Belgium": "BE", "Belize": "BZ", "Benin": "BJ", "Bhutan": "BT", "Bolivia": "BO",
  "Bosnia": "BA", "Botswana": "BW", "Brazil": "BR", "Brunei": "BN", "Bulgaria": "BG",
  "Burkina Faso": "BF", "Burundi": "BI", "Cambodia": "KH", "Cameroon": "CM",
  "Canada": "CA", "Cape Verde": "CV", "Chad": "TD", "Chile": "CL", "China": "CN",
  "Colombia": "CO", "Comoros": "KM", "Congo": "CG", "Costa Rica": "CR", "Croatia": "HR",
  "Cyprus": "CY", "Czech Republic": "CZ", "Denmark": "DK", "Djibouti": "DJ", "Dominica": "DM",
  "Dominican Republic": "DO", "Ecuador": "EC", "Egypt": "EG", "El Salvador": "SV",
  "Equatorial Guinea": "GQ", "Eritrea": "ER", "Estonia": "EE", "Ethiopia": "ET", "Fiji": "FJ",
  "Finland": "FI", "France": "FR", "Gabon": "GA", "Gambia": "GM", "Georgia": "GE",
  "Germany": "DE", "Ghana": "GH", "Greece": "GR", "Grenada": "GD", "Guatemala": "GT",
  "Guinea": "GN", "Guyana": "GY", "Haiti": "HT", "Honduras": "HN", "Hungary": "HU",
  "Iceland": "IS", "India": "IN", "Indonesia": "ID", "Iraq": "IQ", "Ireland": "IE",
  "Italy": "IT", "Jamaica": "JM", "Japan": "JP", "Jordan": "JO",
  "Kenya": "KE", "Kiribati": "KI", "South Korea": "KR", "Kosovo": "XK", "Kuwait": "KW",
  "Kyrgyzstan": "KG", "Laos": "LA", "Latvia": "LV", "Lebanon": "LB", "Lesotho": "LS",
  "Liberia": "LR", "Libya": "LY", "Liechtenstein": "LI", "Lithuania": "LT", "Luxembourg": "LU",
  "Macedonia": "MK", "Madagascar": "MG", "Malawi": "MW", "Malaysia": "MY", "Maldives": "MV",
  "Mali": "ML", "Malta": "MT", "Marshall Islands": "MH", "Mauritania": "MR", "Mauritius": "MU",
  "Mexico": "MX", "Micronesia": "FM", "Moldova": "MD", "Monaco": "MC", "Mongolia": "MN",
  "Montenegro": "ME", "Morocco": "MA", "Mozambique": "MZ", "Myanmar": "MM", "Namibia": "NA",
  "Nauru": "NR", "Nepal": "NP", "Netherlands": "NL", "New Zealand": "NZ", "Nicaragua": "NI",
  "Niger": "NE", "Nigeria": "NG", "Norway": "NO", "Oman": "OM", "Pakistan": "PK", "Palau": "PW",
  "Palestine": "PS", "Panama": "PA", "Papua New Guinea": "PG", "Paraguay": "PY", "Peru": "PE",
  "Philippines": "PH", "Poland": "PL", "Portugal": "PT", "Qatar": "QA", "Romania": "RO",
  "Russia": "RU", "Rwanda": "RW", "Saint Lucia": "LC", "Samoa": "WS", "San Marino": "SM",
  "Saudi Arabia": "SA", "Senegal": "SN", "Serbia": "RS", "Seychelles": "SC", "Sierra Leone": "SL",
  "Singapore": "SG", "Slovakia": "SK", "Slovenia": "SI", "Solomon Islands": "SB", "Somalia": "SO",
  "South Africa": "ZA", "Spain": "ES", "Sri Lanka": "LK", "Sudan": "SD", "Suriname": "SR",
  "Swaziland": "SZ", "Sweden": "SE", "Switzerland": "CH", "Taiwan": "TW", "Tanzania": "TZ",
  "Thailand": "TH", "Togo": "TG", "Tonga": "TO", "Trinidad and Tobago": "TT", "Tunisia": "TN",
  "Turkey": "TR", "Tuvalu": "TV", "Uganda": "UG", "Ukraine": "UA", "United Arab Emirates": "AE",
  "United Kingdom": "GB", "United States": "US", "Uruguay": "UY", "Vanuatu": "VU",
  "Vatican City": "VA", "Venezuela": "VE", "Vietnam": "VN", "Yemen": "YE", "Zambia": "ZM",
  "Zimbabwe": "ZW"
};

const countryFlagUrls = {
  'United States': 'https://flagcdn.com/w40/us.png',
  'United Kingdom': 'https://flagcdn.com/w40/gb.png',
  'Canada': 'https://flagcdn.com/w40/ca.png',
  'Australia': 'https://flagcdn.com/w40/au.png',
  'Germany': 'https://flagcdn.com/w40/de.png',
  'France': 'https://flagcdn.com/w40/fr.png',
  'Italy': 'https://flagcdn.com/w40/it.png',
  'Spain': 'https://flagcdn.com/w40/es.png',
  'Netherlands': 'https://flagcdn.com/w40/nl.png',
  'Sweden': 'https://flagcdn.com/w40/se.png',
  'Norway': 'https://flagcdn.com/w40/no.png',
  'Denmark': 'https://flagcdn.com/w40/dk.png',
  'Finland': 'https://flagcdn.com/w40/fi.png',
  'Poland': 'https://flagcdn.com/w40/pl.png',
  'Russia': 'https://flagcdn.com/w40/ru.png',
  'Ukraine': 'https://flagcdn.com/w40/ua.png',
  'Turkey': 'https://flagcdn.com/w40/tr.png',
  'Greece': 'https://flagcdn.com/w40/gr.png',
  'Portugal': 'https://flagcdn.com/w40/pt.png',
  'Brazil': 'https://flagcdn.com/w40/br.png',
  'Mexico': 'https://flagcdn.com/w40/mx.png',
  'Argentina': 'https://flagcdn.com/w40/ar.png',
  'Colombia': 'https://flagcdn.com/w40/co.png',
  'Chile': 'https://flagcdn.com/w40/cl.png',
  'Japan': 'https://flagcdn.com/w40/jp.png',
  'China': 'https://flagcdn.com/w40/cn.png',
  'South Korea': 'https://flagcdn.com/w40/kr.png',
  'India': 'https://flagcdn.com/w40/in.png',
  'Thailand': 'https://flagcdn.com/w40/th.png',
  'Vietnam': 'https://flagcdn.com/w40/vn.png',
  'Philippines': 'https://flagcdn.com/w40/ph.png',
  'Indonesia': 'https://flagcdn.com/w40/id.png',
  'Malaysia': 'https://flagcdn.com/w40/my.png',
  'Singapore': 'https://flagcdn.com/w40/sg.png',
  'South Africa': 'https://flagcdn.com/w40/za.png',
  'Egypt': 'https://flagcdn.com/w40/eg.png',
  'Morocco': 'https://flagcdn.com/w40/ma.png',
  'Nigeria': 'https://flagcdn.com/w40/ng.png',
  'Kenya': 'https://flagcdn.com/w40/ke.png',
  'Israel': 'https://flagcdn.com/w40/il.png',
  'Saudi Arabia': 'https://flagcdn.com/w40/sa.png',
  'United Arab Emirates': 'https://flagcdn.com/w40/ae.png',
  'Lebanon': 'https://flagcdn.com/w40/lb.png',
  'New Zealand': 'https://flagcdn.com/w40/nz.png',
  'Ireland': 'https://flagcdn.com/w40/ie.png',
  'Switzerland': 'https://flagcdn.com/w40/ch.png',
  'Austria': 'https://flagcdn.com/w40/at.png',
  'Belgium': 'https://flagcdn.com/w40/be.png',
  'Czech Republic': 'https://flagcdn.com/w40/cz.png',
  'Hungary': 'https://flagcdn.com/w40/hu.png',
  'Romania': 'https://flagcdn.com/w40/ro.png',
  'Bulgaria': 'https://flagcdn.com/w40/bg.png',
  'Croatia': 'https://flagcdn.com/w40/hr.png'
};

export default function BroadcasterCard({ broadcaster }) {
  const { user } = useAuth();
  const userRole = user?.user_role || 'guest';
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-red-600 text-white animate-pulse font-bold px-3 py-1 text-xs shadow-lg">LIVE</Badge>;
      case 'online':
        return <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg" />;
      case 'in_session':
        return <Badge className="bg-yellow-600 text-white font-bold px-3 py-1 text-xs shadow-lg">IN SESSION</Badge>;
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-500 shadow-lg" />;
    }
  };

  const canViewProfile = ['user', 'streamer', 'moderator', 'admin'].includes(userRole);

  return (
    <Link 
      to={canViewProfile ? createPageUrl(`BroadcasterProfile?id=${broadcaster.id}`) : '#'}
      onClick={(e) => {
        if (!canViewProfile) {
          e.preventDefault();
          alert('Please sign in to view broadcaster profiles');
        }
      }}
      className="block"
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border" style={{ maxWidth: '280px', margin: '0 auto', borderColor: '#00BFFF' }}>
        <div className="relative aspect-[3/4]">
          <div className="absolute top-3 left-3 z-20">
            {getStatusBadge(broadcaster.status)}
          </div>

          <img
            src={broadcaster.photo_1 || '/placeholder-avatar.png'}
            alt={broadcaster.full_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          <div 
            className="absolute bottom-0 left-0 right-0 p-3"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'
            }}
          >
            <div className="flex items-end justify-between">
              <div className="flex items-center gap-1.5">
                {broadcaster.country && COUNTRY_CODES[broadcaster.country] && (
                  <img 
                    src={`https://flagcdn.com/w40/${COUNTRY_CODES[broadcaster.country].toLowerCase()}.png`}
                    alt={broadcaster.country}
                    className="w-6 h-4 object-cover rounded-sm shadow-lg"
                    onError={(e) => {
                      e.target.src = 'https://flagcdn.com/w40/un.png';
                    }}
                  />
                )}
                <span className="text-white font-bold text-sm bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm shadow-lg">
                  {broadcaster.level || 0}
                </span>
              </div>
              <h3 
                className="font-bold text-base text-white"
                style={{
                  textShadow: '0px 1px 3px rgba(0,0,0,0.8)'
                }}
              >
                {broadcaster.full_name}
              </h3>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}