import React from "react";
import { Text, View } from "react-native";
import tw from "tailwind-react-native-classnames";

// Define the props interface based on actual API response
interface ReportDashboardProps {
  data?: {
    total: number;
    sex: {
      female?: number;
      male?: number;
    };
    type: {
      stillbirth?: number;
      fresh?: number;
      macerated?: number;
    };
  };
}

const ReportDashboard: React.FC<ReportDashboardProps> = ({ data }) => {
  if (!data) {
    return (
      <View style={tw`flex-1 justify-center items-center p-4`}>
        <Text style={tw`text-gray-500 text-lg`}>
          No data available for today
        </Text>
      </View>
    );
  }

  return (
    <View style={tw`p-4`}>
      <Text style={tw`text-2xl font-bold text-purple-700 mb-6 text-center`}>
        Today's Stillbirth Report
      </Text>

      {/* Total Cases */}
      <View style={tw`bg-white p-4 rounded-lg shadow-md mb-4`}>
        <Text style={tw`text-xl font-semibold text-center text-purple-600`}>
          Total Cases: {data.total || 0}
        </Text>
      </View>

      {/* Sex Distribution */}
      <View style={tw`bg-white p-4 rounded-lg shadow-md mb-4`}>
        <Text style={tw`text-lg font-semibold text-purple-600 mb-2`}>
          Sex Distribution
        </Text>
        <View style={tw`flex-row justify-between`}>
          <Text style={tw`text-gray-700`}>Female: {data.sex?.female || 0}</Text>
          <Text style={tw`text-gray-700`}>Male: {data.sex?.male || 0}</Text>
        </View>
      </View>

      {/* Type Distribution */}
      <View style={tw`bg-white p-4 rounded-lg shadow-md`}>
        <Text style={tw`text-lg font-semibold text-purple-600 mb-2`}>
          Type Distribution
        </Text>
        <View style={tw`flex-row justify-between`}>
          <Text style={tw`text-gray-700`}>Fresh: {data.type?.fresh || 0}</Text>
          <Text style={tw`text-gray-700`}>
            Macerated: {data.type?.macerated || 0}
          </Text>
        </View>
        {/* Stillbirth type if available */}
        {data.type?.stillbirth !== undefined && (
          <View style={tw`mt-2`}>
            <Text style={tw`text-gray-700`}>
              Stillbirth: {data.type.stillbirth}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ReportDashboard;
