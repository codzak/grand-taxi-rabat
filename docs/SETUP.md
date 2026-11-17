# Setup: run the app on Windows

How to build and run the Expo app in `app/` on Windows 11, with a local Android build and the Android emulator. All commands are PowerShell.

## What is in the app

Versions come from `app/package.json` and `app/app.json`:

| Thing | Version or value |
|---|---|
| Expo SDK | `~58.0.25` |
| React Native | `0.88.1` |
| MapLibre React Native | `^11.5.1` |
| expo-dev-client | `~58.0.20` |
| Android package | `com.codzak.grandtaxirabat` |

The home screen (`app/src/app/index.tsx`) shows a map of Rabat.

## Why a development build

MapLibre has native code. Expo Go does not include it, so the map will not run in Expo Go. Instead you build your own version of the app (a "development build", from `expo-dev-client`) and install it on the emulator once. After that, you only reload JavaScript.

## 1. Tools you need

| Tool | Where it lives on this PC |
|---|---|
| Node 20 or newer | `C:\Program Files\nodejs` |
| Android Studio | gives you the SDK, the emulator and a JDK |
| Android SDK | `%LOCALAPPDATA%\Android\Sdk` |
| JDK | `C:\Program Files\Android\Android Studio\jbr` (bundled with Android Studio) |

Check them:

```powershell
node --version
git --version
echo $env:JAVA_HOME
echo $env:ANDROID_HOME
```

## 2. Environment variables (already done)

Gradle needs to find Java and the SDK. `JAVA_HOME` (the JDK path above) and `ANDROID_HOME` (the SDK path above) are saved as user variables. After changing them, open a new PowerShell window, or they will not show up.

## 3. Install the packages

Only needed after a fresh clone, or when `package.json` changes:

```powershell
cd app
npm install
```

## 4. Start the emulator

The virtual phone is called `Medium_Phone_API_36`:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd Medium_Phone_API_36
```

Wait until the phone home screen shows.

## 5. First build (slow, once)

This compiles the native Android app with Gradle and installs it on the emulator:

```powershell
cd app
npx expo run:android
```

The first time can take a long while. Later builds are faster. You only need to run it again when you add or change a native package (like MapLibre) or a plugin in `app.json`.

## 6. Day to day

With the emulator open and the dev app installed:

```powershell
cd app
npx expo start --dev-client
```

Press `a` to open the app on the emulator. Save a file and the app reloads.

If the app shows "Failed to connect to /192.168.x.x:8081", the firewall blocks the LAN address. Use the USB-style tunnel instead, then open the app on `localhost`:

```powershell
adb reverse tcp:8081 tcp:8081
adb shell am start -a android.intent.action.VIEW -d "grandtaxirabat://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081" com.codzak.grandtaxirabat
```

## 7. First successful build (17 Nov 2026)

Worked after 3 fixes: free memory, a short repo path, and long paths (see below). The emulator showed the map of Rabat with French and Arabic labels.

## Troubleshooting

### `ninja: error: mkdir(...): No such file or directory`

The path is too long for Windows (over 260 characters). Native libraries like `react-native-gesture-handler` build folders that copy the full project path inside them. Three fixes, all needed:

1. Keep the repo at a short path: `C:\gtr`, not `C:\Users\...\git\grand-taxi-rabat`. A `subst` drive does not help, the build tools resolve the real path.
2. Turn on long paths in Windows, once, in an admin PowerShell, then stop Gradle (`android\gradlew.bat --stop`):

```powershell
New-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' -Name LongPathsEnabled -Value 1 -PropertyType DWORD -Force
```

3. Use CMake 3.31.6 (its ninja 1.12 supports long paths, the default CMake 3.22.1 has ninja 1.10 which does not). Install it, then point Gradle at it in `app/android/local.properties`:

```powershell
'y' | & "$env:LOCALAPPDATA\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat" 'cmake;3.31.6'
```

```properties
cmake.dir=C:\\Users\\Zakaria\\AppData\\Local\\Android\\Sdk\\cmake\\3.31.6
```

`app/android/` is not in git, so redo step 3 if the folder is ever regenerated (`npx expo prebuild --clean`).

### The build crashes or Gradle runs out of memory

The first Gradle build needs about 4 to 5 GB of free memory. On this PC it failed twice with only about 1.3 GB free. The big users were Brave (about 5 GB), the emulator (about 2 GB), and the SQL Server and PostgreSQL services.

One sign of this: a `cmd` crash with code `0xC0000409` during autolinking in `settings.gradle`.

Check free memory (`FreeVirtualMemory` is in KB):

```powershell
Get-CimInstance Win32_OperatingSystem | Select-Object FreePhysicalMemory, FreeVirtualMemory
```

Fix:

1. Restart the PC.
2. Quit Brave fully (check the tray icon too).
3. Stop the database services, in an admin PowerShell:

```powershell
Stop-Service 'MSSQL$DATACAMP_SQL','MSSQLSERVER','postgresql-x64-16' -Force
```

4. Run `npx expo run:android` again.

### Plan B: build in the cloud

If the local build still fails, let Expo build it on their servers. You need a free Expo account. There is no `app/eas.json` yet, so set up EAS first (not tested here):

```powershell
npm install -g eas-cli
cd app
eas login
eas build:configure
eas build --profile development --platform android
```

Then install the APK it gives you on the emulator or a phone.
