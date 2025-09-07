// app/users.tsx
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import tw from 'tailwind-react-native-classnames';

// User type definition
type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
};

// Hardcoded user data
const HARDCODED_USERS: User[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@htrh.com',
    phone: '+254712345678',
    role: 'doctor'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@htrh.com',
    phone: '+254723456789',
    role: 'nurse'
  },
  {
    id: '3',
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert.j@htrh.com',
    phone: '+254734567890',
    role: 'admin'
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.w@htrh.com',
    phone: '+254745678901',
    role: 'data_clerk'
  },
  {
    id: '5',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.b@htrh.com',
    phone: '+254756789012',
    role: 'viewer'
  },
  {
    id: '6',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.d@htrh.com',
    phone: '+254767890123',
    role: 'nurse'
  },
  {
    id: '7',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.w@htrh.com',
    phone: '+254778901234',
    role: 'doctor'
  },
  {
    id: '8',
    firstName: 'Jennifer',
    lastName: 'Taylor',
    email: 'jennifer.t@htrh.com',
    phone: '+254789012345',
    role: 'nurse'
  }
];

const UsersScreen = () => {
  const [users, setUsers] = useState<User[]>(HARDCODED_USERS);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(HARDCODED_USERS);
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);


const [drawerVisible, setDrawerVisible] = useState(false);
  

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

  // Helper function to clear authentication tokens
  const clearAuthTokens = () => {
    // token clearing logic here
    console.log('Clearing auth tokens');
  };






  // Form state for editing
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
  });

  // Search users by phone number
  const searchUsersByPhone = () => {
    if (!searchPhone.trim()) {
      setFilteredUsers(users);
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const filtered = users.filter(user => 
        user.phone.includes(searchPhone)
      );
      setFilteredUsers(filtered);
      setIsLoading(false);
      
      if (filtered.length === 0) {
        Alert.alert('Info', 'No users found with that phone number');
      }
    }, 500);
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
    setIsEditing(false);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Update the user in the local state
      const updatedUsers = users.map(user =>
        user.id === selectedUser.id ? { ...user, ...editForm } : user
      );
      
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setSelectedUser({ ...selectedUser, ...editForm });
      setIsEditing(false);
      setIsLoading(false);
      
      Alert.alert('Success', 'User updated successfully');
    }, 1000);
  };

  const handleAddUser = () => {
     router.push('/patient_registration'); // Uncomment when API is ready
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={tw`bg-white p-4 rounded-lg mb-2 border border-gray-200 ${
        selectedUser?.id === item.id ? 'border-blue-500 border-2' : ''
      }`}
      onPress={() => handleUserSelect(item)}
    >
      <Text style={tw`font-bold text-gray-800`}>{item.firstName} {item.lastName}</Text>
      <Text style={tw`text-gray-600 text-sm`}>{item.email}</Text>
      <Text style={tw`text-gray-600 text-sm`}>{item.phone}</Text>
      <Text style={tw`text-blue-600 text-xs font-medium`}>Role: {item.role}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={tw`flex-1 bg-gray-100`}>
      {/* Header */}
      {/* <View style={tw`flex-row justify-between items-center p-5 bg-white border-b border-gray-300`}>
        <TouchableOpacity onPress={() => router.back()}>
         <Icon name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity> */}


{/* Header */}
      <View style={tw`flex-row justify-between items-center p-5 bg-white border-b border-gray-300`}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)}>
          <Text style={tw`text-2xl text-purple-500`}>☰</Text>
        </TouchableOpacity>

 {/* <Text style={tw`text-2xl font-bold text-purple-500`}>PeriNote</Text>
        <TouchableOpacity 
          onPress={handleLogout} 
          style={tw`bg-purple-500 p-2 rounded`}
        >
          <Text style={tw`text-white font-bold`}>Logout</Text>
        </TouchableOpacity> */}
      {/* </View> */}


   <Text style={tw`text-xl font-bold text-purple-500`}>User Management</Text>
        <TouchableOpacity onPress={handleAddUser}>
          <Icon name="person-add" size={36} color="#682483ff" />
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={tw`absolute inset-0 bg-black bg-opacity-50 justify-center items-center z-10`}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}

      <ScrollView contentContainerStyle={tw`p-5`}>
        {/* Search Section */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-lg font-bold mb-3`}>Search Users by Phone Number</Text>
          <View style={tw`flex-row`}>
            <TextInput
              style={tw`flex-1 bg-white p-3 rounded-l border border-gray-300`}
              placeholder="Enter phone number"
              value={searchPhone}
              onChangeText={setSearchPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={tw`bg-purple-500 p-3 rounded-r`}
              onPress={searchUsersByPhone}
            >
              <Text style={tw`text-white`}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={tw`flex-row flex-col lg:flex-row`}>
          {/* Users List */}
          <View style={tw`flex-1 mb-6 lg:mb-0 lg:mr-4`}>
            <Text style={tw`text-lg font-bold mb-3`}>
              Users List ({filteredUsers.length})
            </Text>
            <FlatList
              data={filteredUsers}
              renderItem={renderUserItem}
              keyExtractor={item => item.id}
              style={tw`max-h-96`}
              ListEmptyComponent={
                <Text style={tw`text-center text-gray-500 mt-10`}>
                  No users found
                </Text>
              }
            />
            {/* <ScrollView
           style={tw`max-h-96`}
           showsVerticalScrollIndicator={true}>
            {filteredUsers.length>0?(
                filteredUsers.map(renderUserItem)
            ):(
                 <Text style={tw`text-center text-gray-500 mt-10`}>
                  No users found
                </Text>
            )}
           </ScrollView> */}
          </View>

          {/* User Details */}
          {selectedUser && (
            <View style={tw`flex-1 bg-white p-5 rounded-lg`}>
              <Text style={tw`text-lg font-bold mb-4`}>User Details</Text>
              
              {isEditing ? (
                // Edit Form
                <>
                  <TextInput
                    style={tw`bg-gray-100 p-3 rounded mb-3 border border-gray-300`}
                    placeholder="First Name"
                    value={editForm.firstName}
                    onChangeText={(text) => setEditForm({...editForm, firstName: text})}
                  />
                  <TextInput
                    style={tw`bg-gray-100 p-3 rounded mb-3 border border-gray-300`}
                    placeholder="Last Name"
                    value={editForm.lastName}
                    onChangeText={(text) => setEditForm({...editForm, lastName: text})}
                  />
                  <TextInput
                    style={tw`bg-gray-100 p-3 rounded mb-3 border border-gray-300`}
                    placeholder="Email"
                    value={editForm.email}
                    onChangeText={(text) => setEditForm({...editForm, email: text})}
                    keyboardType="email-address"
                  />
                  <TextInput
                    style={tw`bg-gray-100 p-3 rounded mb-3 border border-gray-300`}
                    placeholder="Phone"
                    value={editForm.phone}
                    onChangeText={(text) => setEditForm({...editForm, phone: text})}
                    keyboardType="phone-pad"
                  />
                  <TextInput
                    style={tw`bg-gray-100 p-3 rounded mb-4 border border-gray-300`}
                    placeholder="Role"
                    value={editForm.role}
                    onChangeText={(text) => setEditForm({...editForm, role: text})}
                  />
                  
                  <View style={tw`flex-row justify-between`}>
                    <TouchableOpacity
                      style={tw`bg-gray-500 px-4 py-2 rounded`}
                      onPress={() => setIsEditing(false)}
                    >
                      <Text style={tw`text-white`}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={tw`bg-green-600 px-4 py-2 rounded`}
                      onPress={handleUpdateUser}
                    >
                      <Text style={tw`text-white`}>Save Changes</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                // Display Mode
                <>
                  <Text style={tw`text-gray-800 mb-2`}>
                    <Text style={tw`font-bold`}>Name:</Text> {selectedUser.firstName} {selectedUser.lastName}
                  </Text>
                  <Text style={tw`text-gray-800 mb-2`}>
                    <Text style={tw`font-bold`}>Email:</Text> {selectedUser.email}
                  </Text>
                  <Text style={tw`text-gray-800 mb-2`}>
                    <Text style={tw`font-bold`}>Phone:</Text> {selectedUser.phone}
                  </Text>
                  <Text style={tw`text-gray-800 mb-4`}>
                    <Text style={tw`font-bold`}>Role:</Text> {selectedUser.role}
                  </Text>
                  
                  <TouchableOpacity
                    style={tw`bg-blue-600 px-4 py-2 rounded mb-2`}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={tw`text-white text-center`}>Edit User</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={tw`bg-red-500 px-4 py-2 rounded`}
                    onPress={() => Alert.alert('Info', 'Delete functionality would be implemented here')}
                  >
                    <Text style={tw`text-white text-center`}>Delete User</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>

        {/*Notice */}
        {!selectedUser && (
          <View style={tw`bg-yellow-100 p-4 rounded-lg mt-6`}>
            <Text style={tw`text-yellow-800 text-center`}>
              💡 This Screen is meant for the Facility Admin
            </Text>
          </View>
        )}
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

              <TouchableOpacity
                style={tw`p-4 border-b border-gray-200`}
                onPress={() => {
                  setDrawerVisible(false);
                  router.push('./users');
                }}
              >
                <Text style={tw`text-gray-800 font-medium`}>Users</Text>
              </TouchableOpacity>


               <TouchableOpacity
                style={tw`p-4 border-b border-gray-200`}
                onPress={() => {
                  setDrawerVisible(false);
                  router.push('./patient_registration'); 
                }}
              >
                <Text style={tw`text-gray-800 font-medium`}>Report New StillBirth</Text>
              </TouchableOpacity>





              <TouchableOpacity
                style={tw`p-4 border-b border-gray-200`}
                onPress={handleLogout}
              >
                <Text style={tw`text-purple-500 font-medium`}>Logout</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>






















    </View>
  );
};

export default UsersScreen;