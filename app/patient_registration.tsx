import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

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
          <View style={styles.screen}>
            <Text style={styles.screenTitle}>1. Locality where death occurred</Text>
            
            <TextInput
              style={styles.input}
              placeholder="County"
              value={formData.county}
              onChangeText={(text) => updateFormData('county', text)}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Sub-County"
              value={formData.subCounty}
              onChangeText={(text) => updateFormData('subCounty', text)}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Level of Care (2, 3, 4, 5, 6)"
              value={formData.levelOfCare}
              onChangeText={(text) => updateFormData('levelOfCare', text)}
              keyboardType="numeric"
            />
            
            <Text style={styles.label}>Managing Authority:</Text>
            <View style={styles.radioGroup}>
              {['Public', 'NGO', 'FBO', 'Private', 'Others'].map(option => (
                <TouchableOpacity 
                  key={option} 
                  style={styles.radioOption}
                  onPress={() => updateFormData('managingAuthority', option)}
                >
                  <View style={styles.radioCircle}>
                    {formData.managingAuthority === option && <View style={styles.radioChecked} />}
                  </View>
                  <Text style={styles.radioLabel}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {formData.managingAuthority === 'Others' && (
              <TextInput
                style={styles.input}
                placeholder="Specify other authority"
                value={formData.otherAuthority}
                onChangeText={(text) => updateFormData('otherAuthority', text)}
              />
            )}
          </View>
        );
      
      case 2:
        return (
          <View style={styles.screen}>
            <Text style={styles.screenTitle}>2. Details of Deceased baby</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Date of death (dd/mm/yyyy)"
              value={formData.dateOfDeath}
              onChangeText={(text) => updateFormData('dateOfDeath', text)}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Time of death (HH:MM AM/PM)"
              value={formData.timeOfDeath}
              onChangeText={(text) => updateFormData('timeOfDeath', text)}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Gestation at birth (in weeks)"
              value={formData.gestationWeeks}
              onChangeText={(text) => updateFormData('gestationWeeks', text)}
              keyboardType="numeric"
            />
            
            <Text style={styles.label}>Baby outcome:</Text>
            <View style={styles.radioGroup}>
              {['Alive', 'Fresh still-birth', 'Macerated still-birth'].map(option => (
                <TouchableOpacity 
                  key={option} 
                  style={styles.radioOption}
                  onPress={() => updateFormData('babyOutcome', option)}
                >
                  <View style={styles.radioCircle}>
                    {formData.babyOutcome === option && <View style={styles.radioChecked} />}
                  </View>
                  <Text style={styles.radioLabel}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {formData.babyOutcome === 'Alive' && (
              <>
                <Text style={styles.label}>Apgar score:</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.smallInput]}
                    placeholder="1 min"
                    value={formData.apgar1min}
                    onChangeText={(text) => updateFormData('apgar1min', text)}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.smallInput]}
                    placeholder="5 min"
                    value={formData.apgar5min}
                    onChangeText={(text) => updateFormData('apgar5min', text)}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.smallInput]}
                    placeholder="10 min"
                    value={formData.apgar10min}
                    onChangeText={(text) => updateFormData('apgar10min', text)}
                    keyboardType="numeric"
                  />
                </View>
                
                <TextInput
                  style={styles.input}
                  placeholder="Age at time of death (in days)"
                  value={formData.ageAtDeath}
                  onChangeText={(text) => updateFormData('ageAtDeath', text)}
                  keyboardType="numeric"
                />
              </>
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Birth weight (in grams)"
              value={formData.birthWeight}
              onChangeText={(text) => updateFormData('birthWeight', text)}
              keyboardType="numeric"
            />
            
            <Text style={styles.label}>Sex of baby:</Text>
            <View style={styles.radioGroup}>
              {['Male', 'Female', 'Others'].map(option => (
                <TouchableOpacity 
                  key={option} 
                  style={styles.radioOption}
                  onPress={() => updateFormData('sexOfBaby', option)}
                >
                  <View style={styles.radioCircle}>
                    {formData.sexOfBaby === option && <View style={styles.radioChecked} />}
                  </View>
                  <Text style={styles.radioLabel}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {formData.sexOfBaby === 'Others' && (
              <TextInput
                style={styles.input}
                placeholder="Specify other sex"
                value={formData.otherSex}
                onChangeText={(text) => updateFormData('otherSex', text)}
              />
            )}
          </View>
        );
      
      case 3:
        return (
          <View style={styles.screen}>
            <Text style={styles.screenTitle}>3. Mother's details</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Age (in years)"
              value={formData.motherAge}
              onChangeText={(text) => updateFormData('motherAge', text)}
              keyboardType="numeric"
            />
            
            <Text style={styles.label}>Married:</Text>
            <View style={styles.radioGroup}>
              {['Yes', 'No'].map(option => (
                <TouchableOpacity 
                  key={option} 
                  style={styles.radioOption}
                  onPress={() => updateFormData('motherMarried', option)}
                >
                  <View style={styles.radioCircle}>
                    {formData.motherMarried === option && <View style={styles.radioChecked} />}
                  </View>
                  <Text style={styles.radioLabel}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Para +"
              value={formData.motherPara}
              onChangeText={(text) => updateFormData('motherPara', text)}
            />
            
            <Text style={styles.label}>Mother's outcome:</Text>
            <View style={styles.radioGroup}>
              {['Alive', 'Dead', 'Not known'].map(option => (
                <TouchableOpacity 
                  key={option} 
                  style={styles.radioOption}
                  onPress={() => updateFormData('motherOutcome', option)}
                >
                  <View style={styles.radioCircle}>
                    {formData.motherOutcome === option && <View style={styles.radioChecked} />}
                  </View>
                  <Text style={styles.radioLabel}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      case 4:
        return (
          <View style={styles.screen}>
            <Text style={styles.screenTitle}>4. Obstetric history and care during Pregnancy</Text>
            
            <Text style={styles.label}>Type of pregnancy:</Text>
            <View style={styles.radioGroup}>
              {['Singleton', 'Multiple'].map(option => (
                <TouchableOpacity 
                  key={option} 
                  style={styles.radioOption}
                  onPress={() => updateFormData('pregnancyType', option)}
                >
                  <View style={styles.radioCircle}>
                    {formData.pregnancyType === option && <View style={styles.radioChecked} />}
                  </View>
                  <Text style={styles.radioLabel}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.label}>Attendance of Antenatal care:</Text>
            <View style={styles.radioGroup}>
              {['Yes', 'No', 'Unknown'].map(option => (
                <TouchableOpacity 
                  key={option} 
                  style={styles.radioOption}
                  onPress={() => updateFormData('antenatalCare', option)}
                >
                  <View style={styles.radioCircle}>
                    {formData.antenatalCare === option && <View style={styles.radioChecked} />}
                  </View>
                  <Text style={styles.radioLabel}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.label}>Obstetric/Medical conditions or infections in present pregnancy:</Text>
            {[
              'Antepartum Hemorrhage', 'Anemia', 'Hypertensive disease', 'Diabetes',
              'Pre-labor rupture of membranes', 'Malaria', 'History of trauma', 'UTI',
              'Preterm delivery', 'HIV', 'Post-term delivery', 'Prolonged/Obstructed Labour',
              'Chorioamnionitis', 'Unknown'
            ].map(condition => (
              <TouchableOpacity 
                key={condition} 
                style={styles.checkboxOption}
                onPress={() => toggleObstetricCondition(condition)}
              >
                <View style={styles.checkbox}>
                  {formData.obstetricConditions.includes(condition) && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>{condition}</Text>
              </TouchableOpacity>
            ))}
            
            <TextInput
              style={styles.input}
              placeholder="Others (Specify)"
              value={formData.otherObstetric}
              onChangeText={(text) => updateFormData('otherObstetric', text)}
            />
          </View>
        );
      
      case 5:
        return (
          <View style={styles.screen}>
            <Text style={styles.screenTitle}>5. Care during delivery</Text>
            
            <Text style={styles.label}>Place of delivery:</Text>
            <View style={styles.radioGroup}>
              {['Home', 'Facility', 'Others'].map(option => (
                <TouchableOpacity 
                  key={option} 
                  style={styles.radioOption}
                  onPress={() => updateFormData('deliveryPlace', option)}
                >
                  <View style={styles.radioCircle}>
                    {formData.deliveryPlace === option && <View style={styles.radioChecked} />}
                  </View>
                  <Text style={styles.radioLabel}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {formData.deliveryPlace === 'Others' && (
              <TextInput
                style={styles.input}
                placeholder="Specify other delivery place"
                value={formData.otherDeliveryPlace}
                onChangeText={(text) => updateFormData('otherDeliveryPlace', text)}
              />
            )}
            
            {formData.deliveryPlace === 'Facility' && (
              <TextInput
                style={styles.input}
                placeholder="Level of care (2, 3, 4, 5, 6)"
                value={formData.facilityLevel}
                onChangeText={(text) => updateFormData('facilityLevel', text)}
                keyboardType="numeric"
              />
            )}
            
            <Text style={styles.label}>Type of delivery:</Text>
            <View style={styles.radioGroup}>
              {[
                'SVD-Skilled', 'SVD-Unskilled', 'Assisted VD', 
                'Caesarian Section', 'Breech Delivery', 'Other'
              ].map(option => (
                <TouchableOpacity 
                  key={option} 
                  style={styles.radioOption}
                  onPress={() => updateFormData('deliveryType', option)}
                >
                  <View style={styles.radioCircle}>
                    {formData.deliveryType === option && <View style={styles.radioChecked} />}
                  </View>
                  <Text style={styles.radioLabel}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {formData.deliveryType === 'Other' && (
              <TextInput
                style={styles.input}
                placeholder="Specify other delivery type"
                value={formData.otherDeliveryType}
                onChangeText={(text) => updateFormData('otherDeliveryType', text)}
              />
            )}
          </View>
        );
      
      case 6:
        return (
          <View style={styles.screen}>
            <Text style={styles.screenTitle}>6. Cause of death</Text>
            
            <Text style={styles.label}>Period of death:</Text>
            <View style={styles.radioGroup}>
              {['Antepartum', 'Intrapartum', 'Neonatal', 'Unknown'].map(option => (
                <TouchableOpacity 
                  key={option} 
                  style={styles.radioOption}
                  onPress={() => updateFormData('periodOfDeath', option)}
                >
                  <View style={styles.radioCircle}>
                    {formData.periodOfDeath === option && <View style={styles.radioChecked} />}
                  </View>
                  <Text style={styles.radioLabel}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.label}>Perinatal cause of death:</Text>
            {[
              'Congenital malformations', 'Birth trauma', 'Birth Asphyxia', 'Infection',
              'Meconium aspiration', 'Low birth weight', 'Prematurity', 'Postmaturity',
              'Convulsions and disorders of cerebral status', 'Respiratory and cardiovascular disorders',
              'Unknown cause'
            ].map(cause => (
              <TouchableOpacity 
                key={cause} 
                style={styles.checkboxOption}
                onPress={() => togglePerinatalCause(cause)}
              >
                <View style={styles.checkbox}>
                  {formData.perinatalCause.includes(cause) && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>{cause}</Text>
              </TouchableOpacity>
            ))}
            
            <Text style={styles.label}>Underlying maternal condition:</Text>
            <View style={styles.radioGroup}>
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
                  style={styles.radioOption}
                  onPress={() => updateFormData('maternalCondition', option)}
                >
                  <View style={styles.radioCircle}>
                    {formData.maternalCondition === option && <View style={styles.radioChecked} />}
                  </View>
                  <Text style={styles.radioLabel}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Others (Specify)"
              value={formData.otherCause}
              onChangeText={(text) => updateFormData('otherCause', text)}
            />
          </View>
        );
      
      case 7:
        return (
          <View style={styles.screen}>
            <Text style={styles.screenTitle}>7. Completed by</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={formData.completedByName}
              onChangeText={(text) => updateFormData('completedByName', text)}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Designation"
              value={formData.completedByDesignation}
              onChangeText={(text) => updateFormData('completedByDesignation', text)}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Telephone"
              value={formData.completedByPhone}
              onChangeText={(text) => updateFormData('completedByPhone', text)}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.completedByEmail}
              onChangeText={(text) => updateFormData('completedByEmail', text)}
              keyboardType="email-address"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Date (dd/mm/yyyy)"
              value={formData.completedDate}
              onChangeText={(text) => updateFormData('completedDate', text)}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Signature"
              value={formData.completedSignature}
              onChangeText={(text) => updateFormData('completedSignature', text)}
            />
          </View>
        );
      
      case 8:
        return (
          <View style={styles.screen}>
            <Text style={styles.screenTitle}>Review All Information</Text>
            <ScrollView style={styles.reviewContainer}>
              <Text style={styles.reviewSectionTitle}>1. Locality where death occurred</Text>
              <Text style={styles.reviewText}>County: {formData.county || 'Not provided'}</Text>
              <Text style={styles.reviewText}>Sub-County: {formData.subCounty || 'Not provided'}</Text>
              <Text style={styles.reviewText}>Level of Care: {formData.levelOfCare || 'Not provided'}</Text>
              <Text style={styles.reviewText}>Managing Authority: {formData.managingAuthority || 'Not provided'}</Text>
              {formData.managingAuthority === 'Others' && (
                <Text style={styles.reviewText}>Other Authority: {formData.otherAuthority || 'Not provided'}</Text>
              )}
              
              <Text style={styles.reviewSectionTitle}>2. Details of Deceased baby</Text>
              <Text style={styles.reviewText}>Date of Death: {formData.dateOfDeath || 'Not provided'}</Text>
              <Text style={styles.reviewText}>Time of Death: {formData.timeOfDeath || 'Not provided'}</Text>
              <Text style={styles.reviewText}>Gestation Weeks: {formData.gestationWeeks || 'Not provided'}</Text>
              <Text style={styles.reviewText}>Baby Outcome: {formData.babyOutcome || 'Not provided'}</Text>
              
              {formData.babyOutcome === 'Alive' && (
                <>
                  <Text style={styles.reviewText}>Apgar 1min: {formData.apgar1min || 'Not provided'}</Text>
                  <Text style={styles.reviewText}>Apgar 5min: {formData.apgar5min || 'Not provided'}</Text>
                  <Text style={styles.reviewText}>Apgar 10min: {formData.apgar10min || 'Not provided'}</Text>
                  <Text style={styles.reviewText}>Age at Death: {formData.ageAtDeath || 'Not provided'}</Text>
                </>
              )}
              
              <Text style={styles.reviewText}>Birth Weight: {formData.birthWeight || 'Not provided'}</Text>
              <Text style={styles.reviewText}>Sex of Baby: {formData.sexOfBaby || 'Not provided'}</Text>
              {formData.sexOfBaby === 'Others' && (
                <Text style={styles.reviewText}>Other Sex: {formData.otherSex || 'Not provided'}</Text>
              )}
              
              <Text style={styles.reviewSectionTitle}>3. Mother's details</Text>
              <Text style={styles.reviewText}>Mother's Age: {formData.motherAge || 'Not provided'}</Text>
              <Text style={styles.reviewText}>Married: {formData.motherMarried || 'Not provided'}</Text>
              <Text style={styles.reviewText}>Para: {formData.motherPara || 'Not provided'}</Text>
              <Text style={styles.reviewText}>Mother's Outcome: {formData.motherOutcome || 'Not provided'}</Text>
              
              <Text style={styles.reviewSectionTitle}>4. Obstetric history and care during Pregnancy</Text>
              <Text style={styles.reviewText}>Pregnancy Type: {formData.pregnancyType || 'Not provided'}</Text>
              <Text style={styles.reviewText}>Antenatal Care: {formData.antenatalCare || 'Not provided'}</Text>
              <Text style={styles.reviewText}>Obstetric Conditions: {formData.obstetricConditions.join(', ') || 'None'}</Text>
              <Text style={styles.reviewText}>Other Obstetric: {formData.otherObstetric || 'Not provided'}</Text>
              
              <Text style={styles.reviewSectionTitle}>5. Care during delivery</Text>
              <Text style={styles.reviewText}>Delivery Place: {formData.deliveryPlace || 'Not provided'}</Text>
              {formData.deliveryPlace === 'Others' && (
                <Text style={styles.reviewText}>Other Delivery Place: {formData.otherDeliveryPlace || 'Not provided'}</Text>
              )}
              {formData.deliveryPlace === 'Facility' && (
                <Text style={styles.reviewText}>Facility Level: {formData.facilityLevel || 'Not provided'}</Text>
              )}
              <Text style={styles.reviewText}>Delivery Type: {formData.deliveryType || 'Not provided'}</Text>
              {formData.deliveryType === 'Other' && (
                <Text style={styles.reviewText}>Other Delivery Type: {formData.otherDeliveryType || 'Not provided'}</Text>
              )}
              
              <Text style={styles.reviewSectionTitle}>6. Cause of death</Text>
              <Text style={styles.reviewText}>Period of Death: {formData.periodOfDeath || 'Not provided'}</Text>
              <Text style={styles.reviewText}>Perinatal Cause: {formData.perinatalCause.join(', ') || 'Not provided'}</Text>
              <Text style={styles.reviewText}>Maternal Condition: {formData.maternalCondition || 'Not provided'}</Text>
              <Text style={styles.reviewText}>Other Cause: {formData.otherCause || 'Not provided'}</Text>
              
              <Text style={styles.reviewSectionTitle}>7. Completed by</Text>
              <Text style={styles.reviewText}>Name: {formData.completedByName || 'Not provided'}</Text>
              <Text style={styles.reviewText}>Designation: {formData.completedByDesignation || 'Not provided'}</Text>
              <Text style={styles.reviewText}>Phone: {formData.completedByPhone || 'Not provided'}</Text>
              <Text style={styles.reviewText}>Email: {formData.completedByEmail || 'Not provided'}</Text>
              <Text style={styles.reviewText}>Date: {formData.completedDate || 'Not provided'}</Text>
              <Text style={styles.reviewText}>Signature: {formData.completedSignature || 'Not provided'}</Text>
            </ScrollView>
            
            <TouchableOpacity 
              style={[styles.navButton, styles.editButton]}
              onPress={() => setCurrentScreen(1)}
            >
              <Text style={styles.navButtonText}>Edit Information</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.navButton, styles.submitButton]}
              onPress={submitForm}
            >
              <Text style={styles.navButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        );
      
      default:
        return <Text>Invalid screen</Text>;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderScreen()}
        
        {currentScreen < 8 && (
          <View style={styles.navigation}>
            {currentScreen > 1 && (
              <TouchableOpacity 
                style={[styles.navButton, styles.prevButton]}
                onPress={prevScreen}
              >
                <Text style={styles.navButtonText}>Previous</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.navButton, styles.nextButton]}
              onPress={nextScreen}
            >
              <Text style={styles.navButtonText}>
                {currentScreen === 7 ? 'Review' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  screen: {
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  smallInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  radioGroup: {
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioCircle: {
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioChecked: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    height: 22,
    width: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkmark: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  prevButton: {
    backgroundColor: '#8E8E93',
  },
  nextButton: {
    backgroundColor: '#007AFF',
  },
  editButton: {
    backgroundColor: '#FF9500',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#34C759',
  },
  navButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reviewContainer: {
    marginBottom: 20,
    maxHeight: 400,
  },
  reviewSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#333',
  },
  reviewText: {
    fontSize: 14,
    marginBottom: 3,
    color: '#555',
  },
});

export default StillbirthRegistrationScreen;