import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "app_title": "Harmonia Christi",
            "search_placeholder": "Search music...",
            "filter_all": "All",
            "filter_sheets": "Sheets",
            "filter_audio": "Audio",
            "items_count": "{{count}} items",
            "view_pdf": "View Sheet",
            "play_audio": "Play Audio",
            "language": "Language"
        }
    },
    ro: {
        translation: {
            "app_title": "Harmonia Christi",
            "search_placeholder": "Caută muzică...",
            "filter_all": "Toate",
            "filter_sheets": "Partituri",
            "filter_audio": "Audio",
            "items_count": "{{count}} elemente",
            "view_pdf": "Vezi Partitură",
            "play_audio": "Ascultă",
            "language": "Limbă"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "ro", // Default language
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
