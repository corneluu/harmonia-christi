import React from 'react';
import { useTranslation } from 'react-i18next';
import { Music, Languages, Menu, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
    const { t, i18n } = useTranslation();
    const [theme, setTheme] = React.useState(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('hc_theme')) {
            return localStorage.getItem('hc_theme');
        }
        // Force default to light as requested, ignoring system pref for new users
        return 'light';
    });

    React.useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('hc_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'en' ? 'ro' : 'en');
    };

    return (
        <div className="min-h-screen bg-background text-main font-sans transition-colors duration-300">
            <header className="sticky top-0 z-50 bg-paper/80 backdrop-blur-md border-b border-border shadow-sm transition-colors duration-300">
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

                        <div className="flex items-center gap-2">
                            <motion.button
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-secondary/10 transition-colors flex items-center justify-center text-secondary relative overflow-hidden"
                                aria-label="Toggle theme"
                                whileHover={{ scale: 1.1, rotate: 15 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <motion.div
                                    initial={false}
                                    animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                </motion.div>
                            </motion.button>

                            <motion.button
                                onClick={toggleLanguage}
                                className="p-2 rounded-full hover:bg-secondary/10 transition-colors flex items-center gap-1 text-sm font-medium text-secondary"
                                aria-label={t('language')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <motion.div
                                    key={i18n.language}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center gap-1"
                                >
                                    <Languages className="w-5 h-5" />
                                    <span className="hidden sm:inline uppercase">{i18n.language}</span>
                                </motion.div>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            <footer className="py-8 text-center text-muted text-sm transition-colors duration-300">
                <p>&copy; {new Date().getFullYear()} Harmonia Christi &middot; Created by <a href="https://corneluu.github.io/corneluu/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-all duration-300 decoration-primary/30 underline-offset-4 hover:underline">Cornel</a></p>
            </footer>
        </div>
    );
};

export default Layout;
