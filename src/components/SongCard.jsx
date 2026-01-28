import React from 'react';
import { FileText, Play, Music2, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SongCard = ({ song }) => {
    const { t } = useTranslation();

    return (
        <div className="group bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300 overflow-hidden">
            <div className="p-5 flex items-start gap-4">
                {/* Icon Container */}
                <div className="bg-slate-50 p-3 rounded-lg group-hover:bg-primary/5 transition-colors">
                    <Music2 className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-serif font-semibold text-slate-800 truncate pr-2">
                        {song.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <span className="font-medium">{song.composer}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-slate-400">{song.category}</span>
                    </div>
                </div>

                {/* Action (Desktop Hover / Mobile Always visible) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
                    {song.driveIdPdf && (
                        <ExternalLink className="w-5 h-5 text-slate-300" />
                    )}
                </div>
            </div>

            {/* Actions Footer */}
            <div className="bg-slate-50/50 px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-3">
                {song.driveIdPdf ? (
                    <a
                        href={`https://drive.google.com/file/d/${song.driveIdPdf}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors hover:border-primary/20"
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
