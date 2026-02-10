import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import SongList from './components/SongList';
import ConcertProgram from './components/ConcertProgram';
import ProgramIndex from './components/ProgramIndex';
import logo from './assets/logo.png';
import { ArrowRight } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedProgramId, setSelectedProgramId] = useState('concert');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#concert' || hash.startsWith('#program/')) {
        const id = hash === '#concert' ? 'concert' : hash.replace('#program/', '');
        setSelectedProgramId(id);
        setCurrentView('program-view');
      } else if (hash === '#programs') {
        setCurrentView('program-list');
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
      <div className="space-y-8 sm:space-y-12 pb-12">
        {/* Simplified Hero Section (Reverted to original look) */}
        <section className="text-center py-12 sm:py-20 px-4">
          <div className="flex justify-center mb-8">
            <img
              src={logo}
              alt="Harmonia Christi"
              className="h-24 sm:h-32 w-auto drop-shadow-xl animate-fade-in"
            />
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-4">
            Harmonia Christi
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Repertoriul corului - Partituri și resurse audio dedicate excelenței corale.
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => window.location.hash = currentView === 'home' ? '#programs' : '#'}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary rounded-full font-medium hover:bg-primary/20 transition-all text-sm border border-primary/20"
            >
              <span>{currentView === 'home' ? 'Vezi programele muzicale' : '← Înapoi la repertoriu'}</span>
              {currentView === 'home' && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </section>

        {/* Main Content Area */}
        <main>
          {currentView === 'home' && (
            <div className="animate-fade-in px-4">
              <SongList />
            </div>
          )}

          {currentView === 'program-list' && (
            <div className="animate-fade-in px-4">
              <ProgramIndex onSelectProgram={(id) => window.location.hash = `#program/${id}`} />
            </div>
          )}

          {currentView === 'program-view' && (
            <div className="animate-fade-in px-4">
              <ConcertProgram programId={selectedProgramId} />
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}

export default App;
