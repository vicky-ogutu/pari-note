import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StatusBar, StyleSheet, Text, View } from 'react-native';

const SplashScreen = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login'); // navigates to login after 3s
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2c3e50" barStyle="light-content" />
      <Image
        source={require('../assets/images/splash-logo.jpeg')}
        style={styles.logo}
      />
      <Text style={styles.title}>Medical App</Text>
      <Text style={styles.subtitle}>Patient Management System</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2c3e50' },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#ddd' },
});

export default SplashScreen;
