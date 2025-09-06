import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StatusBar, Text, View } from 'react-native';
import tw from 'tailwind-react-native-classnames';

const SplashScreen = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login'); // navigates to login after 3s
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={tw`flex-1 items-center justify-center bg-gray-800`}>
      <StatusBar backgroundColor="#374151" barStyle="light-content" />
      <Image
        source={require('../assets/images/splash-logo.jpeg')}
        style={tw`w-32 h-32 mb-5`}
      />
      <Text style={tw`text-2xl font-bold text-white mb-2`}>Medical App</Text>
      <Text style={tw`text-base text-gray-300`}>Patient Management System</Text>
    </View>
  );
};

export default SplashScreen;