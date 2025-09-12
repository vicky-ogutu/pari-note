import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import tw from 'tailwind-react-native-classnames';

// DefineFormData type
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

type MonthlyReportProps = {
  data: FormData[];
};

const MonthlyReport: React.FC<MonthlyReportProps> = ({ data }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<FormData[]>([]);

  useEffect(() => {
    // Filter data for selected month and year
    const filteredData = data.filter(item => {
      const [day, month, year] = item.dateOfDeath.split('/').map(Number);
      return month === selectedMonth + 1 && year === selectedYear;
    });
    setMonthlyData(filteredData);
  }, [data, selectedMonth, selectedYear]);

  // Calculate monthly metrics
  const calculateMetrics = () => {
    return {
      totalStillbirths: monthlyData.length,
      freshStillbirths: monthlyData.filter(item => item.babyOutcome === 'Fresh still-birth').length,
      maceratedStillbirths: monthlyData.filter(item => item.babyOutcome === 'Macerated still-birth').length,
      male: monthlyData.filter(item => item.sexOfBaby === 'Male').length,
      female: monthlyData.filter(item => item.sexOfBaby === 'Female').length,
      facilityDeliveries: monthlyData.filter(item => item.deliveryPlace === 'Facility').length,
      homeDeliveries: monthlyData.filter(item => item.deliveryPlace === 'Home').length,
      averageGestation: Math.round(monthlyData.reduce((sum, item) => sum + parseInt(item.gestationWeeks || '0'), 0) / monthlyData.length) || 0,
      averageBirthWeight: Math.round(monthlyData.reduce((sum, item) => sum + parseInt(item.birthWeight || '0'), 0) / monthlyData.length) || 0,
      intrapartum: monthlyData.filter(item => item.periodOfDeath === 'Intrapartum').length,
      antepartum: monthlyData.filter(item => item.periodOfDeath === 'Antepartum').length,
    };
  };

  const metrics = calculateMetrics();

  // Month names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Navigation between months
  const changeMonth = (direction: number) => {
    let newMonth = selectedMonth + direction;
    let newYear = selectedYear;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  return (
    <View style={tw`bg-white rounded-lg shadow-md p-4 mb-6`}>
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <Text style={tw`text-2xl text-purple-600`}>←</Text>
        </TouchableOpacity>
        
        <Text style={tw`text-xl font-bold text-purple-800`}>
          {monthNames[selectedMonth]} {selectedYear}
        </Text>
        
        <TouchableOpacity onPress={() => changeMonth(1)}>
          <Text style={tw`text-2xl text-purple-600`}>→</Text>
        </TouchableOpacity>
      </View>

      {monthlyData.length === 0 ? (
        <Text style={tw`text-center text-gray-500 py-4`}>
          No data available for {monthNames[selectedMonth]} {selectedYear}
        </Text>
      ) : (
        <ScrollView>
          <View style={tw`flex-row flex-wrap justify-between mb-4`}>
  <View style={tw`w-1/2 p-2`}>
    <View style={tw`bg-purple-100 rounded-lg p-3 items-center flex-1 justify-center`}>
      <Text style={tw`text-2xl font-bold text-purple-700`}>{metrics.totalStillbirths}</Text>
      <Text style={tw`text-sm text-purple-600`}>Total Stillbirths</Text>
    </View>
  </View>

  <View style={tw`w-1/2 p-2`}>
    <View style={tw`bg-blue-100 rounded-lg p-3 items-center flex-1 justify-center`}>
      <Text style={tw`text-2xl font-bold text-blue-700`}>{metrics.averageGestation}</Text>
      <Text style={tw`text-sm text-blue-600`}>Avg. Gestation (weeks)</Text>
    </View>
  </View>

  <View style={tw`w-1/2 p-2`}>
    <View style={tw`bg-green-100 rounded-lg p-3 items-center flex-1 justify-center`}>
      <Text style={tw`text-2xl font-bold text-green-700`}>{metrics.averageBirthWeight}g</Text>
      <Text style={tw`text-sm text-green-600`}>Avg. Birth Weight</Text>
    </View>
  </View>

  <View style={tw`w-1/2 p-2`}>
    <View style={tw`bg-orange-100 rounded-lg p-3 items-center flex-1 justify-center`}>
      <Text style={tw`text-2xl font-bold text-orange-700`}>{metrics.facilityDeliveries}</Text>
      <Text style={tw`text-sm text-orange-600`}>Facility Deliveries</Text>
    </View>
  </View>
</View>


          <View style={tw`mb-4`}>
            <Text style={tw`text-lg font-bold mb-2 text-gray-800`}>Breakdown by Type</Text>
            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={tw`text-gray-700`}>Fresh Stillbirths</Text>
              <Text style={tw`text-gray-700 font-bold`}>{metrics.freshStillbirths}</Text>
            </View>
            <View style={tw`flex-row justify-between`}>
              <Text style={tw`text-gray-700`}>Macerated Stillbirths</Text>
              <Text style={tw`text-gray-700 font-bold`}>{metrics.maceratedStillbirths}</Text>
            </View>
          </View>

          {/* <View style={tw`mb-4`}>
            <Text style={tw`text-lg font-bold mb-2 text-gray-800`}>Period of Death</Text>
            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={tw`text-gray-700`}>Intrapartum</Text>
              <Text style={tw`text-gray-700 font-bold`}>{metrics.intrapartum}</Text>
            </View>
            <View style={tw`flex-row justify-between`}>
              <Text style={tw`text-gray-700`}>Antepartum</Text>
              <Text style={tw`text-gray-700 font-bold`}>{metrics.antepartum}</Text>
            </View>
          </View> */}

          <View style={tw`mb-4`}>
            <Text style={tw`text-lg font-bold mb-2 text-gray-800`}>By Sex</Text>
            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={tw`text-gray-700`}>Male</Text>
              <Text style={tw`text-gray-700 font-bold`}>{metrics.male}</Text>
            </View>
            <View style={tw`flex-row justify-between`}>
              <Text style={tw`text-gray-700`}>Female</Text>
              <Text style={tw`text-gray-700 font-bold`}>{metrics.female}</Text>
            </View>
          </View>

          <View>
            <Text style={tw`text-lg font-bold mb-2 text-gray-800`}>Delivery Location</Text>
            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={tw`text-gray-700`}>Facility</Text>
              <Text style={tw`text-gray-700 font-bold`}>{metrics.facilityDeliveries}</Text>
            </View>
            <View style={tw`flex-row justify-between`}>
              <Text style={tw`text-gray-700`}>Home</Text>
              <Text style={tw`text-gray-700 font-bold`}>{metrics.homeDeliveries}</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default MonthlyReport;