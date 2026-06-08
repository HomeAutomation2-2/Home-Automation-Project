# BlueLock Mobile App

## Install dependencies

```
pnpm install
```

## Install Android dependencies (first time only)

Make sure you have:
- Android Studio installed
- Android SDK installed (~/Android/Sdk)
- Java 17 or 21 installed

Then sync Capacitor:
```
pnpm cap sync android
```

## Run web dev server

```
pnpm dev
```

## Run Android app (live reload)

Make sure your phone/emulator is connected to the same network.

You have to have the dev server running separately in host mode:
```
pnpm dev --host
```

And then deploy to device:
```
pnpm dev --host 0.0.0.0 --port 5173
```

## Sync changes after installing plugins or editing native code

```
pnpm cap sync android
```

## Build production Android app

```
pnpm build
pnpm cap sync android
pnpm cap open android
```

Then build APK/AAB from Android Studio.