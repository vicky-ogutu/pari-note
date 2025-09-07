import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import tw from 'tailwind-react-native-classnames';

// Define the form data type
type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
};

const RegisterScreen = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const handleRegister = () => {
    const { firstName, lastName, email, password, confirmPassword, phone } = formData;

    if (!firstName ||!lastName|| !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    // Simulate registration success
    Alert.alert('Success', 'Registration successful!', [
      {
        text: 'OK',
        onPress: () => router.replace('/login'),
      },
    ]);
  };

  // Define the type for the field parameter
  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={tw`flex-1 bg-white`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
       <TouchableOpacity onPress={() => router.back()}>
               <Icon name="arrow-back" size={24} color="#374151" />
              </TouchableOpacity>
      <ScrollView contentContainerStyle={tw`flex-grow justify-center p-5`}>
        <View style={tw`items-center mb-10`}>
          <Text style={tw`text-2xl font-bold text-gray-800 mb-2`}>Create Account</Text>
      
        </View>

        <View style={tw`w-full`}>
          <TextInput
            style={tw`bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300`}
            placeholder="First Name *"
            placeholderTextColor="#999"
            value={formData.firstName}
            onChangeText={text => updateFormData('firstName', text)}
          />
          <TextInput
            style={tw`bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300`}
            placeholder="Last Name *"
            placeholderTextColor="#999"
            value={formData.lastName}
            onChangeText={text => updateFormData('lastName', text)}
          />

          <TextInput
            style={tw`bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300`}
            placeholder="Email *"
            placeholderTextColor="#999"
            value={formData.email}
            onChangeText={text => updateFormData('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={tw`bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300`}
            placeholder="Phone Number"
            placeholderTextColor="#999"
            value={formData.phone}
            onChangeText={text => updateFormData('phone', text)}
            keyboardType="phone-pad"
          />

          <TextInput
            style={tw`bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300`}
            placeholder="Password *"
            placeholderTextColor="#999"
            value={formData.password}
            onChangeText={text => updateFormData('password', text)}
            secureTextEntry
          />

          <TextInput
            style={tw`bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300`}
            placeholder="Confirm Password *"
            placeholderTextColor="#999"
            value={formData.confirmPassword}
            onChangeText={text => updateFormData('confirmPassword', text)}
            secureTextEntry
          />

          <TouchableOpacity 
            style={tw`bg-purple-500 p-4 rounded-lg items-center mt-2`} 
            onPress={handleRegister}
          >
            <Text style={tw`text-white text-base font-bold`}>Create User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`mt-5 items-center`}
            onPress={() => router.push('/login')}
          >
            <Text style={tw`text-gray-600`}>
              Already created account? <Text style={tw`text-purple-500 font-bold`}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;