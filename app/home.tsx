import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import tw from 'tailwind-react-native-classnames';
import HamburgerButton from '../components/HamburgerButton';
const now = new Date().toLocaleString();

const HomeScreen = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

    const handleAddUser = () => {
     router.push('/patient_registration');
  };

    //clear authentication tokens
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
    <View style={tw`flex-1 bg-purple-100`}>
      {/* Header */}
      <View style={tw`flex-row justify-between items-center p-5 bg-white border-b border-gray-300`}>
        {/* <TouchableOpacity onPress={() => setDrawerVisible(true)}>
          <Text style={tw`text-2xl text-purple-500`}>☰</Text>
        </TouchableOpacity> */}

          <HamburgerButton 
  onPress={() => setDrawerVisible(true)}
  position="relative"
/>
        <Text style={tw`text-2xl font-bold text-purple-500`}>PeriNote</Text>

        <TouchableOpacity onPress={handleAddUser}>
                  <Icon name="person-add" size={36} color="#682483ff" />
                </TouchableOpacity>
        {/* <TouchableOpacity 
          onPress={handleLogout} 
          style={tw`bg-purple-500 p-2 rounded`}
        >
          <Text style={tw`text-white font-bold`}>Logout</Text>
        </TouchableOpacity> */}
      </View>

      {/* Load Indicator */}
      {isLoading && (
        <View style={tw`absolute inset-0 bg-black bg-opacity-50 justify-center items-center z-10`}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}

      {/* Main Content */}
      <ScrollView contentContainerStyle={tw`p-5`}>
        <View style={tw`bg-purple-500 p-5 rounded-lg mb-5`}>
          <Text style={tw`text-xl font-bold text-white mb-1`}>Homabay County Teaching and Refferral Hospital</Text>
          <Text style={tw`text-sm text-green-100`}>{now}</Text>
        </View>

        <TouchableOpacity
          style={tw`bg-white p-5 rounded-lg mb-4 border-l-4 border-green-600`}
          onPress={() => router.push('/patient_registration')}
        >
          <Text style={tw`text-lg font-bold text-gray-800 mb-1`}>Report New Stillbirth</Text>
          <Text style={tw`text-sm text-gray-600`}>Add a new stillbirth occurence to the system</Text>
        </TouchableOpacity>

        <View style={tw`flex-row justify-between mt-5`}>
          <View style={tw`bg-white p-5 rounded-lg flex-1 mx-1 items-center`}>
            <Text style={tw`text-2xl font-bold text-blue-500 mb-1`}>20</Text>
            <Text style={tw`text-xs text-gray-600 text-center`}>Total Occurences</Text>
          </View>
          <View style={tw`bg-white p-5 rounded-lg flex-1 mx-1 items-center`}>
            <Text style={tw`text-2xl font-bold text-blue-500 mb-1`}>2</Text>
            <Text style={tw`text-xs text-gray-600 text-center`}>Today's Occurences</Text>
          </View>
        </View>
      </ScrollView>

      {/* Drawer */}
      <Modal
        visible={drawerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDrawerVisible(false)}
      >
        <TouchableOpacity 
          style={tw`flex-1 bg-black bg-opacity-50`}
          onPress={() => setDrawerVisible(false)}
        >
          <View style={tw`w-64 h-full bg-white`}>
            <View style={tw`p-5 bg-purple-500`}>
              <Text style={tw`text-white text-lg font-bold`}>PeriNote Menu</Text>
            </View>
            
            <ScrollView style={tw`flex-1 p-4`}>
              {/* <TouchableOpacity
                style={tw`p-4 border-b border-gray-200`}
                onPress={() => {
                  setDrawerVisible(false);
                  router.push('/register');
                }}
              >
                <Text style={tw`text-gray-800 font-medium`}>Add User</Text>
              </TouchableOpacity> */}

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
                  <Text style={tw`text-purple-700 font-medium ml-2`}><Text>🏠</Text>Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                  onPress={() => {
                    setDrawerVisible(false);
                    router.push('/users');
                  }}
                >
                  <Text style={tw`text-gray-700 font-medium ml-2`}><Text>👥</Text>Users</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                  onPress={() => {
                    setDrawerVisible(false);
                    router.push('/register');
                  }}
                >
                  <Text style={tw`text-gray-700 font-medium ml-2`}><Text>📋</Text>Report Stillbirth</Text>
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
                <Text style={tw`text-red-600 font-semibold`}><Text>🚪</Text>Logout</Text>
              </TouchableOpacity>
                
              
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default HomeScreen;