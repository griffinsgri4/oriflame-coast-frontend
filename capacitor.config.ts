import type { CapacitorConfig } from '@capacitor/cli';

const appId = process.env.CAPACITOR_APP_ID || 'com.oriflame.coast';
const appName = process.env.CAPACITOR_APP_NAME || 'Oriflame Coast';
const serverUrl = process.env.CAPACITOR_SERVER_URL || 'https://oriflame-coast-frontend-iota.vercel.app';

const config: CapacitorConfig = {
  appId,
  appName,
  webDir: 'capacitor-web',
  server: {
    url: serverUrl,
    cleartext: serverUrl.startsWith('http://'),
  },
};

export default config;
