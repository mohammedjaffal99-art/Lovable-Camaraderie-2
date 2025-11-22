
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Video, Upload, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { showToast } from "@/components/ui/toast-utils";

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

const ETHNICITIES = ["African", "American", "Arabic", "Asian", "European", "Latin American", "Pacific Islander"];
const GOALS = ["Language Exchange", "Make New Friends", "Open to All Possibilities"];

const CATEGORIES = ["Artwork and Creative", "ASMR and Relaxation", "Books and Novels", "Crafting and Making", "Debating and Talk shows", "Education and Tutorials", "Entertainment and Cinema", "Video games and Consoles", "Vlogging and Real life streaming", "Kitchen and Recipes", "Meditation and Wellness", "Music and Concerts", "Nature and Camping", "News and Politics", "Outdoor Activities", "Sports and Workouts", "Tech and Reviews"];

const validateSocialMediaLink = (platform, value) => {
  if (!value || !value.trim()) return { valid: true, message: '' };
  
  const patterns = {
    instagram: /(?:instagram\.com\/|@)([a-zA-Z0-9._]+)/i,
    tiktok: /(?:tiktok\.com\/@|@)([a-zA-Z0-9._]+)/i,
    twitter: /(?:twitter\.com\/|x\.com\/|@)([a-zA-Z0-9_]+)/i,
    snapchat: /^[a-zA-Z0-9._-]{3,15}$/
  };
  
  const pattern = patterns[platform];
  if (!pattern) return { valid: true, message: '' };
  
  if (value.startsWith('@') || !value.includes('.com')) {
    const username = value.replace('@', '');
    if (platform === 'snapchat') {
      return { valid: pattern.test(username), message: `Invalid ${platform} username format` };
    }
    return { valid: true, message: '' };
  }
  
  const platformDomains = {
    instagram: 'instagram.com',
    tiktok: 'tiktok.com',
    twitter: ['twitter.com', 'x.com'],
    snapchat: 'snapchat.com'
  };
  
  const domains = Array.isArray(platformDomains[platform]) ? platformDomains[platform] : [platformDomains[platform]];
  const containsPlatformDomain = domains.some(domain => value.toLowerCase().includes(domain));
  
  if (!containsPlatformDomain) {
    return {
      valid: false,
      message: `This link doesn't belong to ${platform.charAt(0).toUpperCase() + platform.slice(1)}. Please enter a valid ${platform} username or link.`
    };
  }
  
  return { valid: pattern.test(value), message: pattern.test(value) ? '' : `Invalid ${platform} link format` };
};

export default function Register() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const u = await base44.auth.me();
        setCurrentUser(u);

        if (u.role && u.profile_completed && !u.requested_role) {
          if (u.role === 'broadcaster' || (u.role === 'admin' && u.broadcaster_approved)) {
            navigate(createPageUrl('BroadcasterDashboard'));
          } else {
            navigate(createPageUrl('Home'));
          }
          return;
        }
        
        if (u.role || u.requested_role) {
          if (u.role === 'broadcaster' || (u.role === 'admin' && u.broadcaster_approved) || u.requested_role === 'broadcaster') {
            setAccountType('broadcaster');
            setStep(2);
          } else if (u.role === 'customer' || u.requested_role === 'customer') {
            setAccountType('customer');
            setStep(2);
          }
        }

        setCheckingAuth(false);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };

    checkAuth();
  }, [navigate]);

  const [formData, setFormData] = useState({
    full_name: '',
    gender: '',
    country: '',
    country_code: '',
    ethnicity: '',
    native_language: '',
    language_2: '',
    language_3: '',
    language_4: '',
    category_1: '',
    category_2: '',
    goal: '',
    instagram: '',
    tiktok: '',
    twitter: '',
    snapchat: ''
  });

  const [photoUrls, setPhotoUrls] = useState({
    photo_1: '',
    photo_2: '',
    photo_3: '',
    id_photo_1: '',
    id_photo_2: ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        full_name: currentUser.full_name || '',
        gender: currentUser.gender || '',
        country: currentUser.country || '',
        country_code: currentUser.country_code || '',
        ethnicity: currentUser.ethnicity || '',
        native_language: currentUser.native_language || '',
        language_2: currentUser.language_2 || '',
        language_3: currentUser.language_3 || '',
        language_4: currentUser.language_4 || '',
        category_1: currentUser.category_1 || '',
        category_2: currentUser.category_2 || '',
        goal: currentUser.goal || '',
        instagram: currentUser.instagram || '',
        tiktok: currentUser.tiktok || '',
        twitter: currentUser.twitter || '',
        snapchat: currentUser.snapchat || ''
      });

      setPhotoUrls({
        photo_1: currentUser.photo_1 || '',
        photo_2: currentUser.photo_2 || '',
        photo_3: currentUser.photo_3 || '',
        id_photo_1: currentUser.id_photo_1 || '',
        id_photo_2: currentUser.id_photo_2 || ''
      });
    }
  }, [currentUser]);

  const validateForm = () => {
    const errors = [];
    
    if (!formData.full_name?.trim()) errors.push({ field: 'full_name', label: 'Full Name' });
    if (!formData.gender) errors.push({ field: 'gender', label: 'Gender' });
    if (!formData.country) errors.push({ field: 'country', label: 'Country' });
    if (!formData.ethnicity) errors.push({ field: 'ethnicity', label: 'Ethnicity' });
    if (!formData.native_language) errors.push({ field: 'native_language', label: 'Native Language' });
    if (!formData.category_1) errors.push({ field: 'category_1', label: 'Category 1' });
    if (!formData.goal) errors.push({ field: 'goal', label: 'Goal' });
    
    if (!photoUrls.photo_1) errors.push({ field: 'photo_1', label: 'Profile Photo 1' });
    if (!photoUrls.photo_2) errors.push({ field: 'photo_2', label: 'Profile Photo 2' });
    if (!photoUrls.photo_3) errors.push({ field: 'photo_3', label: 'Profile Photo 3' });
    
    if (accountType === 'broadcaster') {
      if (!photoUrls.id_photo_1) errors.push({ field: 'id_photo_1', label: 'ID Photo 1 (Front)' });
      if (!photoUrls.id_photo_2) errors.push({ field: 'id_photo_2', label: 'ID Photo 2 (Back)' });
      
      const socialPlatforms = ['instagram', 'tiktok', 'twitter', 'snapchat'];
      const seenLinks = {};
      
      for (const platform of socialPlatforms) {
        const link = formData[platform];
        if (!link || !link.trim()) continue;
        
        const normalized = link.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/i, '');
        
        if (seenLinks[normalized]) {
          errors.push({ 
            field: platform, 
            label: `This username or link is already used for ${seenLinks[normalized]}. Please use a different one.` 
          });
        } else {
          seenLinks[normalized] = platform;
        }
        
        const validation = validateSocialMediaLink(platform, link);
        if (!validation.valid) {
          errors.push({ field: platform, label: validation.message || `Invalid ${platform} link format` });
        }
      }
    }
    
    return errors;
  };

  const handlePhotoUpload = async (field, file) => {
    if (!file) return;

    const toastId = showToast.loading('Uploading photo...');
    setUploading(true);
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const existingPhotos = Object.entries(photoUrls)
        .filter(([key, url]) => key !== field && url === file_url)
        .map(([key]) => key);
      
      if (existingPhotos.length > 0) {
        showToast.error(`This photo is already uploaded as ${existingPhotos[0].replace('_', ' ')}. Please choose a different photo.`, { id: toastId });
        setUploading(false);
        return;
      }
      
      setPhotoUrls(prev => ({ ...prev, [field]: file_url }));
      showToast.photoUploaded();
    } catch (error) {
      showToast.error(t('register.failedUploadPhoto'), { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoDelete = (field) => {
    setPhotoUrls(prev => ({ ...prev, [field]: '' }));
    showToast.photoDeleted();
  };

  const handleSocialMediaChange = (platform, value) => {
    setFormData(prev => ({ ...prev, [platform]: value }));
  };

  const getSelectedLanguages = () => {
    return [
      formData.native_language,
      formData.language_2,
      formData.language_3,
      formData.language_4
    ].filter(Boolean);
  };

  const isLanguageDisabled = (lang, currentField) => {
    if (lang === 'none') return false;
    const selected = getSelectedLanguages();
    return selected.includes(lang) && formData[currentField] !== lang;
  };

  const isCategoryDisabled = (category, currentField) => {
    if (category === 'none') return false;
    if (currentField === 'category_1') {
      return formData.category_2 === category;
    } else if (currentField === 'category_2') {
      return formData.category_1 === category;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      showToast.error('Please sign in first');
      base44.auth.redirectToLogin();
      return;
    }

    if (!accountType) {
      showToast.error('Please select an account type');
      setStep(1);
      return;
    }

    const errors = validateForm();
    if (errors.length > 0) {
      showToast.error(`Please complete all required fields: ${errors.map(e => e.label).join(', ')}`);
      
      setTimeout(() => {
        const element = document.getElementById(errors[0].field);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('border-red-500', 'border-2');
          setTimeout(() => element.classList.remove('border-red-500', 'border-2'), 3000);
        }
      }, 100);
      
      return;
    }

    setLoading(true);
    const toastId = showToast.loading('Submitting your profile...');

    try {
      const applicationId = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const updateData = {
        full_name: formData.full_name,
        photo_1: photoUrls.photo_1,
        photo_2: photoUrls.photo_2,
        photo_3: photoUrls.photo_3,
        status: currentUser.status || 'offline',
        last_active: new Date().toISOString(),
        profile_completed: true,
        gender: formData.gender,
        country: formData.country,
        country_code: formData.country_code,
        ethnicity: formData.ethnicity,
        native_language: formData.native_language,
        language_2: formData.language_2 || null,
        language_3: formData.language_3 || null,
        language_4: formData.language_4 || null,
        category_1: formData.category_1,
        category_2: formData.category_2 || null,
        goal: formData.goal,
        blocked_users: currentUser.blocked_users || [],
        blocked_regions: currentUser.blocked_regions || []
      };

      if (!currentUser.user_role) {
        updateData.user_role = 'user';
      }

      if (accountType === 'broadcaster') {
        updateData.requested_role = 'broadcaster';
        updateData.broadcaster_approved = false;
        updateData.application_id = applicationId;
        updateData.application_date = new Date().toISOString();
        updateData.id_photo_1 = photoUrls.id_photo_1;
        updateData.id_photo_2 = photoUrls.id_photo_2;
        updateData.instagram = formData.instagram || null;
        updateData.tiktok = formData.tiktok || null;
        updateData.twitter = formData.twitter || null;
        updateData.snapchat = formData.snapchat || null;
      } else if (accountType === 'customer') {
        if (!currentUser.user_role) {
          updateData.requested_role = 'customer';
        }
      }

      await base44.auth.updateMe(updateData);

      if (accountType === 'broadcaster') {
        try {
          await base44.integrations.Core.SendEmail({
            to: currentUser.email,
            subject: '✅ Streamer Application Received - Camaraderie.tv',
            body: `Hi ${formData.full_name},\n\nThank you for applying to become a streamer on Camaraderie.tv!\n\nApplication ID: ${applicationId}\n\nWe have received your application and our admin team is currently reviewing your submission. This typically takes 24-48 hours.\n\nYou will receive an email notification as soon as your application has been reviewed.\n\nIn the meantime, feel free to explore the platform and browse other streamers!\n\nBest regards,\nThe Camaraderie.tv Team\n\n---\nIf you have any questions, please contact us at support@camaraderie.tv`
          });
        } catch (emailError) {
          console.error('Failed to send applicant email:', emailError);
        }
      }

      if (!currentUser.role || accountType === 'broadcaster') {
        try {
          const adminUsers = await base44.entities.User.filter({ role: 'admin' });
          for (const admin of adminUsers) {
            await base44.entities.Notification.create({
              user_id: admin.id,
              type: accountType === 'broadcaster' ? 'approval_status' : 'admin_message',
              title: accountType === 'broadcaster' ? '🎬 New Broadcaster Application' : 'New User Registered',
              message: `${formData.full_name} (${currentUser.email}) has ${currentUser.role ? 'applied to become' : 'registered as'} a ${accountType === 'broadcaster' ? 'broadcaster' : 'customer'}. ${accountType === 'broadcaster' ? `Application ID: ${applicationId}. Please verify ID and approve account.` : 'Please set user role to customer.'}`,
              link: '/AdminPanel'
            });
          }
        } catch (notifError) {
          console.error('Failed to create admin notifications:', notifError);
        }
      }

      if (currentUser.role && !currentUser.requested_role) {
        showToast.profileUpdated();
        
        setTimeout(() => {
          if (currentUser.role === 'admin' && currentUser.broadcaster_approved) {
            navigate(createPageUrl('BroadcasterDashboard'));
          } else if (currentUser.role === 'broadcaster') {
            navigate(createPageUrl('BroadcasterDashboard'));
          } else {
            navigate(createPageUrl('Home'));
          }
        }, 2000);
      } else if (accountType === 'broadcaster') {
        showToast.broadcasterSubmitted();
        
        setTimeout(() => {
          navigate(createPageUrl('Home'));
        }, 5000);
      } else {
        showToast.profileCompleted();
        
        setTimeout(() => {
          navigate(createPageUrl('Home'));
        }, 3000);
      }
      
    } catch (error) {
      showToast.error(`Failed to complete profile: ${error.message || 'Please try again.'}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{
        background: 'linear-gradient(135deg, #0055A4 0%, #4A90E2 25%, #00BFFF 50%, #87CEEB 75%, #A8D8EA 100%)'
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-white mx-auto mb-8 shadow-xl"></div>
          <h2 className="text-4xl font-extrabold text-white mb-3">Loading Your Profile</h2>
          <p className="text-white text-xl font-semibold">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{
      background: 'linear-gradient(135deg, #0055A4 0%, #4A90E2 25%, #00BFFF 50%, #87CEEB 75%, #A8D8EA 100%)'
    }}>
      <div className="max-w-3xl mx-auto">
        {step === 1 && (
          <Card className="shadow-2xl border-4" style={{ borderColor: '#00BFFF' }}>
            <CardHeader className="rounded-t-xl" style={{ background: 'linear-gradient(90deg, #0055A4, #00BFFF)' }}>
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-3 mb-6">
                  {[1, 2].map((s) => (
                    <div key={s} className="flex items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-xl ${
                        step >= s ? 'bg-white' : 'bg-white bg-opacity-30'
                      }`} style={{ color: step >= s ? '#0055A4' : 'white' }}>
                        {s}
                      </div>
                      {s < 2 && (
                        <div className={`w-20 h-2 mx-3 rounded-full shadow-md ${step > s ? 'bg-white' : 'bg-white bg-opacity-30'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <CardTitle className="text-2xl text-center font-bold text-white">
                {'Choose Your Account Type'}
              </CardTitle>
              <p className="text-center text-white mt-3 font-medium text-base">
                {'Select how you want to use Camaraderie'}
              </p>
            </CardHeader>

            <CardContent className="p-8">
              <div className="space-y-6">
                {currentUser.role && (
                  <div className="rounded-xl p-6 border-l-4 shadow-lg" style={{ backgroundColor: '#E0F4FF', borderColor: '#0055A4' }}>
                    <p className="text-base font-extrabold" style={{ color: '#0055A4' }}>
                      <strong>ℹ️ Your Current Role:</strong> {currentUser.role === 'admin' ? 'Administrator' : currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                    </p>
                    {currentUser.broadcaster_approved && (
                      <p className="text-sm font-bold mt-2" style={{ color: '#00BFFF' }}>
                        ✓ Broadcaster access approved
                      </p>
                    )}
                    {currentUser.requested_role && (
                      <p className="text-sm font-bold mt-2 text-orange-600">
                        ⏳ Pending application for: {currentUser.requested_role.charAt(0).toUpperCase() + currentUser.requested_role.slice(1)}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-center gap-6">
                  <button
                    onClick={() => {
                      setAccountType('customer');
                      setStep(2);
                    }}
                    className={`p-8 rounded-2xl border-4 transition-all shadow-xl hover:shadow-2xl ${
                      accountType === 'customer' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                    }`}
                    style={{ width: '350px' }}
                  >
                    <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#0055A4' }} />
                    <h3 className="text-2xl font-extrabold mb-4" style={{ color: '#0055A4' }}>
                      {t('register.followerAudience')}
                    </h3>
                    <p className="text-base font-bold mb-4" style={{ color: '#4A90E2' }}>
                      {t('register.asFollower')}
                    </p>
                    <ul className="text-left text-sm space-y-2" style={{ color: '#4A90E2' }}>
                      <li>• {t('register.browseStreams')}</li>
                      <li>• {t('register.bookSessions')}</li>
                      <li>• {t('register.favoriteGet')}</li>
                      <li>• {t('register.chatPublic')}</li>
                    </ul>
                  </button>

                  <button
                    onClick={() => {
                      setAccountType('broadcaster');
                      setStep(2);
                    }}
                    className={`p-8 rounded-2xl border-4 transition-all shadow-xl hover:shadow-2xl ${
                      accountType === 'broadcaster' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                    }`}
                    style={{ width: '350px' }}
                  >
                    <Video className="w-16 h-16 mx-auto mb-4" style={{ color: '#00BFFF' }} />
                    <h3 className="text-2xl font-extrabold mb-4" style={{ color: '#00BFFF' }}>
                      {t('register.streamerModel')}
                    </h3>
                    <p className="text-base font-bold mb-4" style={{ color: '#4A90E2' }}>
                      {t('register.asStreamer')}
                    </p>
                    <ul className="text-left text-sm space-y-2" style={{ color: '#4A90E2' }}>
                      <li>• {t('register.hostLive')}</li>
                      <li>• {t('register.earnIncome')}</li>
                      <li>• {t('register.buildCommunity')}</li>
                      <li>• {t('register.levelUp')}</li>
                    </ul>
                    <p className="text-xs font-bold text-red-600 mt-4">
                      {t('register.requiresVerification')}
                    </p>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && currentUser && (
          <Card className="shadow-2xl border-4" style={{ borderColor: '#00BFFF' }}>
            <CardHeader className="rounded-t-lg" style={{ background: 'linear-gradient(90deg, #0055A4, #00BFFF)' }}>
              <CardTitle className="text-3xl font-extrabold text-white text-center">
                {t('register.completeProfile')}
              </CardTitle>
              <p className="text-white text-center mt-2 font-semibold">
                {t('register.welcome', { name: currentUser?.full_name?.split(' ')[0] || 'there' })}
              </p>
            </CardHeader>

            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-extrabold" style={{ color: '#0055A4' }}>{t('register.basicInfo')}</h3>

                  <div>
                    <Label htmlFor="full_name" className="text-base font-bold mb-2 block" style={{ color: '#0055A4' }}>Full Name *</Label>
                    <Input
                      id="full_name"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      placeholder="Your Display Name In the Platform"
                      className="mt-1 font-semibold border-2"
                      style={{ borderColor: '#87CEEB' }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gender" className="text-base font-bold mb-2 block" style={{ color: '#0055A4' }}>{t('register.gender')} *</Label>
                      <Select
                        required
                        value={formData.gender}
                        onValueChange={(value) => setFormData({...formData, gender: value})}
                      >
                        <SelectTrigger id="gender" className="border-2" style={{ borderColor: '#87CEEB' }}>
                          <SelectValue placeholder={t('register.select')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">{t('register.male')}</SelectItem>
                          <SelectItem value="female">{t('register.female')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="country" className="text-base font-bold mb-2 block" style={{ color: '#0055A4' }}>{t('register.country')} *</Label>
                      <Select
                        required
                        value={formData.country}
                        onValueChange={(value) => {
                          const countryCode = COUNTRY_CODES[value];
                          setFormData(prev => ({
                            ...prev,
                            country: value,
                            country_code: countryCode || ''
                          }));
                        }}
                      >
                        <SelectTrigger id="country" className="border-2" style={{ borderColor: '#87CEEB' }}>
                          <SelectValue placeholder={t('register.select')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {COUNTRIES.map(c => (
                            <SelectItem key={c} value={c}>
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
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ethnicity" className="text-base font-bold mb-2 block" style={{ color: '#0055A4' }}>{t('register.ethnicity')} *</Label>
                    <Select
                      required
                      value={formData.ethnicity}
                      onValueChange={(value) => setFormData({...formData, ethnicity: value})}
                    >
                      <SelectTrigger id="ethnicity" className="border-2" style={{ borderColor: '#87CEEB' }}>
                        <SelectValue placeholder={t('register.select')} />
                      </SelectTrigger>
                      <SelectContent>
                        {ETHNICITIES.map(e => (
                          <SelectItem key={e} value={e}>{t(`ethnicity.${e}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-bold" style={{ color: '#0055A4' }}>{t('register.languagesRequired')}</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="native_language" className="text-base font-bold mb-2 block" style={{ color: '#0055A4' }}>{t('register.nativeLanguage')} *</Label>
                      <Select
                        required
                        value={formData.native_language}
                        onValueChange={(value) => setFormData({...formData, native_language: value})}
                      >
                        <SelectTrigger id="native_language" className="border-2" style={{ borderColor: '#87CEEB' }}>
                          <SelectValue placeholder={t('register.select')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="none">{t('register.none')}</SelectItem>
                          {LANGUAGES.map(l => (
                            <SelectItem 
                              key={l} 
                              value={l}
                              disabled={isLanguageDisabled(l, 'native_language')}
                              className={isLanguageDisabled(l, 'native_language') ? 'opacity-40' : ''}
                            >
                              <div className="flex items-center gap-2">
                                {LANGUAGE_FLAGS[l] && (
                                  <img
                                    src={`https://flagcdn.com/w40/${LANGUAGE_FLAGS[l].toLowerCase()}.png`}
                                    alt={l}
                                    className="w-7 h-5 object-cover rounded shadow-sm border"
                                    style={{ borderColor: '#00BFFF' }}
                                  />
                                )}
                                <span>{l}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="language_2" className="text-base font-bold mb-2 block" style={{ color: '#0055A4' }}>{t('register.secondLanguage')}</Label>
                      <Select
                        value={formData.language_2}
                        onValueChange={(value) => setFormData({...formData, language_2: value === 'none' ? '' : value})}
                      >
                        <SelectTrigger id="language_2" className="border-2" style={{ borderColor: '#87CEEB' }}>
                          <SelectValue placeholder={t('register.optional')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="none">{t('register.none')}</SelectItem>
                          {LANGUAGES.map(l => (
                            <SelectItem 
                              key={l} 
                              value={l}
                              disabled={isLanguageDisabled(l, 'language_2')}
                              className={isLanguageDisabled(l, 'language_2') ? 'opacity-40' : ''}
                            >
                              <div className="flex items-center gap-2">
                                {LANGUAGE_FLAGS[l] && (
                                  <img
                                    src={`https://flagcdn.com/w40/${LANGUAGE_FLAGS[l].toLowerCase()}.png`}
                                    alt={l}
                                    className="w-7 h-5 object-cover rounded shadow-sm border"
                                    style={{ borderColor: '#00BFFF' }}
                                  />
                                )}
                                <span>{l}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="language_3" className="text-base font-bold mb-2 block" style={{ color: '#0055A4' }}>{t('register.thirdLanguage')}</Label>
                      <Select
                        value={formData.language_3}
                        onValueChange={(value) => setFormData({...formData, language_3: value === 'none' ? '' : value})}
                      >
                        <SelectTrigger id="language_3" className="border-2" style={{ borderColor: '#87CEEB' }}>
                          <SelectValue placeholder={t('register.optional')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="none">{t('register.none')}</SelectItem>
                          {LANGUAGES.map(l => (
                            <SelectItem 
                              key={l} 
                              value={l}
                              disabled={isLanguageDisabled(l, 'language_3')}
                              className={isLanguageDisabled(l, 'language_3') ? 'opacity-40' : ''}
                            >
                              <div className="flex items-center gap-2">
                                {LANGUAGE_FLAGS[l] && (
                                  <img
                                    src={`https://flagcdn.com/w40/${LANGUAGE_FLAGS[l].toLowerCase()}.png`}
                                    alt={l}
                                    className="w-7 h-5 object-cover rounded shadow-sm border"
                                    style={{ borderColor: '#00BFFF' }}
                                  />
                                )}
                                <span>{l}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="language_4" className="text-base font-bold mb-2 block" style={{ color: '#0055A4' }}>{t('register.fourthLanguage')}</Label>
                      <Select
                        value={formData.language_4}
                        onValueChange={(value) => setFormData({...formData, language_4: value === 'none' ? '' : value})}
                      >
                        <SelectTrigger id="language_4" className="border-2" style={{ borderColor: '#87CEEB' }}>
                          <SelectValue placeholder={t('register.optional')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="none">{t('register.none')}</SelectItem>
                          {LANGUAGES.map(l => (
                            <SelectItem 
                              key={l} 
                              value={l}
                              disabled={isLanguageDisabled(l, 'language_4')}
                              className={isLanguageDisabled(l, 'language_4') ? 'opacity-40' : ''}
                            >
                              <div className="flex items-center gap-2">
                                {LANGUAGE_FLAGS[l] && (
                                  <img
                                    src={`https://flagcdn.com/w40/${LANGUAGE_FLAGS[l].toLowerCase()}.png`}
                                    alt={l}
                                    className="w-7 h-5 object-cover rounded shadow-sm border"
                                    style={{ borderColor: '#00BFFF' }}
                                  />
                                )}
                                <span>{l}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-bold" style={{ color: '#0055A4' }}>
                    {accountType === 'broadcaster' ? 'Streamer Categories (Category 1 Required)' : t('register.interestsGoalRequired')}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category_1" className="text-base font-bold mb-2 block" style={{ color: '#0055A4' }}>{t('register.category1')} *</Label>
                      <Select
                        required
                        value={formData.category_1}
                        onValueChange={(value) => setFormData({...formData, category_1: value})}
                      >
                        <SelectTrigger id="category_1" className="border-2" style={{ borderColor: '#87CEEB' }}>
                          <SelectValue placeholder={t('register.select')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="none">{t('register.none')}</SelectItem>
                          {CATEGORIES.map(c => (
                            <SelectItem 
                              key={c} 
                              value={c}
                              disabled={isCategoryDisabled(c, 'category_1')}
                              className={isCategoryDisabled(c, 'category_1') ? 'opacity-40' : ''}
                            >
                              {t(`category.${c}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="category_2" className="text-base font-bold mb-2 block" style={{ color: '#0055A4' }}>{t('register.category2')}</Label>
                      <Select
                        value={formData.category_2}
                        onValueChange={(value) => setFormData({...formData, category_2: value === 'none' ? '' : value})}
                      >
                        <SelectTrigger id="category_2" className="border-2" style={{ borderColor: '#87CEEB' }}>
                          <SelectValue placeholder={t('register.optional')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="none">{t('register.none')}</SelectItem>
                          {CATEGORIES.map(c => (
                            <SelectItem 
                              key={c} 
                              value={c}
                              disabled={isCategoryDisabled(c, 'category_2')}
                              className={isCategoryDisabled(c, 'category_2') ? 'opacity-40' : ''}
                            >
                              {t(`category.${c}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="goal" className="text-base font-bold mb-2 block" style={{ color: '#0055A4' }}>{t('register.yourGoal')} *</Label>
                    <Select
                      required
                      value={formData.goal}
                      onValueChange={(value) => setFormData({...formData, goal: value})}
                    >
                      <SelectTrigger id="goal" className="border-2" style={{ borderColor: '#87CEEB' }}>
                        <SelectValue placeholder={t('register.select')} />
                      </SelectTrigger>
                      <SelectContent>
                        {GOALS.map(g => (
                          <SelectItem key={g} value={g}>{t(`goal.${g}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-bold" style={{ color: '#0055A4' }}>{t('register.profilePhotosRequired')}</h3>
                  <p className="text-sm font-bold text-red-600">{t('register.facePhotosWarning')}</p>

                  <div className="grid grid-cols-3 gap-3">
                    {['photo_1', 'photo_2', 'photo_3'].map((field, idx) => (
                      <div key={field} id={field} className="border-2 border-dashed rounded-xl p-3 text-center shadow-lg relative" style={{ borderColor: '#87CEEB' }}>
                        <input
                          type="file"
                          id={`file-input-${field}`}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(field, e.target.files[0])}
                          disabled={uploading}
                        />
                        {photoUrls[field] ? (
                          <div className="space-y-2 relative">
                            <img src={photoUrls[field]} alt={t('register.photoN', { index: idx + 1 })} className="w-full h-28 object-cover rounded-lg shadow-md" />
                            <button
                              type="button"
                              onClick={() => handlePhotoDelete(field)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                            >
                              &times;
                            </button>
                            <CheckCircle2 className="w-6 h-6 mx-auto text-green-500" />
                          </div>
                        ) : (
                          <label htmlFor={`file-input-${field}`} className="cursor-pointer">
                            <Upload className="w-8 h-8 mx-auto mb-1" style={{ color: '#87CEEB' }} />
                            <p className="text-xs font-bold" style={{ color: '#4A90E2' }}>{t('register.photoN', { index: idx + 1 })} *</p>
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {accountType === 'broadcaster' && (
                  <div className="space-y-3">
                    <h3 className="text-base font-bold" style={{ color: '#0055A4' }}>{t('register.idVerificationRequired')}</h3>
                    <p className="text-sm font-semibold" style={{ color: '#4A90E2' }}>{t('register.idPhotosGuidance')}</p>

                    <div className="grid grid-cols-2 gap-3">
                      <div id="id_photo_1" className="border-2 border-dashed rounded-xl p-3 text-center shadow-lg relative" style={{ borderColor: '#FFD700' }}>
                        <input
                          type="file"
                          id="file-input-id_photo_1"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload('id_photo_1', e.target.files[0])}
                          disabled={uploading}
                        />
                        {photoUrls.id_photo_1 ? (
                          <div className="space-y-2 relative">
                            <img src={photoUrls.id_photo_1} alt="ID Photo 1 Front" className="w-full h-28 object-cover rounded-lg shadow-md" />
                            <button
                              type="button"
                              onClick={() => handlePhotoDelete('id_photo_1')}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                            >
                              &times;
                            </button>
                            <CheckCircle2 className="w-6 h-6 mx-auto text-green-500" />
                          </div>
                        ) : (
                          <label htmlFor="file-input-id_photo_1" className="cursor-pointer">
                            <Upload className="w-8 h-8 mx-auto mb-1" style={{ color: '#FFD700' }} />
                            <p className="text-xs font-bold" style={{ color: '#4A90E2' }}>{t('register.idPhotoN', { index: 1 })} (Front) *</p>
                          </label>
                        )}
                      </div>

                      <div id="id_photo_2" className="border-2 border-dashed rounded-xl p-3 text-center shadow-lg relative" style={{ borderColor: '#FFD700' }}>
                        <input
                          type="file"
                          id="file-input-id_photo_2"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload('id_photo_2', e.target.files[0])}
                          disabled={uploading}
                        />
                        {photoUrls.id_photo_2 ? (
                          <div className="space-y-2 relative">
                            <img src={photoUrls.id_photo_2} alt="ID Photo 2 Back" className="w-full h-28 object-cover rounded-lg shadow-md" />
                            <button
                              type="button"
                              onClick={() => handlePhotoDelete('id_photo_2')}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                            >
                              &times;
                            </button>
                            <CheckCircle2 className="w-6 h-6 mx-auto text-green-500" />
                          </div>
                        ) : (
                          <label htmlFor="file-input-id_photo_2" className="cursor-pointer">
                            <Upload className="w-8 h-8 mx-auto mb-1" style={{ color: '#FFD700' }} />
                            <p className="text-xs font-bold" style={{ color: '#4A90E2' }}>{t('register.idPhotoN', { index: 2 })} (Back) *</p>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {accountType === 'broadcaster' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold" style={{ color: '#0055A4' }}>{t('register.socialMediaOptional')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="instagram" className="text-base font-bold mb-2 block" style={{ color: '#0055A4' }}>{t('register.instagram')}</Label>
                        <Input
                          id="instagram"
                          value={formData.instagram}
                          onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                          placeholder={t('register.usernamePlaceholder')}
                          className="font-semibold border-2"
                          style={{ borderColor: '#87CEEB' }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tiktok" className="text-base font-bold mb-2 block" style={{ color: '#0055A4' }}>{t('register.tiktok')}</Label>
                        <Input
                          id="tiktok"
                          value={formData.tiktok}
                          onChange={(e) => handleSocialMediaChange('tiktok', e.target.value)}
                          placeholder={t('register.usernamePlaceholder')}
                          className="font-semibold border-2"
                          style={{ borderColor: '#87CEEB' }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="twitter" className="text-base font-bold mb-2 block" style={{ color: '#0055A4' }}>{t('register.xTwitter')}</Label>
                        <Input
                          id="twitter"
                          value={formData.twitter}
                          onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                          placeholder={t('register.usernamePlaceholder')}
                          className="font-semibold border-2"
                          style={{ borderColor: '#87CEEB' }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="snapchat" className="text-base font-bold mb-2 block" style={{ color: '#0055A4' }}>Snapchat</Label>
                        <Input
                          id="snapchat"
                          value={formData.snapchat}
                          onChange={(e) => handleSocialMediaChange('snapchat', e.target.value)}
                          placeholder={t('register.usernamePlaceholder')}
                          className="font-semibold border-2"
                          style={{ borderColor: '#87CEEB' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 h-14 text-base font-extrabold border-2 shadow-lg"
                    style={{ borderColor: '#87CEEB', color: '#4A90E2' }}
                    disabled={currentUser.role && !currentUser.requested_role ? true : false}
                  >
                    {currentUser.role && !currentUser.requested_role ? 'Back to Dashboard' : t('register.back')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || uploading}
                    className="flex-1 h-14 text-base font-extrabold shadow-xl hover:shadow-2xl"
                    style={{ backgroundColor: '#0055A4' }}
                  >
                    {loading || uploading ? t('register.saving') : (currentUser.role && !currentUser.requested_role ? 'Update Profile' : 'Complete Registration')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
