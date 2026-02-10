import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import SongList from './components/SongList';
import ConcertProgram from './components/ConcertProgram';

function App() {
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#program') {
        setCurrentView('program');
      } else {
        setCurrentView('home');
      }
    };

    // Initial check
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <Layout>
      {currentView === 'home' ? (
        <div className="space-y-8">
          <section className="text-center py-12 sm:py-20">
            <div className="flex justify-center mb-8">
              <img
                src="/logo.png"
                alt="Harmonia Christi"
                className="h-24 sm:h-32 w-auto drop-shadow-xl animate-fade-in"
              />
            </div>
            <h2 className="text-4xl sm:text-5xl font-serif font-bold text-primary mb-4">
              Harmonia Christi
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
              Repertoriul corului - Partituri și resurse audio
            </p>

            <a
              href="#program"
              className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors text-sm font-medium"
            >
              🎉 Vezi programul concertului (10 Feb)
            </a>
          </section>

          <SongList />
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <a
              href="#"
              className="text-primary hover:underline flex items-center gap-2"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = '';
              }}
            >
              ← Înapoi la repertoriu
            </a>
          </div>
          <ConcertProgram />
        </div>
      )}
    </Layout>
  );
}

export default App;
