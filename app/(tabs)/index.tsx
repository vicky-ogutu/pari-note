import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import SplashScreen from '../SplashScreen';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login'); // redirect after splash
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return <SplashScreen />;
}
