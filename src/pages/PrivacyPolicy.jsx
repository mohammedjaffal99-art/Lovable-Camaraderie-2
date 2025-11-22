import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border-4" style={{ borderColor: '#00BFFF' }}>
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#0055A4' }}>Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-sm font-semibold mb-6" style={{ color: '#87CEEB' }}>Last Updated: November 4, 2025</p>
          
          <div className="space-y-6 leading-relaxed">
            <p className="text-base font-semibold" style={{ color: '#4A90E2' }}>
              Camaraderie.tv is committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your personal information.
            </p>

            <p className="text-base font-semibold" style={{ color: '#4A90E2' }}>
              This policy applies to all data collected through www.camaraderie.tv, including information you provide when signing up, purchasing services, or broadcasting content.
            </p>

            <p className="text-base font-semibold" style={{ color: '#4A90E2' }}>
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
            </p>

            <p className="text-base font-semibold" style={{ color: '#4A90E2' }}>
              By using our platform, you consent to the data practices described in this policy. We may update this policy periodically, and your continued use constitutes acceptance of any changes.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4" style={{ color: '#0055A4' }}>1. Data We Collect</h2>
            <p className="text-base font-semibold" style={{ color: '#4A90E2' }}>
              We collect personal information that can identify you, including account details, profile information, and usage data. Anonymous data is not considered personal information.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4" style={{ color: '#0055A4' }}>2. How We Collect Data</h2>
            <p className="text-base font-semibold" style={{ color: '#4A90E2' }}>
              We collect data through direct interactions, automated technologies, third-party sources, and user-generated content.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4" style={{ color: '#0055A4' }}>3. How We Use Your Data</h2>
            <p className="text-base font-semibold" style={{ color: '#4A90E2' }}>
              We use your data to provide services, improve our platform, communicate with you, process transactions, and ensure security and compliance.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4" style={{ color: '#0055A4' }}>4. Data Security</h2>
            <p className="text-base font-semibold" style={{ color: '#4A90E2' }}>
              We implement physical, electronic, and administrative safeguards to protect your personal data from unauthorized access, loss, or misuse.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4" style={{ color: '#0055A4' }}>5. Your Rights</h2>
            <p className="text-base font-semibold" style={{ color: '#4A90E2' }}>
              You have the right to access, correct, or delete your personal data. Contact us to exercise these rights or if you have privacy concerns.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4" style={{ color: '#0055A4' }}>Contact Information</h2>
            <p className="text-base font-semibold" style={{ color: '#4A90E2' }}>
              For questions about our privacy practices, contact us at <a href="mailto:privacy@camaraderie.tv" className="font-bold hover:underline" style={{ color: '#00BFFF' }}>privacy@camaraderie.tv</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}