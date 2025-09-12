import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import tw from 'tailwind-react-native-classnames';
import HamburgerButton from '../components/HamburgerButton';
import MonthlyReport from '../components/MonthlyReport';
import ReportDashboard from '../components/today_report';
import { FormData } from './types';


export const mockStillbirthData: FormData[] = [
  {
    dateOfDeath: '10/9/2025',
    timeOfDeath: '08:30 AM',
    gestationWeeks: '32',
    babyOutcome: 'Fresh still-birth',
    apgar1min: '',
    apgar5min: '',
    apgar10min: '',
    ageAtDeath: '',
    birthWeight: '1800',
    sexOfBaby: 'Male',
    otherSex: '',
    motherAge: '28',
    motherMarried: 'Yes',
    motherPara: '2',
    motherOutcome: 'Alive',
    pregnancyType: 'Singleton',
    antenatalCare: 'Yes',
    obstetricConditions: ['Anemia', 'Hypertensive disease'],
    otherObstetric: '',
    deliveryPlace: 'Facility',
    otherDeliveryPlace: '',
    facilityLevel: '4',
    deliveryType: 'Caesarian Section',
    otherDeliveryType: '',
    periodOfDeath: 'Intrapartum',
    perinatalCause: ['Birth Asphyxia'],
    maternalCondition: 'Maternal complications of Pregnancy',
    otherCause: ''
  },
  {
    dateOfDeath: '10/9/2025',
    timeOfDeath: '14:45 PM',
    gestationWeeks: '36',
    babyOutcome: 'Macerated still-birth',
    apgar1min: '',
    apgar5min: '',
    apgar10min: '',
    ageAtDeath: '',
    birthWeight: '2500',
    sexOfBaby: 'Female',
    otherSex: '',
    motherAge: '35',
    motherMarried: 'Yes',
    motherPara: '3',
    motherOutcome: 'Alive',
    pregnancyType: 'Singleton',
    antenatalCare: 'Yes',
    obstetricConditions: ['Diabetes', 'Pre-labor rupture of membranes'],
    otherObstetric: '',
    deliveryPlace: 'Facility',
    otherDeliveryPlace: '',
    facilityLevel: '5',
    deliveryType: 'SVD-Skilled',
    otherDeliveryType: '',
    periodOfDeath: 'Antepartum',
    perinatalCause: ['Infection', 'Prematurity'],
    maternalCondition: 'Complications of placenta, cord and membranes',
    otherCause: ''
  },
  {
    dateOfDeath: '10/9/2025',
    timeOfDeath: '23:15 PM',
    gestationWeeks: '28',
    babyOutcome: 'Fresh still-birth',
    apgar1min: '',
    apgar5min: '',
    apgar10min: '',
    ageAtDeath: '',
    birthWeight: '1200',
    sexOfBaby: 'Female',
    otherSex: '',
    motherAge: '19',
    motherMarried: 'No',
    motherPara: '1',
    motherOutcome: 'Alive',
    pregnancyType: 'Singleton',
    antenatalCare: 'No',
    obstetricConditions: ['Malaria', 'Anemia'],
    otherObstetric: '',
    deliveryPlace: 'Home',
    otherDeliveryPlace: '',
    facilityLevel: '',
    deliveryType: 'SVD-Unskilled',
    otherDeliveryType: '',
    periodOfDeath: 'Intrapartum',
    perinatalCause: ['Birth Asphyxia', 'Low birth weight'],
    maternalCondition: 'Maternal medical and surgical conditions',
    otherCause: ''
  },
  {
    dateOfDeath: '9/9/2025',
    timeOfDeath: '04:20 AM',
    gestationWeeks: '40',
    babyOutcome: 'Fresh still-birth',
    apgar1min: '',
    apgar5min: '',
    apgar10min: '',
    ageAtDeath: '',
    birthWeight: '3200',
    sexOfBaby: 'Male',
    otherSex: '',
    motherAge: '32',
    motherMarried: 'Yes',
    motherPara: '2',
    motherOutcome: 'Alive',
    pregnancyType: 'Multiple',
    antenatalCare: 'Yes',
    obstetricConditions: ['Hypertensive disease', 'Preterm delivery'],
    otherObstetric: '',
    deliveryPlace: 'Facility',
    otherDeliveryPlace: '',
    facilityLevel: '6',
    deliveryType: 'Caesarian Section',
    otherDeliveryType: '',
    periodOfDeath: 'Intrapartum',
    perinatalCause: ['Birth trauma'],
    maternalCondition: 'Other complications of labour and delivery',
    otherCause: ''
  },
  {
    dateOfDeath: '9/9/2023', 
    timeOfDeath: '11:30 AM',
    gestationWeeks: '34',
    babyOutcome: 'Macerated still-birth',
    apgar1min: '',
    apgar5min: '',
    apgar10min: '',
    ageAtDeath: '',
    birthWeight: '2100',
    sexOfBaby: 'Female',
    otherSex: '',
    motherAge: '27',
    motherMarried: 'Yes',
    motherPara: '1',
    motherOutcome: 'Alive',
    pregnancyType: 'Singleton',
    antenatalCare: 'Yes',
    obstetricConditions: ['UTI', 'Chorioamnionitis'],
    otherObstetric: '',
    deliveryPlace: 'Facility',
    otherDeliveryPlace: '',
    facilityLevel: '3',
    deliveryType: 'Assisted VD',
    otherDeliveryType: '',
    periodOfDeath: 'Antepartum',
    perinatalCause: ['Infection'],
    maternalCondition: 'Complications of placenta, cord and membranes',
    otherCause: ''
  },
  {
    dateOfDeath: '9/9/2025',
    timeOfDeath: '19:00 PM',
    gestationWeeks: '31',
    babyOutcome: 'Fresh still-birth',
    apgar1min: '',
    apgar5min: '',
    apgar10min: '',
    ageAtDeath: '',
    birthWeight: '1700',
    sexOfBaby: 'Male',
    otherSex: '',
    motherAge: '24',
    motherMarried: 'Yes',
    motherPara: '2',
    motherOutcome: 'Alive',
    pregnancyType: 'Singleton',
    antenatalCare: 'Yes',
    obstetricConditions: ['Antepartum Hemorrhage'],
    otherObstetric: '',
    deliveryPlace: 'Facility',
    otherDeliveryPlace: '',
    facilityLevel: '4',
    deliveryType: 'Caesarian Section',
    otherDeliveryType: '',
    periodOfDeath: 'Intrapartum',
    perinatalCause: ['Birth Asphyxia'],
    maternalCondition: 'Maternal complications of Pregnancy',
    otherCause: ''
  },
  {
    dateOfDeath: '9/9/2025',
    timeOfDeath: '09:45 AM',
    gestationWeeks: '29',
    babyOutcome: 'Fresh still-birth',
    apgar1min: '',
    apgar5min: '',
    apgar10min: '',
    ageAtDeath: '',
    birthWeight: '1400',
    sexOfBaby: 'Female',
    otherSex: '',
    motherAge: '21',
    motherMarried: 'No',
    motherPara: '1',
    motherOutcome: 'Alive',
    pregnancyType: 'Singleton',
    antenatalCare: 'Unknown',
    obstetricConditions: ['HIV', 'Malaria'],
    otherObstetric: '',
    deliveryPlace: 'Home',
    otherDeliveryPlace: '',
    facilityLevel: '',
    deliveryType: 'SVD-Unskilled',
    otherDeliveryType: '',
    periodOfDeath: 'Intrapartum',
    perinatalCause: ['Low birth weight', 'Prematurity'],
    maternalCondition: 'Maternal medical and surgical conditions',
    otherCause: ''
  },
  {
    dateOfDeath: '9/9/2025',
    timeOfDeath: '16:30 PM',
    gestationWeeks: '38',
    babyOutcome: 'Macerated still-birth',
    apgar1min: '',
    apgar5min: '',
    apgar10min: '',
    ageAtDeath: '',
    birthWeight: '2800',
    sexOfBaby: 'Male',
    otherSex: '',
    motherAge: '30',
    motherMarried: 'Yes',
    motherPara: '3',
    motherOutcome: 'Alive',
    pregnancyType: 'Singleton',
    antenatalCare: 'Yes',
    obstetricConditions: ['Diabetes'],
    otherObstetric: '',
    deliveryPlace: 'Facility',
    otherDeliveryPlace: '',
    facilityLevel: '5',
    deliveryType: 'SVD-Skilled',
    otherDeliveryType: '',
    periodOfDeath: 'Antepartum',
    perinatalCause: ['Congenital malformations'],
    maternalCondition: 'No maternal condition Identified',
    otherCause: ''
  }
];

const now = new Date().toLocaleString();

const HomeScreen = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'monthly'>('today');
  const [userRole, setUserRole] = useState<string>('');



 useEffect(() => {
    const getUserRole = async () => {
      const role = await AsyncStorage.getItem('role');
      setUserRole(role || '');
    };
    getUserRole();
  }, []);


  const handleAddUser = () => {
    router.push('/patient_registration');
  };

  // Clear authentication tokens
  // const clearAuthTokens = () => {
  //   console.log('Clearing auth tokens');
  // };

  const clearAuthTokens = async () => {
    try {
      await AsyncStorage.multiRemove(['access_token', 'role', 'location_name', 'location_type']);
    } catch (error) {
      console.error('Error clearing auth tokens:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: async() => {
          await clearAuthTokens();
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
        <HamburgerButton 
          onPress={() => setDrawerVisible(true)}
          position="relative"
        />
        <Text style={tw`text-2xl font-bold text-purple-500`}>PeriNote</Text>
        <TouchableOpacity onPress={handleAddUser}>
          <Icon name="person-add" size={36} color="#682483ff" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={tw`flex-row bg-white border-b border-gray-200`}>
        <TouchableOpacity 
          style={tw`flex-1 py-3 ${activeTab === 'today' ? 'border-b-2 border-purple-500' : ''}`}
          onPress={() => setActiveTab('today')}
        >
          <Text style={tw`text-center font-semibold ${activeTab === 'today' ? 'text-purple-500' : 'text-gray-500'}`}>
            Today's Report
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={tw`flex-1 py-3 ${activeTab === 'monthly' ? 'border-b-2 border-purple-500' : ''}`}
          onPress={() => setActiveTab('monthly')}
        >
          <Text style={tw`text-center font-semibold ${activeTab === 'monthly' ? 'text-purple-500' : 'text-gray-500'}`}>
            Monthly Report
          </Text>
        </TouchableOpacity>
      </View>

      {/* Load Indicator */}
      {isLoading && (
        <View style={tw`absolute inset-0 bg-black bg-opacity-50 justify-center items-center z-10`}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}

      {/* Main Content */}
      <ScrollView contentContainerStyle={tw`p-4`}>
        {activeTab === 'today' ? (
          <ReportDashboard />
        ) : (
          <MonthlyReport data={mockStillbirthData} />
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
                  <Text style={tw`text-purple-700 font-medium ml-2`}>🏠 Dashboard</Text>
                </TouchableOpacity>

                {userRole === 'admin' && (
                  <TouchableOpacity 
                    style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                    onPress={() => {
                      setDrawerVisible(false);
                      router.push('/users');
                    }}
                  >
                    <Text style={tw`text-gray-700 font-medium ml-2`}>👥 Users</Text>
                  </TouchableOpacity>
                )}

                {userRole === 'nurse' && (
                  <TouchableOpacity 
                    style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                    onPress={() => {
                      setDrawerVisible(false);
                      router.push('/patient_registration');
                    }}
                  >
                    <Text style={tw`text-gray-700 font-medium ml-2`}>📋 Report Stillbirth</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={tw`mb-6`}>
                <Text style={tw`text-gray-500 text-xs uppercase font-semibold mb-3 pl-2`}>
                  Reports
                </Text>
                
                <TouchableOpacity 
                  style={tw`flex-row items-center p-3 rounded-lg mb-2 ${activeTab === 'today' ? 'bg-purple-50' : ''}`}
                  onPress={() => {
                    setDrawerVisible(false);
                    setActiveTab('today');
                  }}
                >
                  <Text style={tw`${activeTab === 'today' ? 'text-purple-700 font-medium' : 'text-gray-700'} ml-2`}>
                    📊 Today's Report
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={tw`flex-row items-center p-3 rounded-lg mb-2 ${activeTab === 'monthly' ? 'bg-purple-50' : ''}`}
                  onPress={() => {
                    setDrawerVisible(false);
                    setActiveTab('monthly');
                  }}
                >
                  <Text style={tw`${activeTab === 'monthly' ? 'text-purple-700 font-medium' : 'text-gray-700'} ml-2`}>
                    📈 Monthly Report
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
                  <Text style={tw`text-red-600 font-semibold`}>🚪 Logout</Text>
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