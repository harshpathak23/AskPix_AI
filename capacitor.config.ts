import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.askpix.ai',
  appName: 'AskPix AI',
  webDir: 'out',
  server: {
    // This is the key change. When a URL is provided here, the native app
    // will load your live website instead of bundled local files.
    // The GitHub Actions workflow will set the CAPACITOR_SERVER_URL environment
    // variable to your Vercel deployment URL during the APK build.
    url: process.env.CAPACITOR_SERVER_URL,
    androidScheme: 'https'
  }
};

export default config;
