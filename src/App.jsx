import React from 'react';
import Layout from './components/Layout';
import AuthGate from './components/AuthGate';
import SongList from './components/SongList';

function App() {
  return (
    // Authentication is currently disabled. Uncomment the AuthGate wrapper below to re-enable.
    // <AuthGate>
    <Layout>
      <div className="space-y-8">
        <section className="text-center py-12 sm:py-20">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-primary mb-4">
            Harmonia Christi
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Repertoriul corului - Partituri și resurse audio
          </p>
        </section>

        <SongList />
      </div>
    </Layout>
    // </AuthGate>
  );
}

export default App;
