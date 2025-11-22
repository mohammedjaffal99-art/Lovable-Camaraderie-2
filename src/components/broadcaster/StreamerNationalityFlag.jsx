import React from 'react';

const countryFlagUrls = {
  'United States': 'https://flagcdn.com/w40/us.png',
  'Canada': 'https://flagcdn.com/w40/ca.png',
  'United Kingdom': 'https://flagcdn.com/w40/gb.png',
  'Australia': 'https://flagcdn.com/w40/au.png',
  'Germany': 'https://flagcdn.com/w40/de.png',
  'France': 'https://flagcdn.com/w40/fr.png',
  'Spain': 'https://flagcdn.com/w40/es.png',
  'Italy': 'https://flagcdn.com/w40/it.png',
  'Brazil': 'https://flagcdn.com/w40/br.png',
  'Mexico': 'https://flagcdn.com/w40/mx.png',
  'Argentina': 'https://flagcdn.com/w40/ar.png',
  'Colombia': 'https://flagcdn.com/w40/co.png',
  'Russia': 'https://flagcdn.com/w40/ru.png',
  'Ukraine': 'https://flagcdn.com/w40/ua.png',
  'Poland': 'https://flagcdn.com/w40/pl.png',
  'Romania': 'https://flagcdn.com/w40/ro.png',
  'Netherlands': 'https://flagcdn.com/w40/nl.png',
  'Belgium': 'https://flagcdn.com/w40/be.png',
  'Sweden': 'https://flagcdn.com/w40/se.png',
  'Norway': 'https://flagcdn.com/w40/no.png',
  'Denmark': 'https://flagcdn.com/w40/dk.png',
  'Finland': 'https://flagcdn.com/w40/fi.png',
  'Switzerland': 'https://flagcdn.com/w40/ch.png',
  'Austria': 'https://flagcdn.com/w40/at.png',
  'Greece': 'https://flagcdn.com/w40/gr.png',
  'Portugal': 'https://flagcdn.com/w40/pt.png',
  'Turkey': 'https://flagcdn.com/w40/tr.png',
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
  'New Zealand': 'https://flagcdn.com/w40/nz.png',
  'South Africa': 'https://flagcdn.com/w40/za.png',
  'Egypt': 'https://flagcdn.com/w40/eg.png',
  'Saudi Arabia': 'https://flagcdn.com/w40/sa.png',
  'United Arab Emirates': 'https://flagcdn.com/w40/ae.png',
  'Israel': 'https://flagcdn.com/w40/il.png',
  'Chile': 'https://flagcdn.com/w40/cl.png',
  'Peru': 'https://flagcdn.com/w40/pe.png',
  'Venezuela': 'https://flagcdn.com/w40/ve.png',
  'Ecuador': 'https://flagcdn.com/w40/ec.png',
  'Czech Republic': 'https://flagcdn.com/w40/cz.png',
  'Hungary': 'https://flagcdn.com/w40/hu.png',
  'Croatia': 'https://flagcdn.com/w40/hr.png',
  'Bulgaria': 'https://flagcdn.com/w40/bg.png',
  'Serbia': 'https://flagcdn.com/w40/rs.png',
  'Slovakia': 'https://flagcdn.com/w40/sk.png',
  'Slovenia': 'https://flagcdn.com/w40/si.png',
  'Lithuania': 'https://flagcdn.com/w40/lt.png',
  'Latvia': 'https://flagcdn.com/w40/lv.png',
  'Estonia': 'https://flagcdn.com/w40/ee.png',
  'Ireland': 'https://flagcdn.com/w40/ie.png',
  'Iceland': 'https://flagcdn.com/w40/is.png',
  'Luxembourg': 'https://flagcdn.com/w40/lu.png',
  'Cyprus': 'https://flagcdn.com/w40/cy.png',
  'Malta': 'https://flagcdn.com/w40/mt.png',
};

export default function StreamerNationalityFlag({ country }) {
  if (!country) return null;
  
  const flagUrl = countryFlagUrls[country];
  if (!flagUrl) return null;

  return (
    <div className="flex justify-center" style={{ marginTop: '8px', marginBottom: '12px' }}>
      <img 
        src={flagUrl} 
        alt={`${country} flag`}
        className="object-contain"
        style={{ 
          width: '24px',
          height: 'auto',
          borderRadius: '4px'
        }}
      />
    </div>
  );
}