import React from "react";
import { ScrollView, Text, View } from "react-native";
import tw from "tailwind-react-native-classnames";

interface MonthlyReportProps {
  data: {
    month: string;
    total?: number;
    avgWeight?: number;
    sex?: { male?: number; female?: number };
    type?: { fresh?: number; macerated?: number };
    place?: { home?: number; facility?: number };
  }[];
}

const MonthlyReport: React.FC<MonthlyReportProps> = ({ data }) => {
  // Shared card style
  const cardStyle = tw`flex-1 aspect-square bg-white m-1 p-4 rounded-lg shadow-md justify-center`;

  return (
    <ScrollView style={tw`p-4`}>
      <Text style={tw`text-2xl font-bold text-purple-700 mb-4 text-center`}>
        Monthly Stillbirth Report
      </Text>

      {data.map((monthData, index) => {
        const normalizedType = {
          fresh: monthData.type?.fresh || 0,
          macerated: monthData.type?.macerated || 0,
        };

        const deliveryPlace = {
          home: monthData.place?.home || 0,
          facility: monthData.place?.facility || 0,
        };

        return (
          <View
            key={index}
            style={tw`bg-gray-50 p-4 rounded-lg shadow-md mb-6`}
          >
            {/* Month Header */}
            <Text style={tw`text-xl font-semibold text-purple-600 mb-4`}>
              {monthData.month}
            </Text>
            {/* Row 1 */}
            <View style={tw`flex-row`}>
              {/* Total Cases */}
              <View style={cardStyle}>
                <Text
                  style={tw`text-sm font-semibold text-purple-600 mb-2 text-center`}
                >
                  Total Cases
                </Text>
                <Text style={tw`text-2xl text-gray-700 text-center`}>
                  {monthData.total || 0}
                </Text>
              </View>

              {/* Avg Weight */}
              <View style={cardStyle}>
                <Text
                  style={tw`text-sm font-semibold text-purple-600 mb-2 text-center`}
                >
                  Avg Weight
                </Text>
                <Text style={tw`text-gray-700 text-center`}>
                  {monthData.avgWeight
                    ? monthData.avgWeight.toFixed(2) + "g"
                    : "N/A"}
                </Text>
              </View>
            </View>
            {/* Row 2 */}
            <View style={tw`flex-row`}>
              {/* Sex */}
              <View style={cardStyle}>
                <Text
                  style={tw`text-sm font-semibold text-purple-600 mb-2 text-center`}
                >
                  Sex
                </Text>
                <Text style={tw`text-gray-700 text-center`}>
                  ♀ Female: {monthData.sex?.female || 0}
                </Text>
                <Text style={tw`text-gray-700 text-center`}>
                  ♂ Male: {monthData.sex?.male || 0}
                </Text>
              </View>

              {/* Type */}
              <View style={cardStyle}>
                <Text
                  style={tw`text-sm font-semibold text-purple-600 mb-2 text-center`}
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
            </View>
            {/* Row 3 */}
            <View style={tw`flex-row`}>
              {/* Place */}
              <View style={[cardStyle, tw`w-full`]}>
                <Text
                  style={tw`text-sm font-semibold text-purple-600 mb-2 text-center`}
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
      })}
    </ScrollView>
  );
};

export default MonthlyReport;
