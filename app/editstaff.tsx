// app/editstaff.tsx
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'tailwind-react-native-classnames';

const EditStaffScreen = () => {
  const params = useLocalSearchParams();
  
  const [formData, setFormData] = useState({
    firstName: params.firstName as string || '',
    lastName: params.lastName as string || '',
    email: params.email as string || '',
    phone: params.phone as string || '',
    role: params.role as string || '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = () => {
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.role) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'User updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }, 1000);
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={tw`flex-1 bg-gray-100`} contentContainerStyle={tw`p-5`}>
      <Text style={tw`text-2xl font-bold text-center mb-6 text-purple-600`}>Edit Staff Member</Text>
      
      <View style={tw`bg-white p-5 rounded-lg`}>
        <Text style={tw`text-lg font-semibold mb-4`}>Editing: {params.firstName} {params.lastName}</Text>
        
        <TextInput
          style={tw`bg-gray-100 p-3 rounded mb-4 border border-gray-300`}
          placeholder="First Name *"
          value={formData.firstName}
          onChangeText={(text) => updateField('firstName', text)}
        />
        
        <TextInput
          style={tw`bg-gray-100 p-3 rounded mb-4 border border-gray-300`}
          placeholder="Last Name *"
          value={formData.lastName}
          onChangeText={(text) => updateField('lastName', text)}
        />
        
        <TextInput
          style={tw`bg-gray-100 p-3 rounded mb-4 border border-gray-300`}
          placeholder="Email *"
          value={formData.email}
          onChangeText={(text) => updateField('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={tw`bg-gray-100 p-3 rounded mb-4 border border-gray-300`}
          placeholder="Phone"
          value={formData.phone}
          onChangeText={(text) => updateField('phone', text)}
          keyboardType="phone-pad"
        />
        
        <TextInput
          style={tw`bg-gray-100 p-3 rounded mb-6 border border-gray-300`}
          placeholder="Role *"
          value={formData.role}
          onChangeText={(text) => updateField('role', text)}
        />
        
        <View style={tw`flex-row justify-between`}>
          <TouchableOpacity
            style={tw`bg-gray-500 px-4 py-3 rounded flex-1 mr-2`}
            onPress={() => router.back()}
          >
            <Text style={tw`text-white text-center`}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={tw`bg-purple-600 px-4 py-3 rounded flex-1 ml-2`}
            onPress={handleUpdate}
            disabled={isLoading}
          >
            <Text style={tw`text-white text-center`}>
              {isLoading ? 'Updating...' : 'Update User'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default EditStaffScreen;