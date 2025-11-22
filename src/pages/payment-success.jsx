import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/components/AuthContext";
import { showToast } from "@/components/ui/toast-utils";
import { base44 } from "@/api/base44Client";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const type = searchParams.get("type");
  const [status, setStatus] = useState("checking"); // checking, confirmed, failed
  const { restoreSession } = useAuth();

  useEffect(() => {
    // Restore session if token exists in localStorage
    const token = localStorage.getItem("authToken");
    if (token && restoreSession) {
        restoreSession(token);
    }
  }, [restoreSession]);

  useEffect(() => {
    if (!sessionId) {
      setStatus("failed");
      return;
    }

    let intervalId;

    const checkStatus = async () => {
      try {
        let response;
        
        const unlockParam = searchParams.get("unlock");
        
        // New Social Unlock Flow
        if (unlockParam === '1') {
             // We assume webhook handled it or will handle it. 
             // We can poll getSocialUnlockStatus to confirm.
             const viewer = searchParams.get("viewer");
             const broadcaster = searchParams.get("broadcaster");
             const socialType = searchParams.get("type"); // socialType

             if (viewer && broadcaster) {
                 // Optional: Call confirmSocialUnlock just in case webhook failed or is slow, 
                 // but user asked to rely on Webhook.
                 // Let's just check status via getSocialUnlockStatus to show confirmation.
                 
                 // Actually, let's trust the redirect for UI and poll status for confirmation
                 // Or better, call confirmSocialUnlock as a backup if that function still exists and works?
                 // The user asked: "After payment, Stripe Webhook will call stripeWebhook... DO NOT modify viewer balance"
                 // And for payment-success: "make sure frontend API call ... returns valid JSON"
                 
                 // I will simulate a confirmation check loop
                 try {
                    let token = localStorage.getItem('authToken');
                    if (!token && typeof base44.auth.getToken === 'function') {
                        token = await base44.auth.getToken();
                    }
                    
                    const res = await fetch(`/api/functions/getSocialUnlockStatus?viewerId=${viewer}&streamerId=${broadcaster}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const statusData = await res.json();
                    
                    // If unlocked
                    if (statusData.success && statusData.unlockedLinks && (statusData.unlockedLinks.includes(socialType) || statusData.unlockedLinks.includes('all'))) {
                        setStatus("confirmed");
                        clearInterval(intervalId);
                        showToast.success("Social link unlocked!");
                        setTimeout(() => {
                             window.location.href = createPageUrl(`BroadcasterProfile?id=${broadcaster}`);
                        }, 2000);
                        return;
                    }
                 } catch(e) {
                    console.log("Status check failed", e);
                 }
                 // Continue polling
                 return;
             }
        }

        // Legacy Flow
        if (type === 'social') {
          response = await fetch(`/api/functions/checkSocialPaymentStatus?session_id=${sessionId}`);
        } else {
          response = await fetch(`/api/functions/checkPaymentStatus?session_id=${sessionId}`);
        }
        
        const data = await response.json();

        if (type === 'social') {
             // Legacy handling...
             // ... (keeping existing logic if needed, but user wants flow fixed)
             // I'll just leave it as fallthrough
        }

        if (data.confirmed) {
          setStatus("confirmed");
          clearInterval(intervalId);
          
          if (type === 'social') {
             // Fallback if manual params missing but checkSocialPaymentStatus worked
             // ... (keep existing logic just in case, but above block should catch it)
             showToast.success("Social link unlocked!");
             setTimeout(() => {
               window.location.href = createPageUrl(`BroadcasterProfile?id=${data.streamerId}`);
             }, 3000);
          } else {
            showToast.success(`💰 Balance added: ${data.minutes || 0} minutes!`);
            setTimeout(() => {
              window.location.href = createPageUrl("Home");
            }, 3000);
          }
        }
      } catch (error) {
        console.error("Check status error:", error);
      }
    };

    // Initial check
    checkStatus();

    // Poll every 3 seconds
    intervalId = setInterval(checkStatus, 3000);

    return () => clearInterval(intervalId);
  }, [sessionId, type]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-4 border-white/50 bg-white/90 backdrop-blur">
        <CardContent className="flex flex-col items-center text-center p-10 space-y-6">
          
          {status === "confirmed" && (
            <>
              <div className="rounded-full bg-green-100 p-4 mb-2 animate-bounce">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
              <h1 className="text-3xl font-extrabold text-green-700">Payment Successful 🎉</h1>
              <p className="text-lg text-gray-600 font-medium">Your credits are being added to your account.</p>
              <p className="text-green-600 font-bold mt-2">Credits added successfully!</p>
              
              <div className="w-full pt-4">
                <Button 
                  onClick={() => window.location.href = createPageUrl("Home")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg shadow-lg transition-all hover:scale-105"
                >
                  Go to Dashboard
                </Button>
                <p className="text-sm text-gray-400 mt-4">Redirecting automatically...</p>
              </div>
            </>
          )}

          {status === "checking" && (
            <>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin relative z-10" />
              </div>
              <h1 className="text-2xl font-bold text-blue-800 mt-4">Processing...</h1>
              <p className="text-gray-600 font-medium animate-pulse">Waiting for Stripe confirmation...</p>
            </>
          )}

          {status === "failed" && (
             <>
               <h1 className="text-2xl font-bold text-red-600">Status Unknown</h1>
               <p className="text-gray-600">We couldn't verify the payment session.</p>
               <Button 
                 onClick={() => window.location.href = createPageUrl("Home")}
                 className="mt-6 bg-gray-800 hover:bg-gray-900 text-white font-bold"
               >
                 Return Home
               </Button>
             </>
          )}

        </CardContent>
      </Card>
    </div>
  );
}