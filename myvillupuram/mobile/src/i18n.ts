import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: { news: 'News', directory: 'Directory', jobs: 'Jobs', marketplace: 'Marketplace', transport: 'Transport', lastUpdated: 'Last updated', outdated: 'Data may be outdated' } },
  ta: { translation: { news: 'செய்திகள்', directory: 'அடைவு', jobs: 'வேலைகள்', marketplace: 'மார்க்கெட்', transport: 'போக்குவரத்து', lastUpdated: 'இறுதியாக புதுப்பிக்கப்பட்டது', outdated: 'தகவல் பழையதாக இருக்கலாம்' } },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;