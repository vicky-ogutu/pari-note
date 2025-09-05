import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
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
  // Section 1: Locality
  county: string;
  subCounty: string;
  levelOfCare: string;
  managingAuthority: string;
  otherAuthority: string;
  
  // Section 2: Baby details
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
  
  // Section 3: Mother details
  motherAge: string;
  motherMarried: string;
  motherPara: string;
  motherOutcome: string;
  
  // Section 4: Obstetric history
  pregnancyType: string;
  antenatalCare: string;
  obstetricConditions: string[];
  otherObstetric: string;
  
  // Section 5: Delivery care
  deliveryPlace: string;
  otherDeliveryPlace: string;
  facilityLevel: string;
  deliveryType: string;
  otherDeliveryType: string;
  
  // Section 6: Cause of death
  periodOfDeath: string;
  perinatalCause: string[];
  maternalCondition: string;
  otherCause: string;
  
  // Section 7: Completed by
  completedByName: string;
  completedByDesignation: string;
  completedByPhone: string;
  completedByEmail: string;
  completedDate: string;
  completedSignature: string;
};

const initialFormData: FormData = {
  county: '',
  subCounty: '',
  levelOfCare: '',
  managingAuthority: '',
  otherAuthority: '',
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
  completedByName: '',
  completedByDesignation: '',
  completedByPhone: '',
  completedByEmail: '',
  completedDate: '',
  completedSignature: ''
};

const StillbirthRegistrationScreen = () => {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    if (currentScreen < 8) {
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
            <Text style={tw`text-lg font-bold mb-5 text-gray-800`}>1. Locality where death occurred</Text>
            
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              placeholder="County"
              value={formData.county}
              onChangeText={(text) => updateFormData('county', text)}
            />
            
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              placeholder="Sub-County"
              value={formData.subCounty}
              onChangeText={(text) => updateFormData('subCounty', text)}
            />
            
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              placeholder="Level of Care (2, 3, 4, 5, 6)"
              value={formData.levelOfCare}
              onChangeText={(text) => updateFormData('levelOfCare', text)}
              keyboardType="numeric"
            />
            
            <Text style={tw`text-base font-semibold mb-2 text-gray-700`}>Managing Authority:</Text>
            <View style={tw`mb-5`}>
              {['Public', 'NGO', 'FBO', 'Private', 'Others'].map(option => (
                <TouchableOpacity 
                  key={option} 
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateFormData('managingAuthority', option)}
                >
                  <View style={tw`h-5 w-5 rounded-full border-2 border-blue-500 items-center justify-center mr-2`}>
                    {formData.managingAuthority === option && <View style={tw`h-3 w-3 rounded-full bg-blue-500`} />}
                  </View>
                  <Text style={tw`text-gray-800`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {formData.managingAuthority === 'Others' && (
              <TextInput
                style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
                placeholder="Specify other authority"
                value={formData.otherAuthority}
                onChangeText={(text) => updateFormData('otherAuthority', text)}
              />
            )}
          </View>
        );
      
      case 2:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-800`}>2. Details of Deceased baby</Text>
            
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              placeholder="Date of death (dd/mm/yyyy)"
              value={formData.dateOfDeath}
              onChangeText={(text) => updateFormData('dateOfDeath', text)}
            />
            
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              placeholder="Time of death (HH:MM AM/PM)"
              value={formData.timeOfDeath}
              onChangeText={(text) => updateFormData('timeOfDeath', text)}
            />
            
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
      
      case 3:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-800`}>3. Mother's details</Text>
            
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
      
      case 4:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-800`}>4. Obstetric history and care during Pregnancy</Text>
            
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
      
      case 5:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-800`}>5. Care during delivery</Text>
            
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
      
      case 6:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-800`}>6. Cause of death</Text>
            
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
      
      case 7:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-800`}>7. Completed by</Text>
            
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              placeholder="Name"
              value={formData.completedByName}
              onChangeText={(text) => updateFormData('completedByName', text)}
            />
            
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              placeholder="Designation"
              value={formData.completedByDesignation}
              onChangeText={(text) => updateFormData('completedByDesignation', text)}
            />
            
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              placeholder="Telephone"
              value={formData.completedByPhone}
              onChangeText={(text) => updateFormData('completedByPhone', text)}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              placeholder="Email"
              value={formData.completedByEmail}
              onChangeText={(text) => updateFormData('completedByEmail', text)}
              keyboardType="email-address"
            />
            
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              placeholder="Date (dd/mm/yyyy)"
              value={formData.completedDate}
              onChangeText={(text) => updateFormData('completedDate', text)}
            />
            
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              placeholder="Signature"
              value={formData.completedSignature}
              onChangeText={(text) => updateFormData('completedSignature', text)}
            />
          </View>
        );
      
      case 8:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-800`}>Review All Information</Text>
            <ScrollView style={tw`mb-5 max-h-96`}>
              <Text style={tw`text-base font-bold mt-4 mb-2 text-gray-800`}>1. Locality where death occurred</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>County: {formData.county || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Sub-County: {formData.subCounty || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Level of Care: {formData.levelOfCare || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Managing Authority: {formData.managingAuthority || 'Not provided'}</Text>
              {formData.managingAuthority === 'Others' && (
                <Text style={tw`text-sm mb-1 text-gray-700`}>Other Authority: {formData.otherAuthority || 'Not provided'}</Text>
              )}
              
              <Text style={tw`text-base font-bold mt-4 mb-2 text-gray-800`}>2. Details of Deceased baby</Text>
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
              
              <Text style={tw`text-base font-bold mt-4 mb-2 text-gray-800`}>3. Mother's details</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Mother's Age: {formData.motherAge || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Married: {formData.motherMarried || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Para: {formData.motherPara || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Mother's Outcome: {formData.motherOutcome || 'Not provided'}</Text>
              
              <Text style={tw`text-base font-bold mt-4 mb-2 text-gray-800`}>4. Obstetric history and care during Pregnancy</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Pregnancy Type: {formData.pregnancyType || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Antenatal Care: {formData.antenatalCare || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Obstetric Conditions: {formData.obstetricConditions.join(', ') || 'None'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Other Obstetric: {formData.otherObstetric || 'Not provided'}</Text>
              
              <Text style={tw`text-base font-bold mt-4 mb-2 text-gray-800`}>5. Care during delivery</Text>
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
              
              <Text style={tw`text-base font-bold mt-4 mb-2 text-gray-800`}>6. Cause of death</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Period of Death: {formData.periodOfDeath || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Perinatal Cause: {formData.perinatalCause.join(', ') || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Maternal Condition: {formData.maternalCondition || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Other Cause: {formData.otherCause || 'Not provided'}</Text>
              
              <Text style={tw`text-base font-bold mt-4 mb-2 text-gray-800`}>7. Completed by</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Name: {formData.completedByName || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Designation: {formData.completedByDesignation || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Phone: {formData.completedByPhone || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Email: {formData.completedByEmail || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Date: {formData.completedDate || 'Not provided'}</Text>
              <Text style={tw`text-sm mb-1 text-gray-700`}>Signature: {formData.completedSignature || 'Not provided'}</Text>
            </ScrollView>
            
            <TouchableOpacity 
              style={tw`bg-yellow-500 p-4 rounded mb-3 items-center`}
              onPress={() => setCurrentScreen(1)}
            >
              <Text style={tw`text-white font-bold`}>Edit Information</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={tw`bg-green-500 p-4 rounded items-center`}
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
      <ScrollView contentContainerStyle={tw`p-5 pb-10 mt-4`}>
        {renderScreen()}
        
        {currentScreen < 8 && (
          <View style={tw`flex-row justify-between mt-5`}>
            {currentScreen > 1 && (
              <TouchableOpacity 
                style={tw`bg-gray-500 p-4 rounded items-center w-28`}
                onPress={prevScreen}
              >
                <Text style={tw`text-white font-bold`}>Previous</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={tw`bg-blue-500 p-4 rounded items-center w-28`}
              onPress={nextScreen}
            >
              <Text style={tw`text-white font-bold`}>
                {currentScreen === 7 ? 'Review' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default StillbirthRegistrationScreen;