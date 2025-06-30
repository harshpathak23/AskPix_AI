import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.askpix.ai',
  appName: 'AskPix AI',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
