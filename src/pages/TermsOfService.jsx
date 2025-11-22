
import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border-4" style={{ borderColor: '#00BFFF' }}>
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#0055A4' }}>Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <p className="text-sm font-semibold mb-6" style={{ color: '#87CEEB' }}>Last Updated: November 4, 2025</p>
          
          <p className="leading-relaxed text-base font-semibold" style={{ color: '#4A90E2' }}>
            Camaraderie.tv, a UAE corporation ("Company," "we," or "us"), welcomes you to www.camaraderie.tv ("Website"), a family-oriented camming community. It is important to us that you and other visitors have the best experience while using our Website, and that, when you use our Website, you understand your legal rights and obligations. Please read this terms-of-service agreement, which is a legal agreement between you and us that governs your use of the Website, including any content, functionality, and services offered on or through the Website. You may access the Website only if you agree to this agreement.
          </p>

          <div className="rounded-2xl p-8 my-8 border-l-4 shadow-xl" style={{ backgroundColor: '#FFF9E6', borderColor: '#FFD700' }}>
            <p className="font-extrabold text-xl mb-3" style={{ color: '#B8860B' }}>Notice Regarding Dispute Resolution:</p>
            <p className="font-bold text-lg" style={{ color: '#DAA520' }}>This document requires the use of arbitration on an individual basis to resolve disputes, rather than jury trials or class actions. Please read the alternative dispute resolution provision (section 25) in this agreement as it affects your rights under this agreement.</p>
          </div>

          <div className="rounded-2xl p-8 my-8 border-l-4 shadow-xl" style={{ backgroundColor: '#FFF5F5', borderColor: '#ef4444' }}>
            <p className="font-extrabold text-xl mb-3" style={{ color: '#dc2626' }}>Minors Prohibited:</p>
            <p className="font-bold text-lg" style={{ color: '#991b1b' }}>Only individuals (1) who are at least mature and (2) who have reached the age of majority where they live may access our Website. We forbid all individuals who do not meet these age requirements from accessing our Website.</p>
          </div>

          <div className="rounded-2xl p-8 my-8 border-l-4 shadow-xl" style={{ backgroundColor: '#E0F4FF', borderColor: '#00BFFF' }}>
            <p className="font-extrabold text-xl mb-3" style={{ color: '#0055A4' }}>Section 230(d) Notice:</p>
            <p className="font-bold" style={{ color: '#4A90E2' }}>Under 47 U.S.C. § 230(d), you are notified that parental control protections (including computer hardware, software, or filtering services) are commercially available that may help in limiting access to material that is harmful to minors. You may find information about providers of these protections on the Internet by searching "parental control protection" or similar terms.</p>
          </div>

          <div className="rounded-2xl p-8 my-8 border-l-4 shadow-xl" style={{ backgroundColor: '#FFF5F5', borderColor: '#ef4444' }}>
            <p className="font-extrabold text-xl mb-3" style={{ color: '#dc2626' }}>Child Exploitative Material Prohibited:</p>
            <p className="font-bold text-lg" style={{ color: '#991b1b' }}>We prohibit content involving minors on the Website. We only allow visual media for family-oriented members on the Website. If you see any visual media, real or simulated, depicting adults and minors engaged in sexual activity within the Website or that is otherwise exploitative of children, please promptly report this to us at <a href="mailto:abuse@camaraderie.tv" className="underline">abuse@camaraderie.tv</a>. We will promptly investigate all reports and take proper action. We fully cooperate with any law enforcement agency investigating alleged child exploitation or sexual abuse of minors.</p>
          </div>

          <h2 className="text-xl font-bold mt-8 mb-4" style={{ color: '#0055A4' }}>1. Introduction</h2>
          <p className="text-base font-semibold" style={{ color: '#4A90E2' }}><strong>1.1.</strong> The Website provides access to live interactive audiovisual content, previously recorded audiovisual content, and various other products and services primarily provided by third-party operators that are family oriented in nature. Access and registration to the Website is free. The only time you pay is if you buy Virtual Money to use on the Website.</p>
          
          <p className="text-base font-semibold" style={{ color: '#4A90E2' }}><strong>1.2.</strong> This agreement applies to all users of the Website, whether you are a "visitor" or a "registered user." By clicking on the "I Agree" button on the warning page, checking the appropriate box during registration, buying Virtual Money, or accessing any part of the Website, you agree to this agreement. If you do not want to agree to this agreement, you must leave the Website. If you breach any part of this agreement, we may revoke your license to access the Website, block your access, and suspend or cancel your account (if you have one).</p>

          <h2 className="text-xl font-bold mt-8 mb-4" style={{ color: '#0055A4' }}>2. Eligibility & Age Requirements</h2>
          <p className="text-base font-semibold" style={{ color: '#4A90E2' }}>
            The Website materials that is unsuitable for minors. Therefore, only individuals (1) who are at least mature and (2) who have reached the age of majority where they live may access the Website.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4" style={{ color: '#0055A4' }}>3. User Accounts</h2>
          <p className="text-base font-semibold" style={{ color: '#4A90E2' }}>
            To access many of the Website's features, you must create an account. Registration is free and for a single user only. You are responsible for keeping your password and account confidential.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4" style={{ color: '#0055A4' }}>4. Intellectual Property</h2>
          <p className="text-base font-semibold" style={{ color: '#4A90E2' }}>
            All content, features, functionality, and materials found on the Website are owned by the Company, its licensors, or other providers. These are protected by copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4" style={{ color: '#0055A4' }}>Contact</h2>
          <p className="text-base font-semibold mb-6" style={{ color: '#4A90E2' }}>
            For questions about these terms, contact us at <a href="mailto:legal@camaraderie.tv" className="font-bold hover:underline" style={{ color: '#00BFFF' }}>legal@camaraderie.tv</a>
          </p>
        </div>
      </div>
    </div>
  );
}
