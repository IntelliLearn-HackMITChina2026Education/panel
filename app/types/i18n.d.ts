import 'i18next';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'translation';
        resources: {
            translation: typeof import('../locales/zh_CN.json');
        };
    }
}