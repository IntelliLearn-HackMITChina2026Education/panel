import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enGBTranslation from '../locales/en_GB.json';
import zhCNTranslation from '../locales/zh_CN.json';
import enUSTranslation from '../locales/en_US.json';
import zhTWTranslation from '../locales/zh_TW.json';

const resources = {
    en_GB: {translation: enGBTranslation},
    zh_CN: {translation: zhCNTranslation},
    en_US: {translation: enUSTranslation},
    zh_TW: {translation: zhTWTranslation},
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'zh_CN',
        interpolation: {escapeValue: false},
        defaultNS: 'translation',
        saveMissing: true,
        missingKeyHandler: (lng, ns, key, fallbackValue) => {
            if (process.env.NODE_ENV === 'development') {
                console.error(`Missing translation for ${lng}: ${ns}:${key}`);
            }
        },
    });

export default i18n;