
import React from 'react';
import { useLanguage } from '@/components/LanguageContext';

const CATEGORIES = [
  "Artwork and Creative",
  "ASMR and Relaxation",
  "Books and Novels",
  "Crafting and Making",
  "Debating and Talk shows",
  "Education and Tutorials",
  "Entertainment and Cinema",
  "Video games and Consoles",
  "Vlogging and Real life streaming",
  "Kitchen and Recipes",
  "Meditation and Wellness",
  "Music and Concerts",
  "Nature and Camping",
  "News and Politics",
  "Outdoor Activities",
  "Sports and Workouts",
  "Tech and Reviews"
];

export default function StreamingDirectory() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4 text-white" style={{ textShadow: '0 2px 12px rgba(0,85,164,0.3)' }}>
            Streaming Directory
          </h1>
          <p className="text-lg font-semibold text-white" style={{ textShadow: '0 2px 10px rgba(0,85,164,0.2)' }}>
            Explore all streaming categories available on Camaraderie.tv
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((category, index) => (
            <a
              key={index}
              href={`/?category=${encodeURIComponent(category)}`}
              className="bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all transform hover:scale-105 border-4"
              style={{ borderColor: '#00BFFF' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-extrabold text-xl shadow-lg" style={{ backgroundColor: '#0055A4' }}>
                  {index + 1}
                </div>
                <h3 className="text-xl font-extrabold" style={{ color: '#0055A4' }}>
                  {t(`category.${category}`)}
                </h3>
              </div>
              <p className="text-base font-bold" style={{ color: '#4A90E2' }}>
                Discover streamers specializing in {category.toLowerCase()}
              </p>
            </a>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-3xl shadow-2xl p-12 border-4" style={{ borderColor: '#00BFFF' }}>
          <h2 className="text-4xl font-extrabold mb-6" style={{ color: '#0055A4' }}>About Categories</h2>
          <p className="text-xl font-bold mb-6" style={{ color: '#4A90E2' }}>
            Streamers can select up to 2 categories that best represent their content. This helps viewers find exactly what they're looking for, whether it's language practice, entertainment, education, or just making new friends.
          </p>
          <p className="text-xl font-bold" style={{ color: '#4A90E2' }}>
            Click on any category above to browse streamers in that niche. You can also use our advanced filters on the home page to combine multiple criteria and find your perfect match.
          </p>
        </div>
      </div>
    </div>
  );
}
