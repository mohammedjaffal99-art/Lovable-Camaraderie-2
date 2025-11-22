
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, AlertCircle } from "lucide-react";
import BroadcasterCard from "../components/home/BroadcasterCard";
import FilterSidebar from "../components/home/FilterSidebar";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import AIChatSupport from '../components/AIChatSupport';
import PersonalizedRecommendations from '../components/viewer/PersonalizedRecommendations';

const CATEGORIES = [
  "Artwork and Creative", "ASMR and Relaxation", "Books and Novels", "Crafting and Making",
  "Debating and Talk shows", "Education and Tutorials", "Entertainment and Cinema",
  "Video games and Consoles", "Vlogging and Real life streaming", "Kitchen and Recipes",
  "Meditation and Wellness", "Music and Concerts", "Nature and Camping", "News and Politics",
  "Outdoor Activities", "Sports and Workouts", "Tech and Reviews"
];

export default function Home() {
  const { t } = useLanguage();
  const { user, guestMode } = useAuth();
  const [filters, setFilters] = useState({
    gender: 'all',
    country: '',
    language: '',
    ethnicity: 'all',
    category: 'all',
    goal: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);

  React.useEffect(() => {
    console.log('🚀 HOME PAGE VERSION: 2024-01-20-v2.0 - LATEST VERSION LOADED!');
  }, []);

  const { data: broadcasters, isLoading } = useQuery({
    queryKey: ['broadcasters'],
    queryFn: async () => {
      console.log('🔍 HOME PAGE: Fetching broadcasters via function...');
      const response = await base44.functions.invoke('getBroadcasters', {});
      console.log('📊 HOME PAGE: Response:', response.data);
      const broadcasters = response.data.broadcasters || [];
      console.log('✅ HOME PAGE: Broadcasters received:', broadcasters.length);
      return broadcasters;
    },
    refetchInterval: 5000,
    staleTime: 0,
    cacheTime: 0,
    initialData: [],
  });

  const filteredBroadcasters = React.useMemo(() => {
    console.log('🔍 Filtering broadcasters. Total before filter:', broadcasters.length);
    
    let result = broadcasters.filter(b => {
      if (filters.gender !== 'all' && b.gender !== filters.gender) return false;
      if (filters.country && b.country !== filters.country) return false;
      if (filters.ethnicity !== 'all' && b.ethnicity !== filters.ethnicity) return false;
      if (filters.category !== 'all' &&
          !([b.category_1, b.category_2].includes(filters.category))) return false;
      if (filters.goal !== 'all' && b.goal !== filters.goal) return false;
      if (filters.language &&
          ![b.native_language, b.language_2, b.language_3, b.language_4].includes(filters.language)) return false;
      if (searchQuery && !b.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    console.log('✅ After filters:', result.length);

    const statusOrder = { online: 0, in_session: 1, offline: 2 };
    result = result.sort((a, b) => {
      const aStatus = statusOrder[a.status] || 2;
      const bStatus = statusOrder[b.status] || 2;
      return aStatus - bStatus;
    });
    
    console.log('📊 Final sorted list:', result.map(b => ({ name: b.full_name, status: b.status })));
    
    return result;
  }, [broadcasters, filters, searchQuery]);

  return (
    <div className="min-h-screen flex" style={{
      background: 'linear-gradient(135deg, #0055A4 0%, #4A90E2 25%, #00BFFF 50%, #87CEEB 75%, #A8D8EA 100%)',
    }}>
      <div className="flex-1 overflow-y-auto">
        <div className="relative py-12 px-4 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 1000 600" className="w-full h-full">
              <circle cx="850" cy="150" r="400" fill="white" opacity="0.4" />
              <circle cx="150" cy="400" r="300" fill="white" opacity="0.3" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{
              textShadow: '0 4px 20px rgba(0,85,164,0.4)',
              letterSpacing: '1px'
            }}>
              {t('home.title')}
            </h1>
            <p className="text-lg md:text-xl text-white mb-8 font-medium" style={{
              textShadow: '0 2px 12px rgba(0,85,164,0.3)'
            }}>
              All communities are united in one place
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-12 -mt-4">
          {user && !guestMode && (
            <div className="mb-8">
              <PersonalizedRecommendations currentUser={user} />
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-white bg-opacity-30 animate-pulse rounded-xl shadow-lg" style={{ maxWidth: '280px', margin: '0 auto' }}></div>
              ))}
            </div>
          ) : filteredBroadcasters.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white rounded-2xl shadow-2xl p-12 inline-block max-w-2xl">
                <p className="text-blue-900 text-2xl font-bold mb-6">{t('home.noResults')}</p>
                <div className="text-left text-blue-800 space-y-3 bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                  <p className="font-bold text-lg text-blue-900">🔍 Possible reasons:</p>
                  <p className="text-base">• No approved broadcasters in the system</p>
                  <p className="text-base">• Filters are too restrictive</p>
                  <p className="text-base">• Check browser console (F12) for details</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {user && !guestMode && (
                <h2 className="text-2xl font-extrabold mb-4 text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                  All Broadcasters
                </h2>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredBroadcasters.map((broadcaster) => (
                  <BroadcasterCard
                    key={broadcaster.id}
                    broadcaster={broadcaster}
                    currentUser={guestMode ? null : user}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-16 pb-8">
          <p className="text-white text-base font-medium" style={{
            textShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}>
            {t('home.copyright')}
          </p>
        </div>
      </div>

      <AIChatSupport />

      {showSidebar && (
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          categories={CATEGORIES}
          onClose={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
}
