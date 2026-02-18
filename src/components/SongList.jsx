import React, { useState, useMemo, useEffect } from 'react';
import { Search, FileText, Music, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import SongCard from './SongCard';
import songsData from '../data/songs.json';

const SongList = () => {
    const { t } = useTranslation();

    const [songs, setSongs] = useState(songsData);
    const [filter, setFilter] = useState(() => {
        // Check for stored preference from login
        const pref = localStorage.getItem('hc_voice_pref');
        return pref || 'all';
    }); // all, sheets, audio

    console.log('Total songs loaded in browser:', songs.length);
    console.log('Current filter:', filter);

    const [searchQuery, setSearchQuery] = useState('');

    // Data is now bundled during deployment for reliability and privacy.
    // The previous dynamic fetch was causing sync issues and 404 errors.

    const filteredSongs = useMemo(() => {
        return songs.filter(song => {
            // Search logic
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                song.title.toLowerCase().includes(query) ||
                song.composer.toLowerCase().includes(query) ||
                song.category.toLowerCase().includes(query);

            if (!matchesSearch) return false;

            // Filter logic
            if (filter === 'sheets') return song.driveIdPdf;
            if (filter === 'audio') return song.driveIdAudio;

            // Voice type filters
            if (['sopran', 'alto', 'tenor', 'bass'].includes(filter)) {
                const titleLower = song.title.toLowerCase();
                // Strict voice matching
                // Check for "| Voice" or "(Voice)" or " - Voice"
                // Handle "Bass" matching "Bas"

                const searchVoice = filter === 'bass' ? ['bass', 'bas'] : [filter];

                const matchesVoice = searchVoice.some(v => {
                    const suffixPipe = `| ${v}`;
                    const suffixParen = `(${v})`;
                    const suffixDash = `- ${v}`;
                    return titleLower.includes(suffixPipe) || titleLower.includes(suffixParen) || titleLower.includes(suffixDash);
                });

                if (matchesVoice) return true;

                // Also allow if specific part property exists (future proofing) or if we are strict about "folder" view?
                // User wants "Alto" tab to show Alto parts.

                return false;
            }

            return true;
        });
    }, [searchQuery, filter, songs]);

    const FilterButton = ({ value, icon: Icon, label }) => (
        <button
            onClick={() => setFilter(value)}
            className={`
        relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2
        ${filter === value
                    ? 'bg-primary text-white dark:text-background shadow-md shadow-primary/20'
                    : 'bg-paper text-secondary hover:bg-background border border-border'}
      `}
        >
            {Icon && <Icon className="w-4 h-4" />}
            {label}
        </button>
    );

    return (
        <div className="space-y-8">
            {/* Search and Filter Section */}
            <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto">
                {/* Search Bar */}
                <div className="relative w-full group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-muted group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-4 py-3 bg-paper border border-border rounded-2xl leading-5 placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-main"
                        placeholder={t('search_placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-2">
                    <FilterButton value="sopran" label={t('filter_sopran')} />
                    <FilterButton value="alto" label={t('filter_alto')} />
                    <FilterButton value="bass" label={t('filter_bass')} />
                    <FilterButton value="tenor" label={t('filter_tenor')} />
                    <FilterButton value="sheets" icon={FileText} label={t('filter_sheets')} />
                    <FilterButton value="all" label={t('filter_all')} />
                    <FilterButton value="audio" icon={Music} label={t('filter_audio')} />
                </div>
            </div>

            {/* Results Info */}
            <div className="flex flex-col gap-1 text-sm text-muted pt-4 border-t border-border/50">
                <div className="flex justify-between items-center">
                    <p>{t('items_count', { count: filteredSongs.length })}</p>
                </div>
            </div>

            {/* Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {filteredSongs.map((song) => (
                    <motion.div
                        layout
                        key={song.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <SongCard song={song} />
                    </motion.div>
                ))}

                {filteredSongs.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted">
                        <p>No matches found for "{searchQuery}"</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default SongList;
