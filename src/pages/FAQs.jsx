
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "What is Camaraderie.tv?",
    answer: "Camaraderie.tv is a live social streaming platform where you can watch broadcasters from around the world, chat in public rooms, and book private video, audio, or text sessions with your favorite streamers."
  },
  {
    question: "How do I sign up?",
    answer: "Click 'Join Now' in the navigation bar, then choose whether you want to be a Follower/Audience member or a Streamer/Model. Fill out your profile information to get started."
  },
  {
    question: "How does pricing work?",
    answer: "Customers purchase minutes packages that can be used for private sessions. Video calls, audio calls, and text chats each have different per-minute rates. Check the Balance page for current pricing."
  },
  {
    question: "How do I become a broadcaster?",
    answer: "Select 'Streamer/Model' during registration, complete your profile with 3 face photos, upload your government ID for age verification, and wait for admin approval (24-48 hours)."
  },
  {
    question: "What are the commission rates for broadcasters?",
    answer: "Broadcasters earn 30-60% commission based on their level. You start at 30% and increase your rate by leveling up through completed sessions and engagement."
  },
  {
    question: "How do I book a private session?",
    answer: "Visit a broadcaster's profile, click 'Book Private Session', select the type (video/audio/text) and duration, then confirm the booking. Make sure you have enough balance in your account."
  },
  {
    question: "Are all broadcasters verified?",
    answer: "Yes! All broadcasters must upload government-issued ID and go through admin approval before they can start streaming. Everyone on our platform is 18+ age-verified."
  },
  {
    question: "How do payments work?",
    answer: "We use Stripe for secure payment processing. Customers submit purchase requests that are approved by admins, and broadcasters receive monthly payouts for their earnings."
  },
  {
    question: "Can I get refunds?",
    answer: "Refund policies vary by situation. Unused minutes never expire. For session-specific refunds, please contact our support team through the Contact page."
  },
  {
    question: "How do I report inappropriate behavior?",
    answer: "Click the report button on any user's profile. Our team reviews all reports within 24 hours and takes appropriate action to maintain platform safety."
  },
  {
    question: "What languages does the platform support?",
    answer: "Our platform is available in 13 languages: English, Russian, Spanish, Chinese, Arabic, German, French, Japanese, Italian, Romanian, Korean, Portuguese, and Turkish."
  },
  {
    question: "How do I add broadcasters to favorites?",
    answer: "Click the heart icon on a broadcaster's card or profile to add them to your favorites. You'll receive notifications when they go live."
  }
];

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4 text-white" style={{ textShadow: '0 2px 12px rgba(0,85,164,0.3)' }}>
            Frequently Asked Questions
          </h1>
          <p className="text-lg font-semibold text-white" style={{ textShadow: '0 2px 10px rgba(0,85,164,0.2)' }}>
            Find answers to common questions about Camaraderie.tv
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4"
              style={{ borderColor: openIndex === index ? '#0055A4' : '#E0F4FF' }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-blue-50 transition-all"
              >
                <h3 className="text-xl font-extrabold pr-4" style={{ color: '#0055A4' }}>
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <ChevronUp className="w-7 h-7 flex-shrink-0" style={{ color: '#0055A4' }} />
                ) : (
                  <ChevronDown className="w-7 h-7 flex-shrink-0" style={{ color: '#87CEEB' }} />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-8 pb-6 rounded-b-2xl" style={{ backgroundColor: '#F0F9FF' }}>
                  <p className="text-lg font-bold leading-relaxed" style={{ color: '#4A90E2' }}>
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-3xl shadow-2xl p-12 text-center border-4" style={{ borderColor: '#00BFFF' }}>
          <h2 className="text-4xl font-extrabold mb-6" style={{ color: '#0055A4' }}>
            Still Have Questions?
          </h2>
          <p className="text-xl font-bold mb-8" style={{ color: '#4A90E2' }}>
            Can't find the answer you're looking for? Our support team is here to help!
          </p>
          <a
            href={'/Contact'}
            className="inline-block px-12 py-5 rounded-full text-white font-extrabold text-xl hover:shadow-3xl transition-all shadow-2xl"
            style={{ backgroundColor: '#0055A4' }}
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
