import { CapacitorConfig } from '@capacitor/cli';
import os from 'os';

const ifaces = os.networkInterfaces();
const localIp = Object.values(ifaces)
  .flat()
  .find(i => i?.family === 'IPv4' && !i.internal)?.address;

const config: CapacitorConfig = {
  appId: 'com.ambiancebit.bluelock',
  appName: 'BlueLock',
  webDir: 'build',
  server: { 
    androidScheme: 'https', 
    ...(process.env.NODE_ENV === 'development' && { 
      url: `http://${localIp}:5173`, 
      cleartext: true 
    })
  }
};

export default config;