import React from "react";
import { XCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createPageUrl } from "@/utils";

export default function PaymentCancelled() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-4 border-white/50 bg-white/90 backdrop-blur">
        <CardContent className="flex flex-col items-center text-center p-10 space-y-6">
          <div className="rounded-full bg-red-100 p-4 mb-2">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-800">Payment Cancelled ❌</h1>
          <p className="text-lg text-gray-600 font-medium">Your order was not completed.</p>
          
          <div className="w-full pt-6">
            <Button 
              onClick={() => window.location.href = createPageUrl("Home")}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-6 text-lg shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Return Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}