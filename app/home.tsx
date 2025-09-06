import { router } from 'expo-router';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import tw from 'tailwind-react-native-classnames';

const now = new Date().toLocaleString();

const HomeScreen = () => {
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: () => router.replace('/login'),
        style: 'destructive',
      },
    ]);
  };

  return (
    <View style={tw`flex-1 bg-gray-100`}>
      <View style={tw`flex-row justify-between items-center p-5 bg-white border-b border-gray-300`}>
        <Text style={tw`text-2xl font-bold text-gray-800`}>PeriNote</Text>
        <TouchableOpacity 
          onPress={handleLogout} 
          style={tw`bg-red-500 p-2 rounded`}
        >
          <Text style={tw`text-white font-bold`}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={tw`p-5`}>
        <View style={tw`bg-green-600 p-5 rounded-lg mb-5`}>
          <Text style={tw`text-xl font-bold text-white mb-1`}>Mandera Subcounty Hospital!</Text>
          <Text style={tw`text-sm text-green-100`}>
            {now}
          </Text>
        </View>

        <TouchableOpacity
          style={tw`bg-white p-5 rounded-lg mb-4 border-l-4 border-green-600`}
          onPress={() => router.push('/patient_registration')}
        >
          <Text style={tw`text-lg font-bold text-gray-800 mb-1`}>Register New Stillbirth</Text>
          <Text style={tw`text-sm text-gray-600`}>
            Add new patient information to the system
          </Text>
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
    </View>
  );
};

export default HomeScreen;