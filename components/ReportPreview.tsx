import React from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "tailwind-react-native-classnames";

export interface PreviewData {
  sex: string;
  type: string;
  facility: string;
  date?: string;
  time?: string;
  weight?: string;
  motherAge?: string;
  gestationalAge?: string;
  deliveryPlace?: string;
}

interface ReportPreviewProps {
  visible: boolean;
  onClose: () => void;
  previewData: PreviewData[];
  title: string;
  onDownload: () => void;
  isLoading?: boolean;
  showAdditionalInfo?: boolean;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({
  visible,
  onClose,
  previewData,
  title,
  onDownload,
  isLoading = false,
  showAdditionalInfo = false,
}) => {
  const renderTableHeader = () => {
    if (showAdditionalInfo) {
      return (
        <View style={tw`flex-row bg-purple-100 p-3 border-b border-gray-200`}>
          <Text style={tw`flex-1 font-bold text-purple-600 text-xs`}>Sex</Text>
          <Text style={tw`flex-1 font-bold text-purple-600 text-xs`}>Type</Text>
          <Text style={tw`flex-1 font-bold text-purple-600 text-xs`}>
            Facility
          </Text>
          <Text style={tw`flex-1 font-bold text-purple-600 text-xs`}>Date</Text>
          <Text style={tw`flex-1 font-bold text-purple-600 text-xs`}>
            Weight
          </Text>
          <Text style={tw`flex-1 font-bold text-purple-600 text-xs`}>
            Mother Age
          </Text>
        </View>
      );
    }

    return (
      <View style={tw`flex-row bg-purple-100 p-3 border-b border-gray-200`}>
        <Text style={tw`flex-1 font-bold text-purple-600 text-xs`}>Sex</Text>
        <Text style={tw`flex-1 font-bold text-purple-600 text-xs`}>Type</Text>
        <Text style={tw`flex-1 font-bold text-purple-600 text-xs`}>
          Facility
        </Text>
        <Text style={tw`flex-1 font-bold text-purple-600 text-xs`}>Date</Text>
      </View>
    );
  };

  const renderTableRow = (item: PreviewData, index: number) => {
    if (showAdditionalInfo) {
      return (
        <View key={index} style={tw`flex-row p-3 border-b border-gray-100`}>
          <Text style={tw`flex-1 text-xs`}>{item.sex}</Text>
          <Text style={tw`flex-1 text-xs`}>{item.type}</Text>
          <Text style={tw`flex-1 text-xs`}>{item.facility}</Text>
          <Text style={tw`flex-1 text-xs`}>{item.date}</Text>
          <Text style={tw`flex-1 text-xs`}>{item.weight || "N/A"}</Text>
          <Text style={tw`flex-1 text-xs`}>{item.motherAge || "N/A"}</Text>
        </View>
      );
    }

    return (
      <View key={index} style={tw`flex-row p-3 border-b border-gray-100`}>
        <Text style={tw`flex-1 text-xs`}>{item.sex}</Text>
        <Text style={tw`flex-1 text-xs`}>{item.type}</Text>
        <Text style={tw`flex-1 text-xs`}>{item.facility}</Text>
        <Text style={tw`flex-1 text-xs`}>{item.date}</Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={tw`flex-1 p-4 bg-white`}>
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <View style={tw`flex-1`}>
            <Text style={tw`text-lg font-bold text-purple-600`}>
              MOH 369 Report
            </Text>
            <Text style={tw`text-lg text-gray-600`}>{title}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={tw`p-2`}>
            <Text style={tw`text-lg font-bold text-gray-500`}>×</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={tw`flex-1 justify-center items-center`}>
            <ActivityIndicator size="large" color="#6D28D9" />
            <Text style={tw`mt-2 text-gray-600`}>Loading preview data...</Text>
          </View>
        ) : (
          <>
            <ScrollView style={tw`flex-1 mb-4`}>
              {previewData.length > 0 ? (
                <View style={tw`border border-gray-200 rounded-lg`}>
                  {renderTableHeader()}
                  {previewData.map(renderTableRow)}
                </View>
              ) : (
                <View style={tw`flex-1 justify-center items-center py-8`}>
                  <Text style={tw`text-center text-gray-500 text-lg`}>
                    No data available for preview
                  </Text>
                  <Text style={tw`text-center text-gray-400 mt-2`}>
                    There are no records matching your criteria
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={tw`flex-row gap-3`}>
              <TouchableOpacity
                onPress={onClose}
                style={tw`flex-1 bg-gray-300 py-3 rounded-lg`}
              >
                <Text style={tw`text-center text-gray-700 font-semibold`}>
                  Close
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onDownload}
                style={tw`flex-1 bg-purple-600 py-3 rounded-lg ml-3 ${
                  previewData.length === 0 ? "opacity-50" : ""
                }`}
                disabled={previewData.length === 0}
              >
                <Text style={tw`text-center text-white font-semibold`}>
                  Download Excel
                </Text>
              </TouchableOpacity>
            </View>

            {previewData.length > 0 && (
              <View style={tw`bg-green-50 p-3 rounded-lg mt-3`}>
                <Text style={tw`text-green-700 text-center text-xs`}>
                  The Excel file will include all {previewData.length} records
                  with complete details
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </Modal>
  );
};

export default ReportPreview;
