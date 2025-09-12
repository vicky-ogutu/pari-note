import DateTimePicker from '@react-native-community/datetimepicker'; // Added missing import
import { router } from 'expo-router';
import React, { useState } from 'react';
import HamburgerButton from '../components/HamburgerButton';

import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import tw from 'tailwind-react-native-classnames';

// Define types for our form data
type FormData = {
  // Section 1: Baby details
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
  
  // Section 2: Mother details
  motherAge: string;
  motherMarried: string;
  motherPara: string;
  motherOutcome: string;
  
  // Section 3: Obstetric history
  pregnancyType: string;
  antenatalCare: string;
  obstetricConditions: string[];
  otherObstetric: string;
  
  // Section 4: Delivery care
  deliveryPlace: string;
  otherDeliveryPlace: string;
  facilityLevel: string;
  deliveryType: string;
  otherDeliveryType: string;
  
  // Section 5: Cause of death
  periodOfDeath: string;
  perinatalCause: string[];
  maternalCondition: string;
  otherCause: string;
};

const initialFormData: FormData = {
  dateOfDeath: '',
  timeOfDeath: '',
  gestationWeeks: '',
  babyOutcome: '',
  apgar1min: '',
  apgar5min: '',
  apgar10min: '',
  ageAtDeath: '',
  birthWeight: '',
  sexOfBaby: '',
  otherSex: '',
  motherAge: '',
  motherMarried: '',
  motherPara: '',
  motherOutcome: '',
  pregnancyType: '',
  antenatalCare: '',
  obstetricConditions: [],
  otherObstetric: '',
  deliveryPlace: '',
  otherDeliveryPlace: '',
  facilityLevel: '',
  deliveryType: '',
  otherDeliveryType: '',
  periodOfDeath: '',
  perinatalCause: [],
  maternalCondition: '',
  otherCause: '',
};

const StillbirthRegistrationScreen = () => {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  //clear authentication tokens
  const clearAuthTokens = () => {
    // token clearing logic here
    console.log('Clearing auth tokens');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: () => {
          clearAuthTokens();
          router.replace('/login');
        },
        style: 'destructive',
      },
    ]);
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB"); // dd/mm/yyyy
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }); // HH:MM AM/PM
  };

  const toggleObstetricCondition = (condition: string) => {
    const currentConditions = [...formData.obstetricConditions];
    const index = currentConditions.indexOf(condition);
    
    if (index > -1) {
      currentConditions.splice(index, 1);
    } else {
      currentConditions.push(condition);
    }
    
    updateFormData('obstetricConditions', currentConditions);
  };

  const togglePerinatalCause = (cause: string) => {
    const currentCauses = [...formData.perinatalCause];
    const index = currentCauses.indexOf(cause);
    
    if (index > -1) {
      currentCauses.splice(index, 1);
    } else {
      currentCauses.push(cause);
    }
    
    updateFormData('perinatalCause', currentCauses);
  };

  const nextScreen = () => {
    if (currentScreen < 6) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const prevScreen = () => {
    if (currentScreen > 1) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const submitForm = () => {
    Alert.alert(
      "Success",
      "Stillbirth registration submitted successfully!",
      [{ text: "OK", onPress: () => console.log("Form submitted", formData) }]
    );
  };

  const renderScreen = () => {
    switch(currentScreen) {
      case 1:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-800`}>1. Details of Deceased baby</Text>
            
            {/* Date Picker Field */}
            <TouchableOpacity
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{formData.dateOfDeath || "Date of death (dd/mm/yyyy)"}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    updateFormData("dateOfDeath", formatDate(selectedDate));
                  }
                }}
              />
            )}

            {/* Time Picker Field */}
            <TouchableOpacity
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              onPress={() => setShowTimePicker(true)}
            >
              <Text>{formData.timeOfDeath || "Time of death (HH:MM AM/PM)"}</Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                is24Hour={false} // 12-hour format with AM/PM
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowTimePicker(false);
                  if (selectedDate) {
                    updateFormData("timeOfDeath", formatTime(selectedDate));
                  }
                }}
              />
            )}
            
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              placeholder="Gestation at birth (in weeks)"
              value={formData.gestationWeeks}
              onChangeText={(text) => updateFormData('gestationWeeks', text)}
              keyboardType="numeric"
            />
            
            <Text style={tw`text-base font-semibold mb-2 text-gray-700`}>Baby outcome:</Text>
            <View style={tw`mb-4`}>
              {['Alive', 'Fresh still-birth', 'Macerated still-birth'].map(option => (
                <TouchableOpacity 
                  key={option} 
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateFormData('babyOutcome', option)}
                >
                  <View style={tw`h-5 w-5 rounded-full border-2 border-blue-500 items-center justify-center mr-2`}>
                    {formData.babyOutcome === option && <View style={tw`h-3 w-3 rounded-full bg-blue-500`} />}
                  </View>
                  <Text style={tw`text-gray-800`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {formData.babyOutcome === 'Alive' && (
              <>
                <Text style={tw`text-base font-semibold mb-2 text-gray-700`}>Apgar score:</Text>
                <View style={tw`flex-row justify-between mb-4`}>
                  <TextInput
                    style={tw`bg-white p-4 rounded border border-gray-300 flex-1 mx-1`}
                    placeholder="1 min"
                    value={formData.apgar1min}
                    onChangeText={(text) => updateFormData('apgar1min', text)}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={tw`bg-white p-4 rounded border border-gray-300 flex-1 mx-1`}
                    placeholder="5 min"
                    value={formData.apgar5min}
                    onChangeText={(text) => updateFormData('apgar5min', text)}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={tw`bg-white p-4 rounded border border-gray-300 flex-1 mx-1`}
                    placeholder="10 min"
                    value={formData.apgar10min}
                    onChangeText={(text) => updateFormData('apgar10min', text)}
                    keyboardType="numeric"
                  />
                </View>
                
                <TextInput
                  style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
                  placeholder="Age at time of death (in days)"
                  value={formData.ageAtDeath}
                  onChangeText={(text) => updateFormData('ageAtDeath', text)}
                  keyboardType="numeric"
                />
              </>
            )}
            
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              placeholder="Birth weight (in grams)"
              value={formData.birthWeight}
              onChangeText={(text) => updateFormData('birthWeight', text)}
              keyboardType="numeric"
            />
            
            <Text style={tw`text-base font-semibold mb-2 text-gray-700`}>Sex of baby:</Text>
            <View style={tw`mb-4`}>
              {['Male', 'Female', 'Others'].map(option => (
                <TouchableOpacity 
                  key={option} 
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateFormData('sexOfBaby', option)}
                >
                  <View style={tw`h-5 w-5 rounded-full border-2 border-blue-500 items-center justify-center mr-2`}>
                    {formData.sexOfBaby === option && <View style={tw`h-3 w-3 rounded-full bg-blue-500`} />}
                  </View>
                  <Text style={tw`text-gray-800`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {formData.sexOfBaby === 'Others' && (
              <TextInput
                style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
                placeholder="Specify other sex"
                value={formData.otherSex}
                onChangeText={(text) => updateFormData('otherSex', text)}
              />
            )}
          </View>
        );
           case 2:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-800`}>2. Mother's details</Text>
            
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              placeholder="Age (in years)"
              value={formData.motherAge}
              onChangeText={(text) => updateFormData('motherAge', text)}
              keyboardType="numeric"
            />
            
            <Text style={tw`text-base font-semibold mb-2 text-gray-700`}>Married:</Text>
            <View style={tw`mb-4`}>
              {['Yes', 'No'].map(option => (
                <TouchableOpacity 
                  key={option} 
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateFormData('motherMarried', option)}
                >
                  <View style={tw`h-5 w-5 rounded-full border-2 border-blue-500 items-center justify-center mr-2`}>
                    {formData.motherMarried === option && <View style={tw`h-3 w-3 rounded-full bg-blue-500`} />}
                  </View>
                  <Text style={tw`text-gray-800`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              placeholder="Para +"
              value={formData.motherPara}
              onChangeText={(text) => updateFormData('motherPara', text)}
            />
            
            <Text style={tw`text-base font-semibold mb-2 text-gray-700`}>Mother's outcome:</Text>
            <View style={tw`mb-4`}>
              {['Alive', 'Dead', 'Not known'].map(option => (
                <TouchableOpacity 
                  key={option} 
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateFormData('motherOutcome', option)}
                >
                  <View style={tw`h-5 w-5 rounded-full border-2 border-blue-500 items-center justify-center mr-2`}>
                    {formData.motherOutcome === option && <View style={tw`h-3 w-3 rounded-full bg-blue-500`} />}
                  </View>
                  <Text style={tw`text-gray-800`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      case 3:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-800`}>3. Obstetric history and care during Pregnancy</Text>
            
            <Text style={tw`text-base font-semibold mb-2 text-gray-700`}>Type of pregnancy:</Text>
            <View style={tw`mb-4`}>
              {['Singleton', 'Multiple'].map(option => (
                <TouchableOpacity 
                  key={option} 
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateFormData('pregnancyType', option)}
                >
                  <View style={tw`h-5 w-5 rounded-full border-2 border-blue-500 items-center justify-center mr-2`}>
                    {formData.pregnancyType === option && <View style={tw`h-3 w-3 rounded-full bg-blue-500`} />}
                  </View>
                  <Text style={tw`text-gray-800`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={tw`text-base font-semibold mb-2 text-gray-700`}>Attendance of Antenatal care:</Text>
            <View style={tw`mb-4`}>
              {['Yes', 'No', 'Unknown'].map(option => (
                <TouchableOpacity 
                  key={option} 
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateFormData('antenatalCare', option)}
                >
                  <View style={tw`h-5 w-5 rounded-full border-2 border-blue-500 items-center justify-center mr-2`}>
                    {formData.antenatalCare === option && <View style={tw`h-3 w-3 rounded-full bg-blue-500`} />}
                  </View>
                  <Text style={tw`text-gray-800`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={tw`text-base font-semibold mb-2 text-gray-700`}>Obstetric/Medical conditions or infections in present pregnancy:</Text>
            {[
              'Antepartum Hemorrhage', 'Anemia', 'Hypertensive disease', 'Diabetes',
              'Pre-labor rupture of membranes', 'Malaria', 'History of trauma', 'UTI',
              'Preterm delivery', 'HIV', 'Post-term delivery', 'Prolonged/Obstructed Labour',
              'Chorioamnionitis', 'Unknown'
            ].map(condition => (
              <TouchableOpacity 
                key={condition} 
                style={tw`flex-row items-center mb-2`}
                onPress={() => toggleObstetricCondition(condition)}
              >
                <View style={tw`h-5 w-5 border-2 border-blue-500 rounded items-center justify-center mr-2`}>
                  {formData.obstetricConditions.includes(condition) && <Text style={tw`text-blue-500 font-bold`}>✓</Text>}
                </View>
                <Text style={tw`text-gray-800`}>{condition}</Text>
              </TouchableOpacity>
            ))}
            
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300 mt-2`}
              placeholder="Others (Specify)"
              value={formData.otherObstetric}
              onChangeText={(text) => updateFormData('otherObstetric', text)}
            />
          </View>
        );
      
      case 4:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-800`}>4. Care during delivery</Text>
            
            <Text style={tw`text-base font-semibold mb-2 text-gray-700`}>Place of delivery:</Text>
            <View style={tw`mb-4`}>
              {['Home', 'Facility', 'Others'].map(option => (
                <TouchableOpacity 
                  key={option} 
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateFormData('deliveryPlace', option)}
                >
                  <View style={tw`h-5 w-5 rounded-full border-2 border-blue-500 items-center justify-center mr-2`}>
                    {formData.deliveryPlace === option && <View style={tw`h-3 w-3 rounded-full bg-blue-500`} />}
                  </View>
                  <Text style={tw`text-gray-800`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {formData.deliveryPlace === 'Others' && (
              <TextInput
                style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
                placeholder="Specify other delivery place"
                value={formData.otherDeliveryPlace}
                onChangeText={(text) => updateFormData('otherDeliveryPlace', text)}
              />
            )}
            
            {formData.deliveryPlace === 'Facility' && (
              <TextInput
                style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
                placeholder="Level of care (2, 3, 4, 5, 6)"
                value={formData.facilityLevel}
                onChangeText={(text) => updateFormData('facilityLevel', text)}
                keyboardType="numeric"
              />
            )}
            
            <Text style={tw`text-base font-semibold mb-2 text-gray-700`}>Type of delivery:</Text>
            <View style={tw`mb-4`}>
              {[
                'SVD-Skilled', 'SVD-Unskilled', 'Assisted VD', 
                'Caesarian Section', 'Breech Delivery', 'Other'
              ].map(option => (
                <TouchableOpacity 
                  key={option} 
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateFormData('deliveryType', option)}
                >
                  <View style={tw`h-5 w-5 rounded-full border-2 border-blue-500 items-center justify-center mr-2`}>
                    {formData.deliveryType === option && <View style={tw`h-3 w-3 rounded-full bg-blue-500`} />}
                  </View>
                  <Text style={tw`text-gray-800`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {formData.deliveryType === 'Other' && (
              <TextInput
                style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
                placeholder="Specify other delivery type"
                value={formData.otherDeliveryType}
                onChangeText={(text) => updateFormData('otherDeliveryType', text)}
              />
            )}
          </View>
        );
      
      case 5:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-800`}>5. Cause of death</Text>
            
            <Text style={tw`text-base font-semibold mb-2 text-gray-700`}>Period of death:</Text>
            <View style={tw`mb-4`}>
              {['Antepartum', 'Intrapartum', 'Neonatal', 'Unknown'].map(option => (
                <TouchableOpacity 
                  key={option} 
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateFormData('periodOfDeath', option)}
                >
                  <View style={tw`h-5 w-5 rounded-full border-2 border-blue-500 items-center justify-center mr-2`}>
                    {formData.periodOfDeath === option && <View style={tw`h-3 w-3 rounded-full bg-blue-500`} />}
                  </View>
                  <Text style={tw`text-gray-800`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={tw`text-base font-semibold mb-2 text-gray-700`}>Perinatal cause of death:</Text>
            {[
              'Congenital malformations', 'Birth trauma', 'Birth Asphyxia', 'Infection',
              'Meconium aspiration', 'Low birth weight', 'Prematurity', 'Postmaturity',
              'Convulsions and disorders of cerebral status', 'Respiratory and cardiovascular disorders',
              'Unknown cause'
            ].map(cause => (
              <TouchableOpacity 
                key={cause} 
                style={tw`flex-row items-center mb-2`}
                onPress={() => togglePerinatalCause(cause)}
              >
                <View style={tw`h-5 w-5 border-2 border-blue-500 rounded items-center justify-center mr-2`}>
                  {formData.perinatalCause.includes(cause) && <Text style={tw`text-blue-500 font-bold`}>✓</Text>}
                </View>
                <Text style={tw`text-gray-800`}>{cause}</Text>
              </TouchableOpacity>
            ))}
            
            <Text style={tw`text-base font-semibold mb-2 text-gray-700 mt-4`}>Underlying maternal condition:</Text>
            <View style={tw`mb-4`}>
              {[
                'Complications of placenta, cord and membranes',
                'Maternal complications of Pregnancy',
                'Other complications of labour and delivery',
                'Maternal medical and surgical conditions',
                'No maternal condition Identified',
                'Others'
              ].map(option => (
                <TouchableOpacity 
                  key={option} 
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateFormData('maternalCondition', option)}
                >
                  <View style={tw`h-5 w-5 rounded-full border-2 border-blue-500 items-center justify-center mr-2`}>
                    {formData.maternalCondition === option && <View style={tw`h-3 w-3 rounded-full bg-blue-500`} />}
                  </View>
                  <Text style={tw`text-gray-800`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              placeholder="Others (Specify)"
              value={formData.otherCause}
              onChangeText={(text) => updateFormData('otherCause', text)}
            />
          </View>
        );
      
     
      case 6:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-800`}>Review All Information</Text>
            <ScrollView style={tw`mb-5 max-h-96`}>
    
              <Text style={tw`text-base font-bold mt-4 mb-2 text-gray-800`}>1. Details of Deceased baby</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Date of Death: {formData.dateOfDeath || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Time of Death: {formData.timeOfDeath || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Gestation Weeks: {formData.gestationWeeks || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Baby Outcome: {formData.babyOutcome || 'Not provided'}</Text>
              
              {formData.babyOutcome === 'Alive' && (
                <>
                  <Text style={tw`text-sm mb-1 text-gray-700`}>Apgar 1min: {formData.apgar1min || 'Not provided'}</Text>
                  <Text style={tw`text-sm mb-1 text-gray-700`}>Apgar 5min: {formData.apgar5min || 'Not provided'}</Text>
                  <Text style={tw`text-sm mb-1 text-gray-700`}>Apgar 10min: {formData.apgar10min || 'Not provided'}</Text>
                  <Text style={tw`text-sm mb-1 text-gray-700`}>Age at Death: {formData.ageAtDeath || 'Not provided'}</Text>
                </>
              )}
              
              <Text style={tw`text-sm mb-1 text-gray-700`}>Birth Weight: {formData.birthWeight || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Sex of Baby: {formData.sexOfBaby || 'Not provided'}</Text>
              {formData.sexOfBaby === 'Others' && (
                <Text style={tw`text-sm mb-1 text-gray-700`}>Other Sex: {formData.otherSex || 'Not provided'}</Text>
              )}
              
              <Text style={tw`text-base font-bold mt-4 mb-2 text-gray-800`}>2. Mother's details</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Mother's Age: {formData.motherAge || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Married: {formData.motherMarried || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Para: {formData.motherPara || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Mother's Outcome: {formData.motherOutcome || 'Not provided'}</Text>
              
              <Text style={tw`text-base font-bold mt-4 mb-2 text-gray-800`}>3. Obstetric history and care during Pregnancy</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Pregnancy Type: {formData.pregnancyType || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Antenatal Care: {formData.antenatalCare || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Obstetric Conditions: {formData.obstetricConditions.join(', ') || 'None'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Other Obstetric: {formData.otherObstetric || 'Not provided'}</Text>
              
              <Text style={tw`text-base font-bold mt-4 mb-2 text-gray-800`}>4. Care during delivery</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Delivery Place: {formData.deliveryPlace || 'Not provided'}</Text>
              {formData.deliveryPlace === 'Others' && (
                <Text style={tw`text-sm mb-1 text-gray-700`}>Other Delivery Place: {formData.otherDeliveryPlace || 'Not provided'}</Text>
              )}
              {formData.deliveryPlace === 'Facility' && (
                <Text style={tw`text-sm mb-1 text-gray-700`}>Facility Level: {formData.facilityLevel || 'Not provided'}</Text>
              )}
              <Text style={tw`text-sm mb-1 text-gray-700`}>Delivery Type: {formData.deliveryType || 'Not provided'}</Text>
              {formData.deliveryType === 'Other' && (
                <Text style={tw`text-sm mb-1 text-gray-700`}>Other Delivery Type: {formData.otherDeliveryType || 'Not provided'}</Text>
              )}
              
              <Text style={tw`text-base font-bold mt-4 mb-2 text-gray-700`}>5. Cause of death</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Period of D eath: {formData.periodOfDeath || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Perinatal Cause: {formData.perinatalCause.join(', ') || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Maternal Condition: {formData.maternalCondition || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Other Cause: {formData.otherCause || 'Not provided'}</Text>
          
            </ScrollView>
            
            <TouchableOpacity 
              style={tw`bg-green-300 p-4 rounded mb-3 items-center`}
              onPress={() => setCurrentScreen(1)}
            >
              <Text style={tw`text-white font-bold`}>Edit Information</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={tw`bg-purple-500 p-4 rounded items-center`}
              onPress={submitForm}
            >
              <Text style={tw`text-white font-bold`}>Submit</Text>
            </TouchableOpacity>
          </View>
        );
      
      default:
        return <Text>Invalid screen</Text>;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={tw`flex-1 bg-gray-100`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <HamburgerButton 
        onPress={() => setDrawerVisible(true)}
        position="absolute"
      />
      
      <View style={tw`flex-1`}>
        <ScrollView 
          contentContainerStyle={tw`p-5 pb-32 mt-16`} // Increased bottom padding
          showsVerticalScrollIndicator={true}
        >
          {renderScreen()}
        </ScrollView>

        {/* Navigation buttons fixed at the bottom */}
        {currentScreen < 6 && (
          <View style={tw`absolute bottom-5 left-5 right-5 flex-row justify-between`}>
            {currentScreen > 1 && (
              <TouchableOpacity 
                style={tw`bg-gray-500 p-4 rounded items-center flex-1 mr-2`}
                onPress={prevScreen}
              >
                <Text style={tw`text-white font-bold`}>Previous</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                tw`bg-purple-500 p-4 rounded items-center`,
                currentScreen === 1 ? tw`flex-1` : tw`flex-1 ml-2`
              ]}
              onPress={nextScreen}
            >
              <Text style={tw`text-white font-bold`}>
                {currentScreen === 5 ? 'Review' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

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
                  <Text style={tw`text-purple-700 font-medium ml-2`}>
                    <Text>🏠</Text> Dashboard
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                  onPress={() => {
                    setDrawerVisible(false);
                    router.push('/users');
                  }}
                >
                  <Text style={tw`text-gray-700 font-medium ml-2`}>
                    <Text>👥</Text> Users
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                  onPress={() => {
                    setDrawerVisible(false);
                    router.push('/patient_registration');
                  }}
                >
                  <Text style={tw`text-gray-700 font-medium ml-2`}>
                    <Text>📋</Text> Report Stillbirth
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
                  <Text style={tw`text-red-600 font-semibold`}>
                    <Text>🚪</Text> Logout
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default StillbirthRegistrationScreen;