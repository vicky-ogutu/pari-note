import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Define the form data type for stillbirth registration
type StillbirthFormData = {
  motherFirstName: string;
  motherLastName: string;
  motherAge: string;
  motherPhone: string;
  motherAddress: string;
  gestationWeeks: string;
  gestationDays: string;
  dateOfOccurrence: string;
  timeOfOccurrence: string;
  placeOfOccurrence: string;
  birthWeight: string;
  birthLength: string;
  gender: string;
  causeOfStillbirth: string;
  medicalHistory: string;
  notes: string;
};

const StillbirthRegistrationScreen = () => {
  const [formData, setFormData] = useState<StillbirthFormData>({
    motherFirstName: '',
    motherLastName: '',
    motherAge: '',
    motherPhone: '',
    motherAddress: '',
    gestationWeeks: '',
    gestationDays: '',
    dateOfOccurrence: '',
    timeOfOccurrence: '',
    placeOfOccurrence: '',
    birthWeight: '',
    birthLength: '',
    gender: '',
    causeOfStillbirth: '',
    medicalHistory: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields: (keyof StillbirthFormData)[] = [
      'motherFirstName', 
      'motherLastName', 
      'motherAge', 
      'gestationWeeks',
      'dateOfOccurrence',
      'gender'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Success',
        'Stillbirth occurrence registered successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form and navigate back
              setFormData({
                motherFirstName: '',
                motherLastName: '',
                motherAge: '',
                motherPhone: '',
                motherAddress: '',
                gestationWeeks: '',
                gestationDays: '',
                dateOfOccurrence: '',
                timeOfOccurrence: '',
                placeOfOccurrence: '',
                birthWeight: '',
                birthLength: '',
                gender: '',
                causeOfStillbirth: '',
                medicalHistory: '',
                notes: '',
              });
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to register stillbirth occurrence. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof StillbirthFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Record Stillbirth Occurrence</Text>
          <Text style={styles.subtitle}>Please fill in the required details</Text>
        </View>

        <View style={styles.form}>
          {/* Mother's Information */}
          <Text style={styles.sectionTitle}>Mother's Information</Text>
          
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="First Name *"
              value={formData.motherFirstName}
              onChangeText={text => updateFormData('motherFirstName', text)}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Last Name *"
              value={formData.motherLastName}
              onChangeText={text => updateFormData('motherLastName', text)}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Age *"
              value={formData.motherAge}
              onChangeText={text => updateFormData('motherAge', text)}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Phone Number"
              value={formData.motherPhone}
              onChangeText={text => updateFormData('motherPhone', text)}
              keyboardType="phone-pad"
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Address"
            value={formData.motherAddress}
            onChangeText={text => updateFormData('motherAddress', text)}
          />

          {/* Stillbirth Details */}
          <Text style={styles.sectionTitle}>Stillbirth Details</Text>
          
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Gestation (Weeks) *"
              value={formData.gestationWeeks}
              onChangeText={text => updateFormData('gestationWeeks', text)}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Gestation (Days)"
              value={formData.gestationDays}
              onChangeText={text => updateFormData('gestationDays', text)}
              keyboardType="numeric"
            />
          </View>

          
            <TextInput
              style={styles.input}
              placeholder="Date of Occurrence * (YYYY-MM-DD)"
              value={formData.dateOfOccurrence}
              onChangeText={text => updateFormData('dateOfOccurrence', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Time of Occurrence"
              value={formData.timeOfOccurrence}
              onChangeText={text => updateFormData('timeOfOccurrence', text)}
            />
          

          <TextInput
            style={styles.input}
            placeholder="Place of Occurrence"
            value={formData.placeOfOccurrence}
            onChangeText={text => updateFormData('placeOfOccurrence', text)}
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Birth Weight (grams)"
              value={formData.birthWeight}
              onChangeText={text => updateFormData('birthWeight', text)}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Birth Length (cm)"
              value={formData.birthLength}
              onChangeText={text => updateFormData('birthLength', text)}
              keyboardType="numeric"
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Gender *"
            value={formData.gender}
            onChangeText={text => updateFormData('gender', text)}
          />

          {/* Medical Information */}
          <Text style={styles.sectionTitle}>Medical Information</Text>
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Cause of Stillbirth"
            value={formData.causeOfStillbirth}
            onChangeText={text => updateFormData('causeOfStillbirth', text)}
            multiline
            numberOfLines={3}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mother's Medical History"
            value={formData.medicalHistory}
            onChangeText={text => updateFormData('medicalHistory', text)}
            multiline
            numberOfLines={3}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Additional Notes"
            value={formData.notes}
            onChangeText={text => updateFormData('notes', text)}
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Registering...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  form: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    fontSize: 14,
  },
  halfInput: {
    width: '48%',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StillbirthRegistrationScreen;