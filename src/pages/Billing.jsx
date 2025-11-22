import React from 'react';
import { useLanguage } from '@/components/LanguageContext';

export default function Billing() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border-4" style={{ borderColor: '#00BFFF' }}>
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#0055A4' }}>Billing Information</h1>
        
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold mt-8 mb-4" style={{ color: '#0055A4' }}>Payment Methods</h2>
          <p className="text-base font-semibold leading-relaxed mb-4" style={{ color: '#4A90E2' }}>
            Camaraderie.tv accepts various payment methods through our secure Stripe integration. All transactions are processed securely and your payment information is never stored on our servers.
          </p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4" style={{ color: '#0055A4' }}>For Customers</h2>
          <p className="text-base font-semibold leading-relaxed mb-4" style={{ color: '#4A90E2' }}>
            Purchase minutes packages to enjoy private sessions with broadcasters. Minutes can be used for video calls, audio calls, or text chats.
          </p>
          <ul className="list-disc list-inside font-semibold space-y-2 mb-4 text-base" style={{ color: '#4A90E2' }}>
            <li>All purchases require admin approval</li>
            <li>Minutes are added instantly after payment confirmation</li>
            <li>No refunds after session has started</li>
            <li>Unused minutes never expire</li>
          </ul>
          
          <h2 className="text-2xl font-bold mt-8 mb-4" style={{ color: '#0055A4' }}>For Broadcasters</h2>
          <p className="text-base font-semibold leading-relaxed mb-4" style={{ color: '#4A90E2' }}>
            Earn income through private sessions with a commission rate based on your level (30% - 60%).
          </p>
          <ul className="list-disc list-inside font-semibold space-y-2 mb-4 text-base" style={{ color: '#4A90E2' }}>
            <li>Payments are processed monthly</li>
            <li>Minimum payout threshold: $50 USD</li>
            <li>Commission rates increase with level</li>
            <li>Transparent earnings tracking</li>
          </ul>
          
          <h2 className="text-2xl font-bold mt-8 mb-4" style={{ color: '#0055A4' }}>Questions?</h2>
          <p className="text-base font-semibold leading-relaxed" style={{ color: '#4A90E2' }}>
            For billing inquiries, please contact our support team through the Contact page.
          </p>
        </div>
      </div>
    </div>
  );
}