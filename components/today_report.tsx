import React from "react";
import { Text, View } from "react-native";
import tw from "tailwind-react-native-classnames";

interface ReportDashboardProps {
  data?: {
    total: number;
    sex: {
      female?: number;
      male?: number;
    };
    type: {
      [key: string]: number | undefined;
    };
    deliveryPlace?: {
      home?: number;
      facility?: number;
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

  // 🔹 Normalize backend keys
  const normalizedType = {
    fresh: data.type["fresh stillbirth"] ?? data.type["fresh"] ?? 0,
    macerated: data.type["macerated stillbirth"] ?? data.type["macerated"] ?? 0,
  };

  const deliveryPlace = {
    home: data.deliveryPlace?.home ?? 1,
    facility: data.deliveryPlace?.facility ?? 2,
  };

  // Shared card style
  const cardStyle = tw`flex-1 aspect-square bg-white m-1 p-4 rounded-lg shadow-md justify-center`;

  return (
    <View style={tw`p-4`}>
      <Text style={tw`text-2xl font-bold text-purple-700 mb-6 text-center`}>
        Today's Stillbirth Report
      </Text>

      {/* Row 1 */}
      <View style={tw`flex-row`}>
        {/* Total Cases */}
        <View style={cardStyle}>
          <Text
            style={tw`text-lg font-semibold text-purple-600 mb-2 text-center`}
          >
            Total Cases
          </Text>
          <Text style={tw`text-2xl text-gray-700 text-center`}>
            {data.total || 0}
          </Text>
        </View>

        {/* Sex */}
        <View style={cardStyle}>
          <Text
            style={tw`text-lg font-semibold text-purple-600 mb-2 text-center`}
          >
            Sex
          </Text>
          <Text style={tw`text-gray-700 text-center`}>
            ♀ Female: {data.sex?.female || 0}
          </Text>
          <Text style={tw`text-gray-700 text-center`}>
            ♂ Male: {data.sex?.male || 0}
          </Text>
        </View>
      </View>

      {/* Row 2 */}
      <View style={tw`flex-row`}>
        {/* Type */}
        <View style={cardStyle}>
          <Text
            style={tw`text-lg font-semibold text-purple-600 mb-2 text-center`}
          >
            Type
          </Text>
          <Text style={tw`text-gray-700 text-center`}>
            Fresh: {normalizedType.fresh}
          </Text>
          <Text style={tw`text-gray-700 text-center`}>
            Macerated: {normalizedType.macerated}
          </Text>
        </View>

        {/* Delivery Place */}
        <View style={cardStyle}>
          <Text
            style={tw`text-lg font-semibold text-purple-600 mb-2 text-center`}
          >
            Delivery Place
          </Text>
          <Text style={tw`text-gray-700 text-center`}>
            🏠 Home: {deliveryPlace.home}
          </Text>
          <Text style={tw`text-gray-700 text-center`}>
            🏥 Facility: {deliveryPlace.facility}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ReportDashboard;
