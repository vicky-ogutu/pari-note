// app/login.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import tw from 'tailwind-react-native-classnames';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
   const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
      //uncomment this to test without roles

    // if (!email || !password) {
    //   Alert.alert('Error', 'Please fill in all fields');
    //   return;
    // }
    // setIsLoading(true);

    // if (email === 'test@gmail.com' && password === '12345') {
    //   router.replace('/home');
    //   console.log('Login successful');
    // } else {
    //   Alert.alert('Error', 'Invalid credentials');
    // }

 try {
     
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store authentication data
      await AsyncStorage.setItem('access_token', data.access_token);
      await AsyncStorage.setItem('role', data.user.role.name);
      await AsyncStorage.setItem('location_name', data.user.location?.name || '');
      await AsyncStorage.setItem('location_type', data.user.location?.type || '');
      
      // Redirect based on role
      if (data.user.role.name === 'admin') {
        router.replace('/users');
      } else {
        router.replace('/home');
      }
      
    } catch (error) {
      Alert.alert('Error', 'Invalid credentials or network error');
    } finally {
      setIsLoading(false);
    }

  };

  









  return (
    <KeyboardAvoidingView
      style={tw`flex-1 bg-white`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={tw`flex-grow justify-center p-5`}>
        <View style={tw`items-center mb-10`}>
          <Image 
            source={require('../assets/images/splash-logo.jpeg')} 
            style={tw`w-40 h-40 mb-4`}
            resizeMode="contain"
          />
          <Text style={tw`text-gray-600 text-base`}>Sign in to continue</Text>
        </View>

        <View style={tw`w-full`}>
          <TextInput
            style={tw`bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300`}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={tw`bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300`}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={tw`bg-purple-500 p-4 rounded-lg items-center mt-2`} 
            onPress={handleLogin}
          >
            <Text style={tw`text-white text-base font-bold`}>Sign In</Text>
          </TouchableOpacity>

        
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}