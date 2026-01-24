import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.oriflame.coast',
  appName: 'Oriflame Coast',
  webDir: 'capacitor-web',
  server: process.env.CAPACITOR_SERVER_URL
    ? {
        url: process.env.CAPACITOR_SERVER_URL,
        cleartext: process.env.CAPACITOR_SERVER_URL.startsWith('http://'),
      }
    : undefined,
};

export default config;
