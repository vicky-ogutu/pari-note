// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
       <Stack.Screen name="home" />
      <Stack.Screen name="register" />
      <Stack.Screen name="patient_registration" />
      <Stack.Screen name="users" /> 
      <Stack.Screen name="editstaff" />
      <Stack.Screen name="SplashScreen" />
      <Stack.Screen name="+not-found" />
      
      
    </Stack>
  );
}