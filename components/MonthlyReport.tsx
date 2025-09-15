import React from "react";
import { ScrollView, Text, View } from "react-native";
import tw from "tailwind-react-native-classnames";
//import { FormData } from ".../types";
import { FormData } from "@/app/types";
// Define the props interface
interface MonthlyReportProps {
  data: Array<{
    month: string;
    total: number;
    avgWeight: number;
    sex: {
      male: number;
      female: number;
    };
    type: {
      fresh: number;
      macerated: number;
    };
    place: {
      facility: number;
      home: number;
    };
  }>;
  rawData: FormData[];
}

const MonthlyReport: React.FC<MonthlyReportProps> = ({ data, rawData }) => {
  if (data.length === 0) {
    return (
      <View style={tw`flex-1 justify-center items-center p-4`}>
        <Text style={tw`text-gray-500 text-lg`}>No monthly data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={tw`p-4`}>
      <Text style={tw`text-2xl font-bold text-purple-700 mb-6 text-center`}>
        Monthly Stillbirth Report
      </Text>

      {data.map((monthData, index) => (
        <View key={index} style={tw`bg-white p-4 rounded-lg shadow-md mb-4`}>
          <Text style={tw`text-xl font-semibold text-purple-600 mb-3`}>
            {monthData.month}
          </Text>

          <Text style={tw`text-lg font-medium mb-2`}>
            Total: {monthData.total}
          </Text>
          <Text style={tw`text-gray-700 mb-1`}>
            Avg Weight: {monthData.avgWeight.toFixed(2)}g
          </Text>

          <Text style={tw`font-medium mt-3`}>Sex:</Text>
          <Text style={tw`text-gray-700`}>
            Male: {monthData.sex.male}, Female: {monthData.sex.female}
          </Text>

          <Text style={tw`font-medium mt-2`}>Type:</Text>
          <Text style={tw`text-gray-700`}>
            Fresh: {monthData.type.fresh}, Macerated: {monthData.type.macerated}
          </Text>

          <Text style={tw`font-medium mt-2`}>Place:</Text>
          <Text style={tw`text-gray-700`}>
            Facility: {monthData.place.facility}, Home: {monthData.place.home}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default MonthlyReport;
