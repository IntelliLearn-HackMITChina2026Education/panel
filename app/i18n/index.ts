import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from '../locales/en_GB.json';
import zhTranslation from '../locales/zh_CN.json';

const resources = {
    en_GB: {translation: enTranslation},
    zh_CN: {translation: zhTranslation}
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'zh_CN',
        interpolation: {escapeValue: false},
        defaultNS: 'translation',
    });

export default i18n;