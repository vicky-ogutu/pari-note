import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Text,
  View
} from 'react-native';
import tw from "tailwind-react-native-classnames";

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const slideUpAnim = new Animated.Value(30);
  const router = useRouter();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();

    // Navigation timer
    const timer = setTimeout(() => {
      router.push('/login');
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={tw`flex-1 bg-gradient-to-b from-blue-900 to-purple-700`}>
      <View style={tw`absolute top-0 left-0 w-full h-full`}>
        <View style={[tw`absolute rounded-full bg-white opacity-10`, {
          width: width * 0.7,
          height: width * 0.7,
          top: -width * 0.2,
          right: -width * 0.1,
        }]} />
        <View style={[tw`absolute rounded-full bg-white opacity-5`, {
          width: width * 0.9,
          height: width * 0.9,
          bottom: -width * 0.3,
          left: -width * 0.2,
        }]} />
      </View>

      <View style={tw`flex-1 justify-center items-center`}>
        <Animated.View style={[
          tw`items-center`,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideUpAnim }
            ]
          }
        ]}>
          <View style={tw`mb-6`}>
            <View style={tw`bg-white rounded-3xl p-4 shadow-2xl`}>
              <Image
                source={require('../assets/images/logo.png')}
                style={tw`w-32 h-32 rounded-2xl`}
                resizeMode="contain"
              />
            </View>
          </View  >

          <Text style={tw`text-purple-500 text-4xl font-bold mb-2 text-center`}>
            MOH 369 Register
          </Text>
  
          <Text style={tw`text-purple-500 text-lg font-medium text-center max-w-xs leading-6`}>
            Still Birth Notification
          </Text>

          <View style={tw`mt-8 w-32`}>
            <View style={tw`h-1 bg-purple-900 opacity-30 rounded-full overflow-hidden`}>
              <Animated.View 
                style={[
                  tw`h-full bg-white rounded-full`,
                  {
                    width: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]} 
              />
            </View>
          </View>
        </Animated.View>

        <View style={tw`absolute bottom-8`}>
          <Text style={tw`text-purple-500 text-sm`}>
            Ministry of Health
          </Text>
        </View>
      </View>
    </View>
  );
}