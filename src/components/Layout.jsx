import React from 'react';
import { useTranslation } from 'react-i18next';
import { Music, Languages, Menu } from 'lucide-react';

const Layout = ({ children }) => {
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'en' ? 'ro' : 'en');
    };

    return (
        <div className="min-h-screen bg-paper text-secondary font-sans">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/5 p-2 rounded-lg">
                                <Music className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="font-serif text-xl font-bold text-primary tracking-tight">
                                {t('app_title')}
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleLanguage}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-1 text-sm font-medium text-slate-600"
                                aria-label={t('language')}
                            >
                                <Languages className="w-5 h-5" />
                                <span className="hidden sm:inline uppercase">{i18n.language}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            <footer className="py-8 text-center text-slate-400 text-sm">
                <p>&copy; {new Date().getFullYear()} Harmonia Christi &middot; Created by Cornel</p>
            </footer>
        </div>
    );
};

export default Layout;
