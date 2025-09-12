import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import tw from 'tailwind-react-native-classnames';
// Define the FormData type
type FormData = {
  dateOfDeath: string;
  timeOfDeath: string;
  gestationWeeks: string;
  babyOutcome: string;
  apgar1min: string;
  apgar5min: string;
  apgar10min: string;
  ageAtDeath: string;
  birthWeight: string;
  sexOfBaby: string;
  otherSex: string;
  motherAge: string;
  motherMarried: string;
  motherPara: string;
  motherOutcome: string;
  pregnancyType: string;
  antenatalCare: string;
  obstetricConditions: string[];
  otherObstetric: string;
  deliveryPlace: string;
  otherDeliveryPlace: string;
  facilityLevel: string;
  deliveryType: string;
  otherDeliveryType: string;
  periodOfDeath: string;
  perinatalCause: string[];
  maternalCondition: string;
  otherCause: string;
};

// Mock data storage (replace with your actual data source)
const mockStillbirthData: FormData[] = [
  {
    dateOfDeath: '11/9/2025',
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
    dateOfDeath: '11/9/2025',
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
    dateOfDeath: '12/9/2025',
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
    dateOfDeath: '12/9/2025',
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
    dateOfDeath: '11/9/2023', 
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
    dateOfDeath: '12/9/2025',
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
    dateOfDeath: '11/09/2025',
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
    dateOfDeath: '11/09/2025',
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

const ReportDashboard: React.FC = () => {
  const [todayCount, setTodayCount] = useState(0);
  const [todayData, setTodayData] = useState<FormData[]>([]);

  useEffect(() => {
    // This would be replaced with actual API call
    const fetchTodayStillbirths = () => {
      const today = new Date();
      const todayFormatted = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
      const todayReports = mockStillbirthData.filter(
        report => report.dateOfDeath === todayFormatted
      );
      setTodayCount(todayReports.length);
      setTodayData(todayReports);
    };

    fetchTodayStillbirths();
  }, []);

  const calculateAdditionalMetrics = () => {
    return {
      freshStillbirths: todayData.filter(item => item.babyOutcome === 'Fresh still-birth').length,
      maceratedStillbirths: todayData.filter(item => item.babyOutcome === 'Macerated still-birth').length,
      male: todayData.filter(item => item.sexOfBaby === 'Male').length,
      female: todayData.filter(item => item.sexOfBaby === 'Female').length,
      facilityDeliveries: todayData.filter(item => item.deliveryPlace === 'Facility').length,
      homeDeliveries: todayData.filter(item => item.deliveryPlace === 'Home').length,
    };
  };

  const metrics = calculateAdditionalMetrics();
  const displayDate = new Date().toLocaleDateString();

  return (
    <ScrollView style={tw`p-4 bg-gray-100`}>
      <Text style={tw`text-2xl font-bold mb-6 text-center text-purple-700`}>
        Stillbirth Report Dashboard
      </Text>

      {/* Today's Summary Card */}
      <View style={tw`bg-white rounded-lg shadow-md p-4 mb-6`}>
        <Text style={tw`text-lg font-bold mb-4 text-gray-800`}>
          Today's Summary ({displayDate})
        </Text>
        
        <View style={tw`flex-row flex-wrap justify-between`}>
          {/* Total Stillbirths */}
          <View style={tw`w-1/2 p-2`}>
            <View style={tw`bg-purple-100 rounded-lg p-3 items-center`}>
              <Text style={tw`text-3xl font-bold text-purple-700`}>{todayCount}</Text>
              <Text style={tw`text-sm text-purple-600`}>Total Stillbirths</Text>
            </View>
          </View>

          {/* By Type */}
          <View style={tw`w-1/2 p-2`}>
            <View style={tw`bg-blue-100 rounded-lg p-3`}>
              <Text style={tw`text-sm font-semibold text-blue-800`}>By Type:</Text>
              <Text style={tw`text-xs text-blue-700`}>Fresh: {metrics.freshStillbirths}</Text>
              <Text style={tw`text-xs text-blue-700`}>Macerated: {metrics.maceratedStillbirths}</Text>
            </View>
          </View>

          {/* By Sex */}
          <View style={tw`w-1/2 p-2`}>
            <View style={tw`bg-green-100 rounded-lg p-3`}>
              <Text style={tw`text-sm font-semibold text-green-800`}>By Sex:</Text>
              <Text style={tw`text-xs text-green-700`}>Male: {metrics.male}</Text>
              <Text style={tw`text-xs text-green-700`}>Female: {metrics.female}</Text>
            </View>
          </View>

          {/* By Delivery Place */}
          <View style={tw`w-1/2 p-2`}>
            <View style={tw`bg-orange-100 rounded-lg p-3`}>
              <Text style={tw`text-sm font-semibold text-orange-800`}>Delivery Place:</Text>
              <Text style={tw`text-xs text-orange-700`}>Facility: {metrics.facilityDeliveries}</Text>
              <Text style={tw`text-xs text-orange-700`}>Home: {metrics.homeDeliveries}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Additional reports can be added here */}
      {/* <View style={tw`bg-white rounded-lg shadow-md p-4`}>
        <Text style={tw`text-lg font-bold mb-4 text-gray-800`}>
          Detailed Reports
        </Text>
        <Text style={tw`text-gray-600`}>
          Weekly and monthly reports would be displayed here with charts and trends.
        </Text>
      </View> */}
    </ScrollView>
  );
};

export default ReportDashboard;