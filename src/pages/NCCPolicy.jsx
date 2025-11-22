
import React from 'react';

export default function NCCPolicy() {
  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border-4" style={{ borderColor: '#00BFFF' }}>
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#0055A4', letterSpacing: '1px' }}>Camaraderie.tv Non-Consensual Content (NCC) Policy</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <p className="text-sm font-semibold mb-6" style={{ color: '#87CEEB' }}>Last Updated: November 4, 2025</p>
          
          <p className="leading-relaxed text-lg font-semibold" style={{ color: '#4A90E2' }}>
            Camaraderie is a streaming platform for all. To create a user, model, you must first agree to our Terms of Service.
          </p>

          <p className="leading-relaxed text-lg font-semibold" style={{ color: '#4A90E2' }}>
            Moreover, per our Terms of Service:
          </p>

          <ul className="list-disc list-inside space-y-3 ml-4 text-lg font-bold" style={{ color: '#4A90E2' }}>
            <li>All models must obtain and maintain valid consent and proper model release documentation for all persons featured in livestreams and any other content (i.e. photos) uploaded to the Camaraderie.tv platform;</li>
            <li>In order to assure the safety of our platform, ONLY registered and verified models may stream at Camaraderie.tv; any additional content partners (even if they are "real life" partners or spouses) must all be registered and verified with proper documentation and release if they want to appear on cam–no exceptions;</li>
            <li>Livestreams or other content featuring or promoting non-consensual acts, real or simulated, are also prohibited.</li>
          </ul>

          <h2 className="text-3xl font-extrabold mt-10 mb-6" style={{ color: '#0055A4' }}>Camaraderie.tv Non-Consensual Content Guidelines</h2>
          
          <p className="font-extrabold text-xl mb-4" style={{ color: '#0055A4' }}>DO NOT stream or share:</p>

          <ul className="list-disc list-inside space-y-3 ml-4 text-lg font-bold" style={{ color: '#4A90E2' }}>
            <li>Non-consensual images or videos; while this is commonly understood as "revenge", this prohibition also includes "spy cams" or phone cameras used in private or public settings that are used to film or photograph people without their knowledge or consent*;</li>
            <li>Non-sexually explicit images of someone else without their valid written consent (Again, see above policy that only registered models may appear on the platform);</li>
            <li>Additionally, "doxing", which is defined as exposing private and identifying information about a particular individual (including their phone number, e-mail, address, or full name) is strictly prohibited.</li>
          </ul>

          <p className="leading-relaxed text-lg font-semibold mt-8" style={{ color: '#4A90E2' }}>
            To help protect the integrity of the platform, we also prohibit live streams that feature or depict:
          </p>

          <ul className="list-disc list-inside space-y-3 ml-4 text-lg font-bold" style={{ color: '#4A90E2' }}>
            <li>Non-consensual activity**, including forced sexual acts, blackmail, coercion, rape, or sexual assault;</li>
            <li>Any and all depictions of child abuse or bestiality;</li>
            <li>Persons appearing drugged, incapacitated, hypnotized, or intoxicated*** while involved in sexual acts;</li>
            <li>Sharing any kind of deepfake content;</li>
            <li>Sharing content that is protected under copyright that you do not own. For more information, please see our DMCA Policy.</li>
          </ul>

          <div className="rounded-2xl p-8 my-8 border-l-4 shadow-lg" style={{ backgroundColor: '#E0F4FF', borderColor: '#00BFFF' }}>
            <p className="text-base font-bold" style={{ color: '#4A90E2' }}>* Camaraderie.tv streamers who offer shows featuring themselves are allowed.</p>
            <p className="text-base font-bold mt-3" style={{ color: '#4A90E2' }}>** We are a friendly platform and understand that some models and users wish to engage in consensual play – but as always the operative word is consensual. Keep your streams safe, sane, consensual, and legal at all times!</p>
            <p className="text-base font-bold mt-3" style={{ color: '#4A90E2' }}>*** Intoxicated (including pretending to be) means a state induced by alcohol or drugs, whether legal, illicit, or recreational as determined by Camaraderie.tv in its sole discretion, such that a performer's judgment appears to the reasonable observer as objectively impaired. If you are impaired, you cannot legally consent.</p>
          </div>

          <h2 className="text-3xl font-extrabold mt-10 mb-6" style={{ color: '#0055A4' }}>How to Report Non-Consensual Content</h2>
          <p className="leading-relaxed text-lg font-semibold" style={{ color: '#4A90E2' }}>
            If you discover any form of non-consensual or abusive content that appears to violate our Terms of Service, please contact <a href="mailto:abuse@camaraderie.tv" className="font-extrabold hover:underline" style={{ color: '#00BFFF' }}>abuse@camaraderie.tv</a> so our compliance team can investigate and take appropriate action.
          </p>
        </div>
      </div>
    </div>
  );
}
