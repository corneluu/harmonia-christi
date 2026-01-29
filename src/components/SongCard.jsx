import React from 'react';
import { FileText, Play, Music2, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MarqueeWrapper = ({ children, text, className, threshold = 20 }) => {
    const shouldMarquee = text && text.length > threshold;

    if (!shouldMarquee) {
        return <div className={`truncate ${className}`}>{children}</div>;
    }

    return (
        <div className={`marquee-wrap ${className}`}>
            <div className="marquee-content">
                {children}
                <span className="inline-block w-8"></span>
                {children}
            </div>
        </div>
    );
};

const SongCard = ({ song }) => {
    const { t } = useTranslation();

    return (
        <div className="group bg-paper rounded-xl shadow-sm border border-border hover:shadow-md hover:border-border transition-all duration-300 overflow-hidden">
            <div className="p-5 flex items-start gap-4">
                {/* Icon Container */}
                <div className="bg-background p-3 rounded-lg group-hover:bg-primary/5 transition-colors">
                    <Music2 className="w-6 h-6 text-muted group-hover:text-primary transition-colors" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <MarqueeWrapper text={song.title} className="text-lg font-serif font-semibold text-main" threshold={20}>
                        {song.title}
                    </MarqueeWrapper>

                    <div className="mt-1">
                        <MarqueeWrapper text={`${song.composer} - ${song.category}`} className="text-sm text-muted" threshold={30}>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{song.composer}</span>
                                <span className="w-1 h-1 bg-border rounded-full flex-shrink-0"></span>
                                <span>{song.category}</span>
                            </div>
                        </MarqueeWrapper>
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
