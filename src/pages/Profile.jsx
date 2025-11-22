import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Edit, Save, Upload, Camera,
  Video, Clock, MessageSquare, Phone
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/components/LanguageContext";
import { showToast } from "@/components/ui/toast-utils";
import NotificationSettings from '../components/profile/NotificationSettings';
import TranslationSettings from '../components/profile/TranslationSettings';
import AccessibilitySettings from '../components/profile/AccessibilitySettings';
import NotificationSoundSettings from '../components/profile/NotificationSoundSettings';

const CATEGORIES = [
  "Artwork and Creative",
  "ASMR and Relaxation",
  "Books and Novels",
  "Crafting and Making",
  "Debating and Talk shows",
  "Education and Tutorials",
  "Entertainment and Cinema",
  "Video games and Consoles",
  "Vlogging and Real life streaming",
  "Kitchen and Recipes",
  "Meditation and Wellness",
  "Music and Concerts",
  "Nature and Camping",
  "News and Politics",
  "Outdoor Activities",
  "Sports and Workouts",
  "Tech and Reviews"
];

const LANGUAGES = ["Afrikaans", "Albanian", "Arabic", "Armenian", "Belarusian", "Bosnian", "Bulgarian", "Burmese", "Cantonese", "Catalan", "Croatian", "Czech", "Danish", "Dutch", "English", "Estonian", "Finnish", "French", "Georgian", "German", "Greek", "Haitian Creole", "Hindi", "Hungarian", "Indonesian", "Italian", "Japanese", "Khmer", "Korean", "Kurdish", "Kyrgyz", "Lao", "Latvian", "Lithuanian", "Macedonian", "Malagasy", "Malay", "Mandarin Chinese", "Mongolian", "Norwegian", "Polish", "Portuguese", "Romanian", "Russian", "Serbian", "Serbo-Croatian", "Slovak", "Slovenian", "Spanish", "Swedish", "Tagalog", "Tajik", "Thai", "Turkish", "Ukrainian", "Urdu", "Vietnamese", "Welsh"];

const COUNTRIES = ["Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iraq", "Ireland", "Italy", "Jamaica", "Japan", "Jordan", "Kenya", "Kiribati", "South Korea", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Lucia", "Samoa", "San Marino", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Taiwan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];

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

  if (value.startsWith('@') || (platform === 'snapchat' && !value.includes('.'))) {
    const username = value.replace('@', '');
    if (platform === 'snapchat') {
      return { valid: pattern.test(username), message: `Invalid ${platform} username format.` };
    }
    return { valid: true, message: '' };
  }

  const platformDomains = {
    instagram: ['instagram.com'],
    tiktok: ['tiktok.com'],
    twitter: ['twitter.com', 'x.com'],
    snapchat: ['snapchat.com']
  };

  const domains = platformDomains[platform];
  if (domains && !domains.some(domain => value.toLowerCase().includes(domain))) {
    return {
      valid: false,
      message: `This link doesn't belong to ${platform.charAt(0).toUpperCase() + platform.slice(1)}. Please enter a valid ${platform} username or link.`
    };
  }

  return { valid: pattern.test(value), message: pattern.test(value) ? '' : `Invalid ${platform} link format.` };
};

export default function Profile() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    gender: '',
    country: '',
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
    photo_3: ''
  });
  const [activeTab, setActiveTab] = useState('information');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        setFormData({
          full_name: u.full_name || '',
          gender: u.gender || '',
          country: u.country || '',
          ethnicity: u.ethnicity || '',
          native_language: u.native_language || '',
          language_2: u.language_2 || '',
          language_3: u.language_3 || '',
          language_4: u.language_4 || '',
          category_1: u.category_1 || '',
          category_2: u.category_2 || '',
          goal: u.goal || '',
          instagram: u.instagram || '',
          tiktok: u.tiktok || '',
          twitter: u.twitter || '',
          snapchat: u.snapchat || ''
        });
        setPhotoUrls({
          photo_1: u.photo_1 || '',
          photo_2: u.photo_2 || '',
          photo_3: u.photo_3 || ''
        });
      } catch (error) {
        showToast.error('Failed to load profile. Please sign in.');
        base44.auth.redirectToLogin(window.location.pathname);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const { data: sessions } = useQuery({
    queryKey: ['userSessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const filter = user.role === 'broadcaster'
        ? { broadcaster_id: user.id }
        : { customer_id: user.id };
      return await base44.entities.Session.filter(filter, '-created_date', 20);
    },
    enabled: !!user?.id,
    initialData: [],
  });

  const getSelectedLanguages = () => {
    return [formData.native_language, formData.language_2, formData.language_3, formData.language_4].filter(Boolean);
  };

  const isLanguageDisabled = (lang, currentField) => {
    const selected = getSelectedLanguages();
    const currentValue = formData[currentField];
    return selected.includes(lang) && lang !== currentValue;
  };

  const isCategoryDisabled = (category) => {
    return formData.category_1 === category && formData.category_2 !== category;
  };

  const validateForm = () => {
    const errors = [];
    const requiredFields = {
      full_name: 'Full Name',
      gender: 'Gender',
      country: 'Country',
      ethnicity: 'Ethnicity',
      native_language: 'Native Language',
      category_1: 'Category 1',
      goal: 'Goal'
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
        errors.push({ field, label });
      }
    });

    if (!photoUrls.photo_1) {
      errors.push({ field: 'photo_1', label: 'Profile Photo 1 (required)' });
    }

    return errors;
  };

  const handleSocialMediaChange = (platform, value) => {
    setFormData(prev => ({ ...prev, [platform]: value }));
  };

  const updateMeMutation = useMutation({
    mutationFn: async (updatedData) => {
      const dataToSend = Object.fromEntries(
        Object.entries(updatedData).map(([key, value]) => [
          key,
          typeof value === 'string' && value.trim() === '' ? null : value
        ])
      );
      return await base44.auth.updateMe(dataToSend);
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      setFormData({
        full_name: updatedUser.full_name || '',
        gender: updatedUser.gender || '',
        country: updatedUser.country || '',
        ethnicity: updatedUser.ethnicity || '',
        native_language: updatedUser.native_language || '',
        language_2: updatedUser.language_2 || '',
        language_3: updatedUser.language_3 || '',
        language_4: updatedUser.language_4 || '',
        category_1: updatedUser.category_1 || '',
        category_2: updatedUser.category_2 || '',
        goal: updatedUser.goal || '',
        instagram: updatedUser.instagram || '',
        tiktok: updatedUser.tiktok || '',
        twitter: updatedUser.twitter || '',
        snapchat: updatedUser.snapchat || ''
      });
      setPhotoUrls({
        photo_1: updatedUser.photo_1 || '',
        photo_2: updatedUser.photo_2 || '',
        photo_3: updatedUser.photo_3 || ''
      });
      setEditing(false);
      // The toast for successful update is now handled directly in handleSave
      queryClient.invalidateQueries(['userSessions', user?.id]);
    },
    onError: (error) => {
      showToast.error('Failed to update profile. Please try again.');
    }
  });

  const handlePhotoUpload = async (field, file) => {
    if (!file) return;

    const toastId = showToast.loading('Uploading photo...');

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const existingPhotos = Object.entries(photoUrls)
        .filter(([key, url]) => key !== field && url && url === file_url)
        .map(([key]) => key);

      if (existingPhotos.length > 0) {
        showToast.error(`This photo is already uploaded as ${existingPhotos[0].replace('_', ' ')}. Please choose a different photo.`);
        return;
      }

      setPhotoUrls(prev => ({ ...prev, [field]: file_url }));
      await updateMeMutation.mutateAsync({ [field]: file_url });
      showToast.success('Photo uploaded successfully!', { id: toastId });
    } catch (error) {
      showToast.error('Failed to upload photo. Please try again.', { id: toastId });
    }
  };

  const handlePhotoDelete = async (field) => {
    const confirmed = confirm('Are you sure you want to delete this photo?');
    if (!confirmed) return;

    const toastId = showToast.loading('Deleting photo...');

    try {
      setPhotoUrls(prev => ({ ...prev, [field]: '' }));
      await updateMeMutation.mutateAsync({ [field]: null });
      showToast.success('Photo deleted successfully!', { id: toastId });
    } catch (error) {
      showToast.error('Failed to delete photo', { id: toastId });
    }
  };

  const handleSave = async () => {
    const errors = validateForm();

    const isBroadcaster = user?.role === 'broadcaster' || user?.broadcaster_approved;

    if (isBroadcaster) {
      const socialPlatforms = ['instagram', 'tiktok', 'twitter', 'snapchat'];
      const seenLinks = {};
      
      for (const platform of socialPlatforms) {
        const link = formData[platform];
        if (!link || !link.trim()) continue;
        
        const normalized = link.trim().toLowerCase()
          .replace(/^(https?:\/\/(www\.)?)?/i, '')
          .replace(/\/$/, '');
        
        if (seenLinks[normalized]) {
          errors.push({ 
            field: platform, 
            label: `This username/link is already used for ${seenLinks[normalized].charAt(0).toUpperCase() + seenLinks[normalized].slice(1)}. Please use a different one.` 
          });
        } else {
          seenLinks[normalized] = platform;
        }
        
        const validation = validateSocialMediaLink(platform, link.trim());
        if (!validation.valid) {
          errors.push({ field: platform, label: validation.message || `${platform.charAt(0).toUpperCase() + platform.slice(1)} link is invalid` });
        }
      }
    }

    if (errors.length > 0) {
      showToast.error(`Please complete all required fields: ${errors.map(e => e.label).join(', ')}`);

      if (errors[0].field.startsWith('photo')) {
        setActiveTab('photos');
      } else if (['instagram', 'tiktok', 'twitter', 'snapchat'].includes(errors[0].field)) {
        setActiveTab('social');
      } else {
        setActiveTab('information');
      }

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

    const toastId = showToast.loading('Saving profile...');

    try {
      await updateMeMutation.mutateAsync({
        ...formData,
        photo_1: photoUrls.photo_1,
        photo_2: photoUrls.photo_2,
        photo_3: photoUrls.photo_3,
      });
      showToast.success('Profile updated successfully!', { id: toastId });
    } catch (error) {
      showToast.error('Failed to update profile', { id: toastId });
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        gender: user.gender || '',
        country: user.country || '',
        ethnicity: user.ethnicity || '',
        native_language: user.native_language || '',
        language_2: user.language_2 || '',
        language_3: user.language_3 || '',
        language_4: user.language_4 || '',
        category_1: user.category_1 || '',
        category_2: user.category_2 || '',
        goal: user.goal || '',
        instagram: user.instagram || '',
        tiktok: user.tiktok || '',
        twitter: user.twitter || '',
        snapchat: user.snapchat || ''
      });
      setPhotoUrls({
        photo_1: user.photo_1 || '',
        photo_2: user.photo_2 || '',
        photo_3: user.photo_3 || ''
      });
    }
    showToast.info('Changes cancelled');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-4" style={{ borderColor: '#0055A4' }}></div>
      </div>
    );
  }

  const commissionRate = user.role === 'broadcaster' ? 30 + ((user.level || 0) * 0.33) : 0;
  const isBroadcaster = user?.role === 'broadcaster' || user?.broadcaster_approved;


  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl border-2" style={{ borderColor: '#00BFFF' }}>
          <CardHeader className="rounded-t-lg" style={{ background: 'linear-gradient(90deg, #0055A4, #00BFFF)' }}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-white">
                  {t('profile.title')}
                </CardTitle>
                <p className="text-white mt-2 font-medium text-sm">{t('profile.manageAccount')}</p>
              </div>
              {!editing && (
                <Button onClick={handleEdit} className="font-bold shadow-lg hover:shadow-xl" style={{ backgroundColor: 'white', color: '#0055A4' }}>
                  <Edit className="w-4 h-4 mr-2" />
                  {t('profile.edit')}
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className={`grid w-full ${isBroadcaster ? 'grid-cols-6' : 'grid-cols-4'} p-1 rounded-xl shadow-lg mb-8`} style={{ backgroundColor: '#87CEEB' }}>
                <TabsTrigger value="information" className="font-bold data-[state=active]:bg-white data-[state=active]:shadow-md" style={{ color: '#0055A4' }}>{t('profile.information')}</TabsTrigger>
                <TabsTrigger value="photos" className="font-bold data-[state=active]:bg-white data-[state=active]:shadow-md" style={{ color: '#0055A4' }}>{t('profile.photos')}</TabsTrigger>
                {isBroadcaster && (
                  <TabsTrigger value="social" className="font-bold data-[state=active]:bg-white data-[state=active]:shadow-md" style={{ color: '#0055A4' }}>Social Media</TabsTrigger>
                )}
                <TabsTrigger value="notifications" className="font-bold data-[state=active]:bg-white data-[state=active]:shadow-md" style={{ color: '#0055A4' }}>Notifications</TabsTrigger>
                <TabsTrigger value="settings" className="font-bold data-[state=active]:bg-white data-[state=active]:shadow-md" style={{ color: '#0055A4' }}>Settings</TabsTrigger>
                {isBroadcaster && (
                  <TabsTrigger value="sessions" className="font-bold data-[state=active]:bg-white data-[state=active]:shadow-md" style={{ color: '#0055A4' }}>{t('profile.sessions')}</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="information" className="space-y-6 mt-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <Card className="shadow-xl border" style={{ borderColor: '#00BFFF' }}>
                      <CardContent className="p-6">
                        <div className="text-center mb-4">
                          <div className="relative inline-block mb-4">
                            <img
                              src={photoUrls.photo_1 || user.photo_1 || 'https://via.placeholder.com/150'}
                              alt={user.full_name}
                              className="w-36 h-36 rounded-full object-cover border-4 shadow-xl"
                              style={{ borderColor: '#0055A4' }}
                            />
                            {editing && (
                              <label className="absolute bottom-0 right-0 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer text-white shadow-lg" style={{ backgroundColor: '#0055A4' }}>
                                <Camera className="w-6 h-6" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handlePhotoUpload('photo_1', e.target.files[0])}
                                />
                              </label>
                            )}
                          </div>

                          <h2 className="text-3xl font-extrabold" style={{ color: '#0055A4' }}>{user.full_name}</h2>
                          <p className="font-semibold" style={{ color: '#4A90E2' }}>{user.email}</p>

                          <div className="flex justify-center gap-2 mt-3">
                            <Badge style={{ backgroundColor: '#0055A4' }} className="text-white">
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                            {user.role === 'broadcaster' && (
                              <Badge variant="outline">{t('broadcaster.level')} {user.level || 0}</Badge>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('register.country')}:</span>
                            <span className="font-semibold">{user.country || t('profile.notSet')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('register.gender')}:</span>
                            <span className="font-semibold capitalize">{user.gender || t('profile.notSet')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('register.ethnicity')}:</span>
                            <span className="font-semibold">{user.ethnicity ? t(`ethnicity.${user.ethnicity}`) : t('profile.notSet')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('register.yourGoal')}:</span>
                            <span className="font-semibold">{user.goal ? t(`goal.${user.goal}`) : t('profile.notSet')}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {user.role === 'broadcaster' ? (
                      <Card className="shadow-xl border" style={{ borderColor: '#00BFFF' }}>
                        <CardHeader>
                          <CardTitle className="text-lg" style={{ color: '#0055A4' }}>{t('profile.stats')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">{t('profile.commissionRate')}</span>
                            <span className="text-xl font-bold" style={{ color: '#0055A4' }}>
                              {commissionRate.toFixed(2)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">{t('profile.totalSessions')}</span>
                            <span className="text-xl font-bold">{user.total_sessions || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">{t('profile.totalEarned')}</span>
                            <span className="text-xl font-bold text-green-600">
                              ${(user.total_earnings || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">{t('profile.thisMonth')}</span>
                            <span className="text-xl font-bold text-green-600">
                              ${(user.monthly_earnings || 0).toFixed(2)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="shadow-xl border" style={{ borderColor: '#00BFFF' }}>
                        <CardHeader>
                          <CardTitle className="text-lg" style={{ color: '#0055A4' }}>{t('profile.yourBalance')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-blue-500" />
                              <span className="text-gray-600">{t('profile.video')}</span>
                            </div>
                            <span className="font-bold">{user.balance_video || 0} {t('balance.min')}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-green-500" />
                              <span className="text-gray-600">{t('profile.audio')}</span>
                            </div>
                            <span className="font-bold">{user.balance_audio || 0} {t('balance.min')}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-purple-500" />
                              <span className="text-gray-600">{t('profile.text')}</span>
                            </div>
                            <span className="font-bold">{user.balance_text || 0} {t('balance.min')}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <Card className="p-6 shadow-xl border" style={{ borderColor: '#00BFFF' }}>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold" style={{ color: '#0055A4' }}>{t('profile.information')}</h2>
                      {editing && (
                        <div className="flex gap-2">
                          <Button onClick={handleCancel} variant="outline">
                            {t('profile.cancel')}
                          </Button>
                          <Button onClick={handleSave} style={{ backgroundColor: '#0055A4' }}>
                            <Save className="w-4 h-4 mr-2" />
                            {t('profile.save')}
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-bold mb-2 block" style={{ color: '#0055A4' }}>Full Name *</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                          disabled={!editing}
                          placeholder="Your full name"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-base font-bold mb-2 block" style={{ color: '#0055A4' }}>{t('register.gender')} *</Label>
                          <Select
                            value={formData.gender}
                            onValueChange={(value) => setFormData({...formData, gender: value})}
                            disabled={!editing}
                          >
                            <SelectTrigger id="gender">
                              <SelectValue placeholder={t('register.select')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">{t('register.male')}</SelectItem>
                              <SelectItem value="female">{t('register.female')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-base font-bold mb-2 block" style={{ color: '#0055A4' }}>{t('register.country')} *</Label>
                          <Select
                            value={formData.country}
                            onValueChange={(value) => setFormData({...formData, country: value})}
                            disabled={!editing}
                          >
                            <SelectTrigger id="country">
                              <SelectValue placeholder={t('profile.selectCountry')} />
                            </SelectTrigger>
                            <SelectContent>
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
                        <Label className="text-base font-bold mb-2 block" style={{ color: '#0055A4' }}>{t('register.ethnicity')} *</Label>
                        <Select
                          value={formData.ethnicity}
                          onValueChange={(value) => setFormData({...formData, ethnicity: value})}
                          disabled={!editing}
                        >
                          <SelectTrigger id="ethnicity">
                            <SelectValue placeholder={t('profile.selectEthnicity')} />
                          </SelectTrigger>
                          <SelectContent>
                            {ETHNICITIES.map(e => (
                              <SelectItem key={e} value={e}>{t(`ethnicity.${e}`)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-base font-bold mb-2 block" style={{ color: '#0055A4' }}>{t('broadcaster.languages')}</Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <Select
                            value={formData.native_language}
                            onValueChange={(value) => setFormData({...formData, native_language: value})}
                            disabled={!editing}
                          >
                            <SelectTrigger id="native_language">
                              <SelectValue placeholder={t('register.nativeLanguage')} />
                            </SelectTrigger>
                            <SelectContent>
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

                          <Select
                            value={formData.language_2 || 'none'}
                            onValueChange={(value) => setFormData({...formData, language_2: value === 'none' ? '' : value})}
                            disabled={!editing}
                          >
                            <SelectTrigger id="language_2">
                              <SelectValue placeholder={t('register.secondLanguage')} />
                            </SelectTrigger>
                            <SelectContent>
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

                          <Select
                            value={formData.language_3 || 'none'}
                            onValueChange={(value) => setFormData({...formData, language_3: value === 'none' ? '' : value})}
                            disabled={!editing}
                          >
                            <SelectTrigger id="language_3">
                              <SelectValue placeholder={t('register.thirdLanguage')} />
                            </SelectTrigger>
                            <SelectContent>
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

                          <Select
                            value={formData.language_4 || 'none'}
                            onValueChange={(value) => setFormData({...formData, language_4: value === 'none' ? '' : value})}
                            disabled={!editing}
                          >
                            <SelectTrigger id="language_4">
                              <SelectValue placeholder={t('register.fourthLanguage')} />
                            </SelectTrigger>
                            <SelectContent>
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

                      <div>
                        <Label className="text-base font-bold mb-2 block" style={{ color: '#0055A4' }}>Streamer Categories *</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Select
                              value={formData.category_1}
                              onValueChange={(value) => setFormData({...formData, category_1: value})}
                              disabled={!editing}
                            >
                              <SelectTrigger id="category_1">
                                <SelectValue placeholder={t('register.category1')} />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.map(c => (
                                  <SelectItem key={c} value={c}>{t(`category.${c}`)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Select
                              value={formData.category_2 || 'none'}
                              onValueChange={(value) => setFormData({...formData, category_2: value === 'none' ? '' : value})}
                              disabled={!editing}
                            >
                              <SelectTrigger id="category_2">
                                <SelectValue placeholder={t('register.optional')} />
                              </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">{t('register.none')}</SelectItem>
                              {CATEGORIES.map(c => (
                                <SelectItem
                                  key={c}
                                  value={c}
                                  disabled={isCategoryDisabled(c)}
                                  className={isCategoryDisabled(c) ? 'opacity-40' : ''}
                                >
                                  {t(`category.${c}`)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                      <div>
                        <Label className="text-base font-bold mb-2 block" style={{ color: '#0055A4' }}>{t('register.yourGoal')} *</Label>
                        <Select
                          value={formData.goal}
                          onValueChange={(value) => setFormData({...formData, goal: value})}
                          disabled={!editing}
                        >
                          <SelectTrigger id="goal">
                            <SelectValue placeholder={t('profile.selectGoal')} />
                          </SelectTrigger>
                          <SelectContent>
                            {GOALS.map(g => (
                              <SelectItem key={g} value={g}>{t(`goal.${g}`)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="photos" className="mt-6">
                <h2 className="text-base font-bold mb-4" style={{ color: '#0055A4' }}>Profile Photos</h2>
                <div className="grid grid-cols-3 gap-3">
                  {['photo_1', 'photo_2', 'photo_3'].map((field, idx) => (
                    <div key={field} className="space-y-2">
                      <Label className="text-sm font-bold">{t('register.photoN', { index: idx + 1 })}</Label>
                      <div className="relative aspect-square" id={field}>
                        {photoUrls[field] || user[field] ? (
                          <>
                            <img
                              src={photoUrls[field] || user[field]}
                              alt={t('register.photoN', { index: idx + 1 })}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            {editing && (
                              <button
                                onClick={() => handlePhotoDelete(field)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                              >
                                ×
                              </button>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                            <Camera className="w-8 h-8 text-gray-400" />
                          </div>
                        )}

                        {editing && (
                          <label className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-white shadow-lg" style={{ backgroundColor: '#0055A4' }}>
                            <Upload className="w-4 h-4" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload(field, e.target.files[0])}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {isBroadcaster && (
                <TabsContent value="social" className="mt-6">
                  <Card className="p-6 shadow-xl border" style={{ borderColor: '#00BFFF' }}>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold" style={{ color: '#0055A4' }}>Social Media Links</h2>
                        <p className="text-sm text-gray-600 mt-1">Connect your social media accounts</p>
                      </div>
                      {editing && (
                        <div className="flex gap-2">
                          <Button onClick={handleCancel} variant="outline">
                            Cancel
                          </Button>
                          <Button onClick={handleSave} style={{ backgroundColor: '#0055A4' }}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-bold mb-2 block flex items-center gap-2" style={{ color: '#0055A4' }}>
                          <svg className="w-5 h-5" style={{ color: '#E1306C' }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zM12 16.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          Instagram
                        </Label>
                        <Input
                          id="instagram"
                          value={formData.instagram}
                          onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                          disabled={!editing}
                          placeholder="@username or instagram.com/username"
                          className="font-medium"
                        />
                      </div>

                      <div>
                        <Label className="text-base font-bold mb-2 block flex items-center gap-2" style={{ color: '#0055A4' }}>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                          </svg>
                          TikTok
                        </Label>
                        <Input
                          id="tiktok"
                          value={formData.tiktok}
                          onChange={(e) => handleSocialMediaChange('tiktok', e.target.value)}
                          disabled={!editing}
                          placeholder="@username or tiktok.com/@username"
                          className="font-medium"
                        />
                      </div>

                      <div>
                        <Label className="text-base font-bold mb-2 block flex items-center gap-2" style={{ color: '#0055A4' }}>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                          X (Twitter)
                        </Label>
                        <Input
                          id="twitter"
                          value={formData.twitter}
                          onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                          disabled={!editing}
                          placeholder="@username or x.com/username"
                          className="font-medium"
                        />
                      </div>

                      <div>
                        <Label className="text-base font-bold mb-2 block flex items-center gap-2" style={{ color: '#0055A4' }}>
                          <svg className="w-5 h-5" style={{ color: '#FFFC00' }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.065 2c5.526 0 10.017 4.491 10.017 10.017 0 4.425-2.865 8.18-6.839 9.504-.5.092-.682-.217-.682-.483 0-.237.008-.868.013-1.703 2.782.605 3.369-1.343 3.369-1.343.454-1.158 1.11-1.466 1.11-1.466.908-.62-.069-.608-.069-.608-1.003.07-1.531 1.032-1.531 1.032-.892 1.53-2.341 1.088-2.91.832-.092-.647.35-1.088.636-1.338 2.22-.253 4.555-1.113 4.555-4.951 0-1.093-.39-1.988-1.029-2.688.103-.253.446-1.272-.098-2.65 0 0-.84-.27-2.75 1.026A9.564 9.564 0 0012 6.844c-.85.004-1.705.115-2.504.337-1.909-1.296-2.747-1.027-2.747-1.027-.546 1.379-.202 2.398-.1 2.651-.64.7-1.028 1.595-1.028 2.688 0 3.848 2.339 4.695 4.566 4.943-.286.246-.544.678-.635 1.318-.571.257-2.021.698-2.917-.832-.544-.943-1.529-1.021-1.529-1.021-.973-.006-.064.606-.064.606.65.299 1.105 1.459 1.105 1.459.585 1.782 3.361 1.181 3.361 1.181 0 .834.013 1.626.013 1.847 0 .27-.184.583-.688.483C4.848 20.196 2 16.443 2 12.017 2 6.491 6.49 2 12.065 2z"/>
                          </svg>
                          Snapchat
                        </Label>
                        <Input
                          id="snapchat"
                          value={formData.snapchat}
                          onChange={(e) => handleSocialMediaChange('snapchat', e.target.value)}
                          disabled={!editing}
                          placeholder="username"
                          className="font-medium"
                        />
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              )}

              <TabsContent value="notifications" className="mt-6">
                <h2 className="text-base font-bold mb-4" style={{ color: '#0055A4' }}>Notification Settings</h2>
                <NotificationSettings
                  user={user}
                  onSave={async (data) => {
                    await updateMeMutation.mutateAsync(data);
                  }}
                />
              </TabsContent>

              <TabsContent value="settings" className="mt-6 space-y-6">
                <h2 className="text-base font-bold mb-4" style={{ color: '#0055A4' }}>App Settings</h2>
                <NotificationSoundSettings />
                <TranslationSettings
                  user={user}
                  onSave={async (data) => {
                    await updateMeMutation.mutateAsync(data);
                  }}
                />
                <AccessibilitySettings />
              </TabsContent>

              {user?.role === 'broadcaster' && (
                <TabsContent value="sessions" className="mt-6">
                  {sessions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{t('profile.noSessionsYet')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-semibold capitalize">
                              {session.session_type} Session - {session.duration_minutes} {t('common.min')}
                            </p>
                            <p className="text-sm text-gray-600">
                              ${(session.total_price || 0).toFixed(2)}
                            </p>
                          </div>
                          <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                            {session.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}