
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import BroadcasterCard from "../components/home/BroadcasterCard";

export default function WhosLive() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => setUser(null));
  }, []);

  const { data: broadcasters, isLoading } = useQuery({
    queryKey: ['liveBroadcasters'],
    queryFn: async () => {
      console.log('🔴 WHOS LIVE: Fetching broadcasters via function...');
      const response = await base44.functions.invoke('getBroadcasters', {});
      console.log('📊 WHOS LIVE: Response:', response.data);
      const allBroadcasters = response.data.broadcasters || [];
      
      const liveBroadcasters = allBroadcasters.filter(u => {
        const isLive = u.isLive === true;
        console.log(`🔍 ${u.email}: isLive=${u.isLive}, liveRoomId=${u.liveRoomId}`);
        return isLive;
      });
      
      console.log('✅ WHOS LIVE: Live broadcasters found:', liveBroadcasters.length);
      return liveBroadcasters;
    },
    refetchInterval: 5000,
    staleTime: 0,
    cacheTime: 0,
    initialData: [],
  });

  const sortedBroadcasters = React.useMemo(() => {
    return [...broadcasters].sort((a, b) => {
      const aTime = new Date(a.liveStartedAt || 0).getTime();
      const bTime = new Date(b.liveStartedAt || 0).getTime();
      return bTime - aTime; // Sort by most recently started live stream first
    });
  }, [broadcasters]);

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #0055A4 0%, #4A90E2 25%, #00BFFF 50%, #87CEEB 75%, #A8D8EA 100%)'
    }}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-white mb-4" style={{
            textShadow: '0 4px 20px rgba(0,85,164,0.4)'
          }}>
            Who's Live?
          </h1>
          <p className="text-xl text-white font-semibold" style={{
            textShadow: '0 2px 12px rgba(0,85,164,0.3)'
          }}>
            Live streaming broadcasters right now
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array(10).fill(0).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-white bg-opacity-30 animate-pulse rounded-xl shadow-lg"></div>
            ))}
          </div>
        ) : sortedBroadcasters.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-2xl p-12 inline-block max-w-2xl">
              <p className="text-blue-900 text-2xl font-bold mb-4">No Broadcasters Online</p>
              <p className="text-blue-700 text-base font-semibold">No one is streaming right now. Check back soon!</p>
              <div className="mt-6 text-left text-sm text-blue-600 bg-blue-50 p-4 rounded-lg">
                <p className="font-bold mb-2">🔍 Debug Info (Check Browser Console F12):</p>
                <p>• Open console and look for logs starting with 🔴 WHOS LIVE</p>
                <p>• Check which broadcasters are online and their status</p>
                <p>• Refresh happens every 5 seconds automatically</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sortedBroadcasters.map((broadcaster) => (
              <BroadcasterCard
                key={broadcaster.id}
                broadcaster={broadcaster}
                currentUser={user}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
