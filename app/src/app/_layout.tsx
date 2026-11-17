import { Stack } from 'expo-router';

// One screen, no tab bar, no animated splash: less work at startup on cheap phones.
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
