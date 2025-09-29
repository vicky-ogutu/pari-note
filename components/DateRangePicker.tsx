import React, { useState } from "react";
import {
    Modal,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import tw from "tailwind-react-native-classnames";
import { DateRange } from "../types/reports";

interface DateRangePickerProps {
  visible: boolean;
  onClose: () => void;
  onDateRangeSelect: (range: DateRange) => void;
  initialRange: DateRange;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  visible,
  onClose,
  onDateRangeSelect,
  initialRange,
}) => {
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(initialRange.startDate);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(initialRange.endDate);

  const getMarkedDates = () => {
    const marked: any = {};

    if (selectedStartDate && selectedEndDate) {
      const start = new Date(selectedStartDate);
      const end = new Date(selectedEndDate);
      const current = new Date(start);

      while (current <= end) {
        const dateString = current.toISOString().split('T')[0];
        
        if (dateString === selectedStartDate) {
          marked[dateString] = {
            startingDay: true,
            color: '#6D28D9',
            textColor: 'white',
          };
        } else if (dateString === selectedEndDate) {
          marked[dateString] = {
            endingDay: true,
            color: '#6D28D9',
            textColor: 'white',
          };
        } else {
          marked[dateString] = {
            color: '#8B5CF6',
            textColor: 'white',
          };
        }

        current.setDate(current.getDate() + 1);
      }
    } else if (selectedStartDate) {
      marked[selectedStartDate] = {
        startingDay: true,
        color: '#6D28D9',
        textColor: 'white',
      };
    }

    return marked;
  };

  const handleDayPress = (day: DateData) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(day.dateString);
      setSelectedEndDate(null);
    } else {
      if (day.dateString < selectedStartDate) {
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(day.dateString);
      } else {
        setSelectedEndDate(day.dateString);
      }
    }
  };

  const handleApply = () => {
    if (selectedStartDate && selectedEndDate) {
      onDateRangeSelect({
        startDate: selectedStartDate,
        endDate: selectedEndDate,
      });
    }
  };

  const handleClear = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  const formatDisplayDate = (dateString: string | null) => {
    if (!dateString) return 'Not selected';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const canApply = selectedStartDate && selectedEndDate;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
        <View style={tw`bg-white p-6 rounded-lg w-11/12 max-w-sm`}>
          <Text style={tw`text-xl font-bold text-purple-700 mb-4 text-center`}>
            Select Date Range
          </Text>

          <View style={tw`bg-purple-50 p-3 rounded-lg mb-4`}>
            <View style={tw`flex-row justify-between`}>
              <View style={tw`flex-1`}>
                <Text style={tw`text-xs text-purple-600 font-semibold`}>Start Date</Text>
                <Text style={tw`text-purple-700`}>{formatDisplayDate(selectedStartDate)}</Text>
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-xs text-purple-600 font-semibold`}>End Date</Text>
                <Text style={tw`text-purple-700`}>{formatDisplayDate(selectedEndDate)}</Text>
              </View>
            </View>
          </View>

          <Calendar
            markingType="period"
            markedDates={getMarkedDates()}
            onDayPress={handleDayPress}
            minDate="2020-01-01"
            maxDate={new Date().toISOString().split('T')[0]}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#6D28D9',
              selectedDayBackgroundColor: '#6D28D9',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#6D28D9',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#6D28D9',
              selectedDotColor: '#ffffff',
              arrowColor: '#6D28D9',
              monthTextColor: '#6D28D9',
              indicatorColor: '#6D28D9',
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14,
            }}
            style={tw`mb-4`}
          />

          <Text style={tw`text-xs text-gray-500 text-center mb-4`}>
            {!selectedStartDate 
              ? "Tap to select start date" 
              : !selectedEndDate 
                ? "Tap to select end date" 
                : "Tap any date to start new selection"}
          </Text>

          <View style={tw`flex-row gap-3`}>
            <TouchableOpacity
              onPress={onClose}
              style={tw`flex-1 bg-gray-300 py-3 rounded-lg`}
            >
              <Text style={tw`text-center text-gray-700 font-semibold`}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleClear}
              style={tw`flex-1 bg-orange-500 py-3 rounded-lg`}
            >
              <Text style={tw`text-center text-white font-semibold`}>Clear</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleApply}
              style={[
                tw`flex-1 py-3 rounded-lg`,
                canApply ? tw`bg-purple-600` : tw`bg-purple-300`,
              ]}
              disabled={!canApply}
            >
              <Text style={tw`text-center text-white font-semibold`}>
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DateRangePicker;