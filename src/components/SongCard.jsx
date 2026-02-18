import React from 'react';
import { FileText, Play, Music2, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';



import { logFileOpen } from '../utils/logger';

const SongCard = ({ song, index }) => {
    const { t } = useTranslation();

    const handleFileClick = (type) => {
        logFileOpen(song.title, type);
    };

    return (
        <div className="group bg-paper rounded-xl shadow-sm border border-border hover:shadow-md hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col h-full">
            <div className="p-5 flex items-start gap-4 flex-1">
                {/* Index or Icon */}
                <div className={`p-3 rounded-lg flex items-center justify-center w-12 h-12 flex-shrink-0 transition-colors ${index ? 'bg-primary/5 text-primary font-bold text-lg' : 'bg-background group-hover:bg-primary/5'}`}>
                    {index ? index : <Music2 className="w-6 h-6 text-muted group-hover:text-primary transition-colors" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-serif font-semibold text-main truncate" title={song.title}>
                        {song.title}
                    </h3>

                    <div className="mt-1">
                        <div className="text-sm text-muted truncate">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{song.composer}</span>
                                <span className="w-1 h-1 bg-border rounded-full flex-shrink-0"></span>
                                <span>{song.category}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action (Desktop Hover / Mobile Always visible) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
                    {song.driveIdPdf && (
                        <ExternalLink className="w-5 h-5 text-muted" />
                    )}
                </div>
            </div>

            {/* Actions Footer */}
            <div className="bg-background/50 px-5 py-3 border-t border-border flex items-center justify-between gap-3">
                {song.driveIdPdf ? (
                    <a
                        href={`https://drive.google.com/file/d/${song.driveIdPdf}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleFileClick("PDF")}
                        className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-secondary hover:bg-background hover:text-primary transition-colors hover:border-primary/20"
                    >
                        <FileText className="w-4 h-4" />
                        {t('view_pdf')}
                    </a>
                ) : (
                    <div className="flex-1"></div>
                )}

                {song.driveIdAudio && (
                    <a
                        href={`https://drive.google.com/file/d/${song.driveIdAudio}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleFileClick("Audio")}
                        className="inline-flex justify-center items-center gap-2 px-3 py-2 bg-primary/10 border border-transparent rounded-lg text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                    >
                        <Play className="w-4 h-4 fill-current" />
                        {/* Mobile: Icon only, Desktop: Text? Or just icon? Let's keep it simple */}
                        <span className="sr-only sm:not-sr-only">{t('play_audio')}</span>
                    </a>
                )}
            </div>
        </div>
    );
};

export default SongCard;
