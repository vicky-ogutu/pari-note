// app/editstaff.tsx
import HamburgerButton from '@/components/HamburgerButton';
import { router, useLocalSearchParams } from 'expo-router';
import { UserPlusIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
    const [locations, setLocations] = useState<Location[]>([]);
    const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
const [drawerVisible, setDrawerVisible] = useState(false);


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

        const toggleRole = (role: string) => {
    // Check if the role is allowed for the current user
    if (allowedRoles.includes(role)) {
      setSelectedRoles([role]); // Only allow one role selection
    } else {
      Alert.alert("Error", "You are not authorized to create this role");
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

    const handleAddUser = () => {
    router.push("/register");
  };

  return (
        <KeyboardAvoidingView
      style={tw`flex-1 bg-white`}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header with Menu Button - Updated UI from second file */}
      <View
        style={tw`flex-row justify-between items-center p-5 bg-white border-b border-gray-300`}
      >
        <HamburgerButton
          onPress={() => setDrawerVisible(true)}
          position="relative"
        />
        <Text style={tw`text-2xl font-bold text-purple-500`}>Manage use</Text>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={handleAddUser}>
            <UserPlusIcon color="#682483ff" />
          </TouchableOpacity>
        </View>
      </View>
    <ScrollView style={tw`flex-1 bg-gray-100`} contentContainerStyle={tw`p-5`}>
      {/* <Text style={tw`text-2xl font-bold text-center mb-6 text-purple-600`}>Manage use</Text> */}
      
      <View style={tw`bg-white p-5 rounded-lg`}>
        <Text style={tw`text-lg font-semibold mb-4 text-gray-500`}>User details {params.firstName} {params.lastName}</Text>
        
        <TextInput
          style={tw`bg-gray-100 p-3 rounded mb-4 border border-gray-300 text-gray-500`}
          placeholder="First Name *"
          value={formData.firstName}
          onChangeText={(text) => updateField('firstName', text)}
        />
        
        <TextInput
          style={tw`bg-gray-100 p-3 rounded mb-4 border border-gray-300 text-gray-500`}
          placeholder="Last Name *"
          value={formData.lastName}
          onChangeText={(text) => updateField('lastName', text)}
        />
        
        <TextInput
          style={tw`bg-gray-100 p-3 rounded mb-4 border border-gray-300 text-gray-500`}
          placeholder="Email *"
          value={formData.email}
          onChangeText={(text) => updateField('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={tw`bg-gray-100 p-3 rounded mb-4 border border-gray-300 text-gray-500`}
          placeholder="Phone"
          value={formData.phone}
          onChangeText={(text) => updateField('phone', text)}
          keyboardType="phone-pad"
        />
        
        <TextInput
          style={tw`bg-gray-100 p-3 rounded mb-6 border border-gray-300 text-gray-500`}
          placeholder="Role *"
          value={formData.role}
          onChangeText={(text) => updateField('role', text)}
        />

                  {/* Role Selection Checkboxes */}
          <View style={tw`mb-4`}>
            <Text style={tw`text-gray-500 mb-2 font-medium`}>
              Select Role *
            </Text>

            {/* County User */}
            <TouchableOpacity
              style={tw`flex-row items-center mb-2 ${
                !allowedRoles.includes("county user") ? "opacity-50" : ""
              }`}
              onPress={() => toggleRole("county user")}
              disabled={!allowedRoles.includes("county user")}
            >
              <View
                style={tw`w-6 h-6 border border-gray-400 rounded-md mr-2 justify-center items-center ${
                  selectedRoles.includes("county user")
                    ? "bg-purple-600 border-purple-600"
                    : "bg-white"
                }`}
              >
                {selectedRoles.includes("county user") && (
                  <Text style={tw`text-white font-sm`}>✓</Text>
                )}
              </View>
              <Text style={tw`text-gray-500`}>County admin</Text>
            </TouchableOpacity>

            {/* Subcounty User */}
            <TouchableOpacity
              style={tw`flex-row items-center mb-2 ${
                !allowedRoles.includes("subcounty user") ? "opacity-50" : ""
              }`}
              onPress={() => toggleRole("subcounty user")}
              disabled={!allowedRoles.includes("subcounty user")}
            >
              <View
                style={tw`w-6 h-6 border border-gray-400 rounded-md mr-2 justify-center items-center ${
                  selectedRoles.includes("subcounty user")
                    ? "bg-purple-600 border-purple-600"
                    : "bg-white"
                }`}
              >
                {selectedRoles.includes("subcounty user") && (
                  <Text style={tw`text-white font-bold`}>✓</Text>
                )}
              </View>
              <Text style={tw`text-gray-500`}>Subcounty admin</Text>
            </TouchableOpacity>

            {/* Admin (Facility In-Charge) */}
            <TouchableOpacity
              style={tw`flex-row items-center mb-2 ${
                !allowedRoles.includes("admin") ? "opacity-50" : ""
              }`}
              onPress={() => toggleRole("admin")}
              disabled={!allowedRoles.includes("admin")}
            >
              <View
                style={tw`w-6 h-6 border border-gray-400 rounded-md mr-2 justify-center items-center ${
                  selectedRoles.includes("admin")
                    ? "bg-purple-600 border-purple-600"
                    : "bg-white"
                }`}
              >
                {selectedRoles.includes("admin") && (
                  <Text style={tw`text-white font-bold`}>✓</Text>
                )}
              </View>
              <Text style={tw`text-gray-500`}>Facility in-charge</Text>
            </TouchableOpacity>

            {/* Nurse */}
            <TouchableOpacity
              style={tw`flex-row items-center mb-2 ${
                !allowedRoles.includes("nurse") ? "opacity-50" : ""
              }`}
              onPress={() => toggleRole("nurse")}
              disabled={!allowedRoles.includes("nurse")}
            >
              <View
                style={tw`w-6 h-6 border border-gray-400 rounded-md mr-2 justify-center items-center ${
                  selectedRoles.includes("nurse")
                    ? "bg-purple-600 border-purple-600"
                    : "bg-white"
                }`}
              >
                {selectedRoles.includes("nurse") && (
                  <Text style={tw`text-white font-bold`}>✓</Text>
                )}
              </View>
              <Text style={tw`text-gray-500`}>HCW</Text>
            </TouchableOpacity>
          </View>
        
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
    </KeyboardAvoidingView>
  );
};

export default EditStaffScreen;