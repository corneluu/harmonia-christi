import React from 'react';
import { FileText, Play, Music2, ArrowLeft, Music } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import songsData from '../data/songs.json';
import concertsData from '../data/concerts.json';
import { logFileOpen } from '../utils/logger';

const ProgramItem = ({ item, index, originalSong, songsMap }) => {
    const { t } = useTranslation();

    const handleFileClick = (type) => {
        logFileOpen(item.title, type);
    };

    const hasPdf = originalSong && originalSong.driveIdPdf;
    const hasAudio = originalSong && originalSong.driveIdAudio;

    return (
        <div className="group relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-4 px-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border-b border-border last:border-0">
            {/* Header / Index + Content Container */}
            <div className="flex items-start gap-4 flex-grow w-full sm:w-auto">
                {/* Index */}
                <div className="flex-shrink-0 w-8 sm:w-10 text-center pt-1 sm:pt-0">
                    <span className="text-lg sm:text-xl font-serif font-bold text-slate-300 dark:text-slate-600 group-hover:text-primary dark:group-hover:text-primary transition-colors">
                        {index}
                    </span>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-grow">
                    <h3 className="text-lg sm:text-xl font-serif font-medium text-main group-hover:text-primary transition-colors leading-tight">
                        {item.title}
                    </h3>
                    {item.notes && (
                        <p className="text-sm text-muted mt-1 font-medium italic">
                            {item.notes}
                        </p>
                    )}
                    {originalSong && !item.notes && (
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
                            {originalSong.composer} • {originalSong.category}
                        </p>
                    )}

                    {/* Voice Parts */}
                    {item.parts && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {Object.entries(item.parts).map(([part, id]) => {
                                const partSong = songsMap.get(id);
                                if (!partSong || !partSong.driveIdAudio) return null;
                                return (
                                    <a
                                        key={part}
                                        href={`https://drive.google.com/file/d/${partSong.driveIdAudio}/view`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors text-sm font-medium shadow-sm border border-slate-200 dark:border-slate-600"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent triggering parent clicks if any
                                            handleFileClick(`${part} Audio`);
                                        }}
                                    >
                                        {part}
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Actions - Scrollable on mobile (swipe) */}
            <div className="flex-shrink-0 flex items-center gap-3 sm:ml-auto pl-[3.5rem] sm:pl-0 w-full sm:w-auto mt-1 sm:mt-0 overflow-x-auto no-scrollbar pb-1 sm:pb-0 scroll-smooth">
                {/* PDF Buttons - Handle Multi-page or Single */}
                {item.pages && item.pages.length > 0 ? (
                    item.pages.map((page, idx) => {
                        const pageSong = songsMap.get(page.id);
                        if (!pageSong || !pageSong.driveIdPdf) return null;
                        return (
                            <a
                                key={idx}
                                href={`https://drive.google.com/file/d/${pageSong.driveIdPdf}/view`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => handleFileClick(`PDF ${page.label}`)}
                                className="flex-1 sm:flex-none justify-center sm:justify-start flex items-center gap-2 px-4 py-2 bg-primary text-paper rounded-full hover:bg-primary/90 transition-all shadow-sm hover:shadow-md group/btn"
                                title={t('view_pdf')}
                            >
                                <FileText className="w-4 h-4" />
                                <span className="text-sm font-medium whitespace-nowrap">{page.label}</span>
                            </a>
                        );
                    })
                ) : hasPdf ? (
                    <a
                        href={`https://drive.google.com/file/d/${originalSong.driveIdPdf}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleFileClick("PDF")}
                        className="flex-1 sm:flex-none justify-center sm:justify-start flex items-center gap-2 px-4 py-2 bg-primary text-paper rounded-full hover:bg-primary/90 transition-all shadow-sm hover:shadow-md group/btn"
                        title={t('view_pdf')}
                    >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm font-medium">Partitură</span>
                    </a>
                ) : (
                    // Show "No Score" badge if no PDF and no pages
                    // Only show if it matches the user request: "put a sign that there is no partiture"
                    <div className="flex-1 sm:flex-none justify-center sm:justify-start flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-muted rounded-full cursor-not-allowed border border-border">
                        <FileText className="w-4 h-4 opacity-50" />
                        <span className="text-sm font-medium opacity-75">Fără Partitură</span>
                    </div>
                )}
                {hasAudio && (
                    <a
                        href={`https://drive.google.com/file/d/${originalSong.driveIdAudio}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleFileClick("Audio")}
                        className="flex-1 sm:flex-none justify-center sm:justify-start flex items-center gap-2 px-4 py-2 bg-secondary/10 dark:bg-secondary/20 text-secondary dark:text-slate-300 rounded-full hover:bg-secondary/20 dark:hover:bg-secondary/30 transition-all"
                        title={t('play_audio')}
                    >
                        <Play className="w-4 h-4 fill-current" />
                        <span className="hidden sm:inline text-sm font-medium">Audio</span>
                    </a>
                )}
            </div>
        </div>
    );
};

const ConcertProgram = ({ programId = 'concert' }) => {
    const { t } = useTranslation();
    // Create a map for quick song lookup
    const songsMap = new Map(songsData.map(song => [song.id, song]));

    // Get the specific program data from the new object structure
    const programData = concertsData[programId] || concertsData['concert'];
    const programItems = programData.items || [];

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-serif font-bold text-primary mb-4">
                    {programData.title}
                </h1>
                {programData.description && (
                    <p className="text-lg text-muted font-serif italic">
                        {programData.description}
                    </p>
                )}
            </div>

            <div className="bg-paper rounded-2xl shadow-sm border border-border p-2 overflow-hidden">
                {programItems.map((item, index) => {
                    const originalSong = item.songId ? songsMap.get(item.songId) : null;
                    return (
                        <ProgramItem
                            key={item.id || index}
                            item={item}
                            index={index + 1}
                            originalSong={originalSong}
                            songsMap={songsMap}
                        />
                    );
                })}
            </div>

            <div className="mt-12">
            </div>
        </div>
    );
};

export default ConcertProgram;
