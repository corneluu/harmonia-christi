import React from 'react';
import { useTranslation } from 'react-i18next';
import { Music, BookOpen, Heart, Sun, Star, ArrowRight, ArrowLeft } from 'lucide-react';
import concertsData from '../data/concerts.json';

const ProgramIndex = ({ onSelectProgram }) => {
    const { t } = useTranslation();

    const getIcon = (key) => {
        switch (key) {
            case 'concert': return <Music className="w-6 h-6" />;
            case 'adoration': return <Heart className="w-6 h-6" />;
            case 'extra': return <Star className="w-6 h-6" />;
            default: return <BookOpen className="w-6 h-6" />;
        }
    };

    const getBadgeColor = (key) => {
        if (key.startsWith('liturgy')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
        if (key === 'adoration') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
        if (key === 'extra') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
        return 'bg-primary/10 text-primary';
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
            {/* Header */}
            <div className="mb-12 text-center">
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">
                    Programe Muzicale
                </h2>
                <div className="h-1.5 w-24 bg-primary mx-auto rounded-full mb-6"></div>
                <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                    Selectează un program de mai jos pentru a vedea partiturile și resursele audio dedicate.
                </p>
            </div>

            {/* Programs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(concertsData).map(([key, program]) => (
                    <button
                        key={key}
                        onClick={() => onSelectProgram(key)}
                        className="group relative flex flex-col p-8 bg-paper dark:bg-slate-800/50 rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-primary/30 transition-all text-left overflow-hidden"
                    >
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                            {program.title}
                        </h3>

                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-grow">
                            {program.description || 'Vezi lista completă de cântări.'}
                        </p>

                        <div className="flex items-center gap-2 text-primary font-medium text-sm">
                            <span>Vezi Program</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProgramIndex;
