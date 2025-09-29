import React from "react";
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import tw from "tailwind-react-native-classnames";

export interface TileData {
  total: number;
  sex: {
    female: number;
    male: number;
  };
  type: {
    fresh: number;
    macerated: number;
  };
  place: {
    home: number;
    facility: number;
  };
}

interface ReportTilesProps {
  data: TileData;
  title: string;
  onTotalPress: () => void;
  showDatePicker?: boolean;
  onDatePickerPress?: () => void;
  isLoading?: boolean;
}

const ReportTiles: React.FC<ReportTilesProps> = ({
  data,
  title,
  onTotalPress,
  showDatePicker = false,
  onDatePickerPress,
  isLoading = false,
}) => {
  // Shared card style
  const cardStyle = tw`flex-1 aspect-square bg-white m-1 p-4 rounded-lg shadow-md justify-center`;

  if (isLoading) {
    return (
      <View style={tw`p-4`}>
        <View style={tw`flex-row justify-center items-center py-8`}>
          <ActivityIndicator size="large" color="#6D28D9" />
          <Text style={tw`ml-3 text-gray-600`}>Loading {title}...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={tw`p-4`}>
      {/* Title and Date Picker Button */}
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <Text style={tw`text-lg font-bold text-purple-700`}>{title}</Text>
        {showDatePicker && onDatePickerPress && (
          <TouchableOpacity
            onPress={onDatePickerPress}
            style={tw`bg-purple-600 px-4 py-2 rounded-lg`}
          >
            <Text style={tw`text-white text-sm font-semibold`}>
              Select Dates
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Row 1 */}
      <View style={tw`flex-row`}>
        {/* Total Cases - Clickable */}
        <TouchableOpacity
          style={[
            cardStyle,
            (!data.total || data.total === 0) && tw`opacity-50`,
          ]}
          onPress={onTotalPress}
          disabled={!data.total || data.total === 0}
        >
          <Text
            style={tw`text-lg font-semibold text-purple-600 mb-2 text-center`}
          >
            Total Cases
          </Text>
          <Text style={tw`text-2xl text-gray-700 text-center`}>
            {data.total || 0}
          </Text>
          <Text style={tw`text-xs text-purple-500 text-center mt-2`}>
            {data.total && data.total > 0
              ? "Tap to preview and download linelist"
              : "No data available"}
          </Text>
        </TouchableOpacity>

        {/* Sex Distribution */}
        <View style={cardStyle}>
          <Text
            style={tw`text-lg font-semibold text-purple-600 mb-2 text-center`}
          >
            Sex
          </Text>
          <Text style={tw`text-gray-700 text-center`}>
            ♀ Female: {data.sex.female || 0}
          </Text>
          <Text style={tw`text-gray-700 text-center`}>
            ♂ Male: {data.sex.male || 0}
          </Text>
        </View>
      </View>

      {/* Row 2 */}
      <View style={tw`flex-row`}>
        {/* Type Distribution */}
        <View style={cardStyle}>
          <Text
            style={tw`text-lg font-semibold text-purple-600 mb-2 text-center`}
          >
            Type
          </Text>
          <Text style={tw`text-gray-700 text-center`}>
            Fresh: {data.type.fresh || 0}
          </Text>
          <Text style={tw`text-gray-700 text-center`}>
            Macerated: {data.type.macerated || 0}
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
            🏠 Home: {data.place.home || 0}
          </Text>
          <Text style={tw`text-gray-700 text-center`}>
            🏥 Facility: {data.place.facility || 0}
          </Text>
        </View>
      </View>

      {/* Data Summary */}
      {data.total > 0 && (
        <View style={tw`bg-purple-50 p-3 rounded-lg mt-4`}>
          <Text style={tw`text-purple-700 text-center text-sm`}>
            {data.total} total cases • {data.sex.female + data.sex.male} sex recorded •{" "}
            {data.type.fresh + data.type.macerated} types classified
          </Text>
        </View>
      )}
    </View>
  );
};

export default ReportTiles;