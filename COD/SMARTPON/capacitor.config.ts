import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ambiancebit.bluelock',
  appName: 'BlueLock',
  webDir: 'build',
  server: {
    // only in dev mode
    // url: "http://192.168.1.112:5173",
    // cleartext: true,
    androidScheme: "http"
  }
};

export default config;