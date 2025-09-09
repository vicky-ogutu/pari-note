import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import HamburgerButton from '../components/HamburgerButton';

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

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = () => {
    const { firstName, lastName, email, password, confirmPassword, phone } = formData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
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

  // Clear authentication tokens
  const clearAuthTokens = () => {
    // token clearing logic here
    console.log('Clearing auth tokens');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: () => {
          clearAuthTokens();
          router.replace('/login');
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <KeyboardAvoidingView 
      style={tw`flex-1 bg-white`} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header with Menu Button */}
      <View style={tw`flex-row justify-between items-center p-5 bg-white border-b border-gray-200`}>
        {/* <TouchableOpacity 
          onPress={() => setDrawerVisible(true)} 
          style={tw`p-2 rounded-lg bg-purple-100`}
        >
          <Text style={tw`text-2xl text-purple-600`}>☰</Text>
        </TouchableOpacity> */}
          <HamburgerButton 
  onPress={() => setDrawerVisible(true)}
  position="relative"
/>
        
        <View style={tw`w-8`} /> {/* Spacer for balance */}
      </View>

      <ScrollView contentContainerStyle={tw`flex-grow justify-center p-5`}>
        <View style={tw`items-center mb-8`}>
          <Text style={tw`text-2xl font-bold text-gray-800 mb-2`}>Create Staff Account</Text>
          <Text style={tw`text-gray-600 text-center`}>
            Add a new healthcare provider to the system
          </Text>
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
            style={tw`bg-purple-600 p-4 rounded-lg items-center mt-2 shadow-lg`} 
            onPress={handleRegister}
          >
            <Text style={tw`text-white text-base font-bold`}>Create User</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Enhanced Drawer */}
<Modal
  visible={drawerVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setDrawerVisible(false)}
>
  <View style={tw`flex-1`}>
    <TouchableOpacity 
      style={tw`flex-1 bg-black bg-opacity-50`}
      onPress={() => setDrawerVisible(false)}
      activeOpacity={1}
    />
    
    <View style={tw`absolute left-0 top-0 h-full w-72 bg-white shadow-xl`}>
      <View style={tw`p-6 bg-purple-600`}>
        <Text style={tw`text-white text-xl font-bold`}>PeriNote</Text>
        <Text style={tw`text-purple-100 text-sm mt-1`}>Hospital Management System</Text>
      </View>
      
      <ScrollView style={tw`flex-1 p-4`}>
        <View style={tw`mb-6`}>
          <Text style={tw`text-gray-500 text-xs uppercase font-semibold mb-3 pl-2`}>
            Main Navigation
          </Text>
          
          <TouchableOpacity 
            style={tw`flex-row items-center p-3 rounded-lg mb-2 bg-purple-50`}
            onPress={() => {
              setDrawerVisible(false);
              router.push('/home');
            }}
          >
            <Text style={tw`text-purple-700 font-medium ml-2`}>
              <Text>🏠</Text> Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={tw`flex-row items-center p-3 rounded-lg mb-2`}
            onPress={() => {
              setDrawerVisible(false);
              router.push('/users');
            }}
          >
            <Text style={tw`text-gray-700 font-medium ml-2`}>
              <Text>👥</Text> Users
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={tw`flex-row items-center p-3 rounded-lg mb-2`}
            onPress={() => {
              setDrawerVisible(false);
              router.push('/patient_registration');
            }}
          >
            <Text style={tw`text-gray-700 font-medium ml-2`}>
              <Text>📋</Text> Report Stillbirth
            </Text>
          </TouchableOpacity>
        </View>

        <View style={tw`mb-6`}>
          <Text style={tw`text-gray-500 text-xs uppercase font-semibold mb-3 pl-2`}>
            Account
          </Text>

          <TouchableOpacity 
            style={tw`flex-row items-center justify-center p-3 bg-red-50 rounded-lg`}
            onPress={handleLogout}
          >
            <Text style={tw`text-red-600 font-semibold`}>
              <Text>🚪</Text> Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  </View>
</Modal>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;