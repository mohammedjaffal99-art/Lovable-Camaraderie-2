import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import PayoutSetup from "./PayoutSetup";

const AdminPayouts = React.lazy(() => import('./AdminPayouts'));

export default function PayoutsHub() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      window.location.href = '/';
    });
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #0055A4 0%, #00BFFF 100%)' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
      </div>
    );
  }

  const isAdmin = user.role === 'admin';
  const isStreamer = user.broadcaster_approved;

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="shadow-2xl border-4" style={{ borderColor: '#00BFFF' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl font-extrabold" style={{ color: '#0055A4' }}>
              <DollarSign className="w-8 h-8" />
              Payouts
            </CardTitle>
          </CardHeader>
        </Card>

        <Tabs defaultValue={isAdmin ? "management" : "setup"} className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-2 p-1.5 rounded-xl shadow-xl mb-6" style={{ backgroundColor: '#E0F4FF' }}>
            {isAdmin && (
              <TabsTrigger value="management" className="font-bold text-sm py-3">
                Payout Management
              </TabsTrigger>
            )}
            {isStreamer && (
              <TabsTrigger value="setup" className="font-bold text-sm py-3">
                Payout Account Setup
              </TabsTrigger>
            )}
          </TabsList>

          {isAdmin && (
            <TabsContent value="management">
              <React.Suspense fallback={<div className="flex items-center justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-4" style={{ borderColor: '#0055A4' }}></div></div>}>
                <AdminPayouts />
              </React.Suspense>
            </TabsContent>
          )}

          {isStreamer && (
            <TabsContent value="setup">
              <PayoutSetup />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}