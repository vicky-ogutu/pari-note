import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomDrawer from "../components/CustomDrawer";
import HamburgerButton from "../components/HamburgerButton";
import { BASE_URL } from "../constants/ApiConfig";

import { FilePenIcon } from "lucide-react-native";
import tw from "tailwind-react-native-classnames";

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
  dateOfDeath: "",
  timeOfDeath: "",
  gestationWeeks: "",
  babyOutcome: "",
  apgar1min: "",
  apgar5min: "",
  apgar10min: "",
  ageAtDeath: "",
  birthWeight: "",
  sexOfBaby: "",
  otherSex: "",
  motherAge: "",
  motherMarried: "",
  motherPara: "",
  motherOutcome: "",
  pregnancyType: "",
  antenatalCare: "",
  obstetricConditions: [],
  otherObstetric: "",
  deliveryPlace: "",
  otherDeliveryPlace: "",
  facilityLevel: "",
  deliveryType: "",
  otherDeliveryType: "",
  periodOfDeath: "",
  perinatalCause: [],
  maternalCondition: "",
  otherCause: "",
};

const StillbirthRegistrationScreen = () => {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const getUserRole = async () => {
      const role = await AsyncStorage.getItem("role");
      setUserRole(role || "");
    };
    getUserRole();
  }, []);

  //const accessToken = AsyncStorage.getItem("access_token");

  //clear authentication tokens
  const clearAuthTokens = async () => {
    try {
      await AsyncStorage.multiRemove([
        "access_token",
        "role",
        "role_id",
        "user_id",
        "user_name",
        "user_email",
        "location_id",
        "location_name",
        "location_type",
        "permissions",
      ]);
    } catch (error) {
      console.error("Error clearing auth tokens:", error);
    }
  };
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => {
          clearAuthTokens();
          router.replace("/login");
        },
        style: "destructive",
      },
    ]);
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // const formatDate = (date: Date) => {
  //   return date.toLocaleDateString("en-GB"); // dd/mm/yyyy
  // };

  const formatDate = (date: Date) => {
    // Return YYYY-MM-DD
    return date.toISOString().split("T")[0];
  };

  // const formatTime = (date: Date) => {
  //   return date.toLocaleTimeString("en-US", {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   }); // HH:MM AM/PM
  // };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // ensures 24-hour format
    });
  };

  const toggleObstetricCondition = (condition: string) => {
    const currentConditions = [...formData.obstetricConditions];
    const index = currentConditions.indexOf(condition);

    if (index > -1) {
      currentConditions.splice(index, 1);
    } else {
      currentConditions.push(condition);
    }

    updateFormData("obstetricConditions", currentConditions);
  };

  const togglePerinatalCause = (cause: string) => {
    const currentCauses = [...formData.perinatalCause];
    const index = currentCauses.indexOf(cause);

    if (index > -1) {
      currentCauses.splice(index, 1);
    } else {
      currentCauses.push(cause);
    }

    updateFormData("perinatalCause", currentCauses);
  };

  const validateCurrentScreen = () => {
    switch (currentScreen) {
      case 1:
        return (
          formData.dateOfDeath &&
          formData.timeOfDeath &&
          formData.gestationWeeks &&
          formData.babyOutcome &&
          formData.birthWeight &&
          formData.sexOfBaby &&
          (formData.sexOfBaby !== "Others" || formData.otherSex) &&
          (formData.babyOutcome !== "Alive" ||
            (formData.apgar1min &&
              formData.apgar5min &&
              formData.apgar10min &&
              formData.ageAtDeath))
        );
      case 2:
        return (
          formData.motherAge &&
          formData.motherMarried &&
          formData.motherPara &&
          formData.motherOutcome
        );
      case 3:
        return (
          formData.pregnancyType &&
          formData.antenatalCare &&
          (formData.obstetricConditions.length > 0 || formData.otherObstetric)
        );
      case 4:
        return (
          formData.deliveryPlace &&
          (formData.deliveryPlace !== "Others" ||
            formData.otherDeliveryPlace) &&
          (formData.deliveryPlace !== "Facility" || formData.facilityLevel) &&
          formData.deliveryType &&
          (formData.deliveryType !== "Other" || formData.otherDeliveryType)
        );
      case 5:
        return (
          formData.periodOfDeath &&
          (formData.perinatalCause.length > 0 ||
            formData.maternalCondition ||
            formData.otherCause)
        );
      default:
        return true;
    }
  };

  const nextScreen = () => {
    // if (currentScreen < 6) {
    //   setCurrentScreen(currentScreen + 1);
    // }
    if (!validateCurrentScreen()) {
      Alert.alert(
        "Missing information",
        "Please fill in all required fields (*) before proceeding."
      );
      return;
    }
    if (currentScreen < 6) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const prevScreen = () => {
    if (currentScreen > 1) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  // const submitForm = () => {
  //   Alert.alert("Success", "Stillbirth registration submitted successfully!", [
  //     { text: "OK", onPress: () => console.log("Form submitted", formData) },
  //   ]);
  // };
  const submitForm = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const locationName = await AsyncStorage.getItem("location_name");
      const locationId = await AsyncStorage.getItem("location_id");
      const locationType = await AsyncStorage.getItem("location_type");

      console.log("Access Token:", accessToken);
      console.log("Location:", locationName);

      if (!accessToken) {
        throw new Error("User not logged in");
      }

      // Build the payload according to your API contract
      const payload = {
        // facilityName: locationName || "Unknown Facility",
        // mflCode: locationId || "00000",
        // dateOfNotification: new Date().toISOString().split("T")[0],
        // locality: locationType === "subcounty" ? locationName : "",
        // county: locationType === "county" ? locationName : "Unknown County",
        // subCounty: locationType === "subcounty" ? locationName : "",
        // levelOfCare: formData.facilityLevel || "Level 6",
        // managingAuthority: "MOH",

        locationId: locationId ? parseInt(locationId) : null, // Must be integer
        dateOfNotification: new Date().toISOString().split("T")[0],

        mother: {
          age: parseInt(formData.motherAge) || null,
          married: formData.motherMarried === "Yes",
          parity: formData.motherPara,
          outcome: formData.motherOutcome,
          typeOfPregnancy: formData.pregnancyType,
          attendedAntenatal: formData.antenatalCare,
          placeOfDelivery: formData.deliveryPlace,
          typeOfDelivery: formData.deliveryType,
          periodOfDeath: formData.periodOfDeath,
          perinatalCause: formData.perinatalCause.join(", "),
          maternalCondition: formData.maternalCondition,
          conditions: formData.obstetricConditions,
        },

        babies: [
          {
            dateOfDeath: formData.dateOfDeath,
            timeOfDeath: formData.timeOfDeath,
            gestationWeeks: parseInt(formData.gestationWeeks) || null,
            outcome: formData.babyOutcome,
            apgarScore1min: formData.apgar1min,
            apgarScore5min: formData.apgar5min,
            apgarScore10min: formData.apgar10min,
            ageAtDeathDays: parseInt(formData.ageAtDeath) || 0,
            birthWeight: parseInt(formData.birthWeight) || null,
            sex:
              formData.sexOfBaby === "Others"
                ? formData.otherSex
                : formData.sexOfBaby,
          },
        ],
      };

      console.log("Submitting payload:", payload);
      //const response = await fetch(`${BASE_URL}/auth/login`, {

      const response = await fetch(`${BASE_URL}/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "Failed to submit form");
      }

      const data = await response.json();
      Alert.alert("Success", "Stillbirth registration submitted successfully!");
      console.log("Server response:", data);

      // Optionally reset form
      setFormData(initialFormData);
      setCurrentScreen(1);
    } catch (error: any) {
      console.error("Error submitting form:", error);
      Alert.alert("Error", error.message || "Something went wrong");
    }
  };

  const RequiredAsterisk = () => <Text style={tw`text-red-500`}>*</Text>;

  const renderScreen = () => {
    switch (currentScreen) {
      case 1:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-500`}>
              1. Details of Deceased baby <RequiredAsterisk />
            </Text>

            {/* Date Picker Field */}
            <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
              Date of death <RequiredAsterisk />
            </Text>
            <TouchableOpacity
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{formData.dateOfDeath || "Select date (yyyy/mm/dd)"}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    // Store as ISO string instead of formatted string
                    updateFormData("dateOfDeath", formatDate(selectedDate));
                  }
                }}
              />
            )}

            {/* Time Picker Field */}
            <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
              Time of death <RequiredAsterisk />
            </Text>
            <TouchableOpacity
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              onPress={() => setShowTimePicker(true)}
            >
              <Text>{formData.timeOfDeath || "Select time (HH:MM)"}</Text>
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

            <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
              Gestation at birth (in weeks) <RequiredAsterisk />
            </Text>
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              placeholder="Enter gestation in weeks"
              value={formData.gestationWeeks}
              onChangeText={(text) => updateFormData("gestationWeeks", text)}
              keyboardType="numeric"
            />

            <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
              Baby outcome: <RequiredAsterisk />
            </Text>
            <View style={tw`mb-4`}>
              {["Alive", "fresh stillbirth", "macerated stillbirth"].map(
                (option) => (
                  <TouchableOpacity
                    key={option}
                    style={tw`flex-row items-center mb-2`}
                    onPress={() => updateFormData("babyOutcome", option)}
                  >
                    <View
                      style={tw`h-5 w-5 rounded-full border-2 border-purple-500 items-center justify-center mr-2`}
                    >
                      {formData.babyOutcome === option && (
                        <View style={tw`h-3 w-3 rounded-full bg-purple-500`} />
                      )}
                    </View>
                    <Text style={tw`text-gray-500`}>{option}</Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            {formData.babyOutcome === "Alive" && (
              <>
                <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
                  Apgar score: <RequiredAsterisk />
                </Text>
                <View style={tw`flex-row justify-between mb-4`}>
                  <View style={tw`flex-1 mx-1`}>
                    <Text style={tw`text-sm font-semibold mb-1 text-gray-500`}>
                      1 min
                    </Text>
                    <TextInput
                      style={tw`bg-white p-4 rounded border border-gray-300`}
                      placeholder="Score"
                      value={formData.apgar1min}
                      onChangeText={(text) => updateFormData("apgar1min", text)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={tw`flex-1 mx-1`}>
                    <Text style={tw`text-sm font-semibold mb-1 text-gray-500`}>
                      5 min
                    </Text>
                    <TextInput
                      style={tw`bg-white p-4 rounded border border-gray-300`}
                      placeholder="Score"
                      value={formData.apgar5min}
                      onChangeText={(text) => updateFormData("apgar5min", text)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={tw`flex-1 mx-1`}>
                    <Text style={tw`text-sm font-semibold mb-1 text-gray-500`}>
                      10 min
                    </Text>
                    <TextInput
                      style={tw`bg-white p-4 rounded border border-gray-300`}
                      placeholder="Score"
                      value={formData.apgar10min}
                      onChangeText={(text) =>
                        updateFormData("apgar10min", text)
                      }
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
                  Age at time of death (in days) <RequiredAsterisk />
                </Text>
                <TextInput
                  style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
                  placeholder="Enter age in days"
                  value={formData.ageAtDeath}
                  onChangeText={(text) => updateFormData("ageAtDeath", text)}
                  keyboardType="numeric"
                />
              </>
            )}

            <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
              Birth weight (in grams) <RequiredAsterisk />
            </Text>
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              placeholder="Enter birth weight in grams"
              value={formData.birthWeight}
              onChangeText={(text) => updateFormData("birthWeight", text)}
              keyboardType="numeric"
            />

            <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
              Sex of baby: <RequiredAsterisk />
            </Text>
            <View style={tw`mb-4`}>
              {["Male", "Female", "Others"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateFormData("sexOfBaby", option)}
                >
                  <View
                    style={tw`h-5 w-5 rounded-full border-2 border-purple-500 items-center justify-center mr-2`}
                  >
                    {formData.sexOfBaby === option && (
                      <View style={tw`h-3 w-3 rounded-full bg-purple-500`} />
                    )}
                  </View>
                  <Text style={tw`text-gray-500`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {formData.sexOfBaby === "Others" && (
              <>
                <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
                  Specify other sex <RequiredAsterisk />
                </Text>
                <TextInput
                  style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
                  placeholder="Enter specification"
                  value={formData.otherSex}
                  onChangeText={(text) => updateFormData("otherSex", text)}
                />
              </>
            )}
          </View>
        );
      case 2:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-500`}>
              2. Mother's details <RequiredAsterisk />
            </Text>

            <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
              Age (in years) <RequiredAsterisk />
            </Text>
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              placeholder="Enter mother's age"
              value={formData.motherAge}
              onChangeText={(text) => updateFormData("motherAge", text)}
              keyboardType="numeric"
            />

            <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
              Married: <RequiredAsterisk />
            </Text>
            <View style={tw`mb-4`}>
              {["Yes", "No"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateFormData("motherMarried", option)}
                >
                  <View
                    style={tw`h-5 w-5 rounded-full border-2 border-purple-500 items-center justify-center mr-2`}
                  >
                    {formData.motherMarried === option && (
                      <View style={tw`h-3 w-3 rounded-full bg-purple-500`} />
                    )}
                  </View>
                  <Text style={tw`text-gray-500`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
              Para + <RequiredAsterisk />
            </Text>
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              placeholder="Enter para information"
              value={formData.motherPara}
              onChangeText={(text) => updateFormData("motherPara", text)}
            />

            <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
              Mother's outcome: <RequiredAsterisk />
            </Text>
            <View style={tw`mb-4`}>
              {["Alive", "Dead", "Not known"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateFormData("motherOutcome", option)}
                >
                  <View
                    style={tw`h-5 w-5 rounded-full border-2 border-purple-500 items-center justify-center mr-2`}
                  >
                    {formData.motherOutcome === option && (
                      <View style={tw`h-3 w-3 rounded-full bg-purple-500`} />
                    )}
                  </View>
                  <Text style={tw`text-gray-500`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-500`}>
              3. Obstetric history and care during Pregnancy{" "}
              <RequiredAsterisk />
            </Text>

            <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
              Type of pregnancy: <RequiredAsterisk />
            </Text>
            <View style={tw`mb-4`}>
              {["Singleton", "Multiple"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateFormData("pregnancyType", option)}
                >
                  <View
                    style={tw`h-5 w-5 rounded-full border-2 border-purple-500 items-center justify-center mr-2`}
                  >
                    {formData.pregnancyType === option && (
                      <View style={tw`h-3 w-3 rounded-full bg-purple-500`} />
                    )}
                  </View>
                  <Text style={tw`text-gray-500`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
              Attendance of Antenatal care: <RequiredAsterisk />
            </Text>
            <View style={tw`mb-4`}>
              {["Yes", "No", "Unknown"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateFormData("antenatalCare", option)}
                >
                  <View
                    style={tw`h-5 w-5 rounded-full border-2 border-purple-500 items-center justify-center mr-2`}
                  >
                    {formData.antenatalCare === option && (
                      <View style={tw`h-3 w-3 rounded-full bg-purple-500`} />
                    )}
                  </View>
                  <Text style={tw`text-gray-500`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
              Obstetric/Medical conditions or infections in present pregnancy:{" "}
              <RequiredAsterisk />
            </Text>
            {[
              "Antepartum Hemorrhage",
              "Anemia",
              "Hypertensive disease",
              "Diabetes",
              "Pre-labor rupture of membranes",
              "Malaria",
              "History of trauma",
              "UTI",
              "Preterm delivery",
              "HIV",
              "Post-term delivery",
              "Prolonged/Obstructed Labour",
              "Chorioamnionitis",
              "Unknown",
            ].map((condition) => (
              <TouchableOpacity
                key={condition}
                style={tw`flex-row items-center mb-2`}
                onPress={() => toggleObstetricCondition(condition)}
              >
                <View
                  style={tw`h-5 w-5 border-2 border-purple-500 rounded items-center justify-center mr-2`}
                >
                  {formData.obstetricConditions.includes(condition) && (
                    <Text style={tw`text-purple-500 font-bold`}>✓</Text>
                  )}
                </View>
                <Text style={tw`text-gray-500`}>{condition}</Text>
              </TouchableOpacity>
            ))}

            <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
              Others (Specify) <RequiredAsterisk />
            </Text>
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300 mt-2`}
              placeholder="Enter other conditions"
              value={formData.otherObstetric}
              onChangeText={(text) => updateFormData("otherObstetric", text)}
            />
          </View>
        );

      case 4:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-500`}>
              4. Care during delivery <RequiredAsterisk />
            </Text>

            <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
              Place of delivery: <RequiredAsterisk />
            </Text>
            <View style={tw`mb-4`}>
              {["Home", "Facility", "Others"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateFormData("deliveryPlace", option)}
                >
                  <View
                    style={tw`h-5 w-5 rounded-full border-2 border-purple-500 items-center justify-center mr-2`}
                  >
                    {formData.deliveryPlace === option && (
                      <View style={tw`h-3 w-3 rounded-full bg-purple-500`} />
                    )}
                  </View>
                  <Text style={tw`text-gray-500`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {formData.deliveryPlace === "Others" && (
              <>
                <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
                  Specify other delivery place <RequiredAsterisk />
                </Text>
                <TextInput
                  style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
                  placeholder="Enter delivery place"
                  value={formData.otherDeliveryPlace}
                  onChangeText={(text) =>
                    updateFormData("otherDeliveryPlace", text)
                  }
                />
              </>
            )}

            {formData.deliveryPlace === "Facility" && (
              <>
                <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
                  Level of care (2, 3, 4, 5, 6) <RequiredAsterisk />
                </Text>
                <TextInput
                  style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
                  placeholder="Enter level of care"
                  value={formData.facilityLevel}
                  onChangeText={(text) => updateFormData("facilityLevel", text)}
                  keyboardType="numeric"
                />
              </>
            )}

            <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
              Type of delivery: <RequiredAsterisk />
            </Text>
            <View style={tw`mb-4`}>
              {[
                "SVD-Skilled",
                "SVD-Unskilled",
                "Assisted VD",
                "Caesarian Section",
                "Breech Delivery",
                "Other",
              ].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateFormData("deliveryType", option)}
                >
                  <View
                    style={tw`h-5 w-5 rounded-full border-2 border-purple-500 items-center justify-center mr-2`}
                  >
                    {formData.deliveryType === option && (
                      <View style={tw`h-3 w-3 rounded-full bg-purple-500`} />
                    )}
                  </View>
                  <Text style={tw`text-gray-500`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {formData.deliveryType === "Other" && (
              <>
                <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
                  Specify other delivery type <RequiredAsterisk />
                </Text>
                <TextInput
                  style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
                  placeholder="Enter delivery type"
                  value={formData.otherDeliveryType}
                  onChangeText={(text) =>
                    updateFormData("otherDeliveryType", text)
                  }
                />
              </>
            )}
          </View>
        );

      case 5:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-500`}>
              5. Cause of death <RequiredAsterisk />
            </Text>

            <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
              Period of death: <RequiredAsterisk />
            </Text>
            <View style={tw`mb-4`}>
              {["Antepartum", "Intrapartum", "Neonatal", "Unknown"].map(
                (option) => (
                  <TouchableOpacity
                    key={option}
                    style={tw`flex-row items-center mb-2`}
                    onPress={() => updateFormData("periodOfDeath", option)}
                  >
                    <View
                      style={tw`h-5 w-5 rounded-full border-2 border-purple-500 items-center justify-center mr-2`}
                    >
                      {formData.periodOfDeath === option && (
                        <View style={tw`h-3 w-3 rounded-full bg-purple-500`} />
                      )}
                    </View>
                    <Text style={tw`text-gray-500`}>{option}</Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
              Perinatal cause of death: <RequiredAsterisk />
            </Text>
            {[
              "Congenital malformations",
              "Birth trauma",
              "Birth Asphyxia",
              "Infection",
              "Meconium aspiration",
              "Low birth weight",
              "Prematurity",
              "Postmaturity",
              "Convulsions and disorders of cerebral status",
              "Respiratory and cardiovascular disorders",
              "Unknown cause",
            ].map((cause) => (
              <TouchableOpacity
                key={cause}
                style={tw`flex-row items-center mb-2`}
                onPress={() => togglePerinatalCause(cause)}
              >
                <View
                  style={tw`h-5 w-5 border-2 border-purple-500 rounded items-center justify-center mr-2`}
                >
                  {formData.perinatalCause.includes(cause) && (
                    <Text style={tw`text-purple-500 font-bold`}>✓</Text>
                  )}
                </View>
                <Text style={tw`text-gray-500`}>{cause}</Text>
              </TouchableOpacity>
            ))}

            <Text style={tw`text-base font-semibold mb-2 text-gray-500 mt-4`}>
              Underlying maternal condition: <RequiredAsterisk />
            </Text>
            <View style={tw`mb-4`}>
              {[
                "Complications of placenta, cord and membranes",
                "Maternal complications of Pregnancy",
                "Other complications of labour and delivery",
                "Maternal medical and surgical conditions",
                "No maternal condition Identified",
                "Others",
              ].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateFormData("maternalCondition", option)}
                >
                  <View
                    style={tw`h-5 w-5 rounded-full border-2 border-purple-500 items-center justify-center mr-2`}
                  >
                    {formData.maternalCondition === option && (
                      <View style={tw`h-3 w-3 rounded-full bg-purple-500`} />
                    )}
                  </View>
                  <Text style={tw`text-gray-500`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={tw`text-base font-semibold mb-2 text-gray-500`}>
              Others (Specify) <RequiredAsterisk />
            </Text>
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
              placeholder="Enter other causes"
              value={formData.otherCause}
              onChangeText={(text) => updateFormData("otherCause", text)}
            />
          </View>
        );

      case 6:
        return (
          <View style={tw`flex-1 mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-500`}>
              Review All Information <RequiredAsterisk />
            </Text>

            <Text style={tw`text-base font-bold mt-4 mb-2 text-gray-500`}>
              1. Details of Deceased baby <RequiredAsterisk />
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-500`}>
              Date of Death: {formData.dateOfDeath || "Not provided"}
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-500`}>
              Time of Death: {formData.timeOfDeath || "Not provided"}
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-500`}>
              Gestation Weeks: {formData.gestationWeeks || "Not provided"}
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-500`}>
              Baby Outcome: {formData.babyOutcome || "Not provided"}
            </Text>

            {formData.babyOutcome === "Alive" && (
              <>
                <Text style={tw`text-sm mb-1 text-gray-500`}>
                  Apgar 1min: {formData.apgar1min || "Not provided"}
                </Text>
                <Text style={tw`text-sm mb-1 text-gray-500`}>
                  Apgar 5min: {formData.apgar5min || "Not provided"}
                </Text>
                <Text style={tw`text-sm mb-1 text-gray-500`}>
                  Apgar 10min: {formData.apgar10min || "Not provided"}
                </Text>
                <Text style={tw`text-sm mb-1 text-gray-500`}>
                  Age at Death: {formData.ageAtDeath || "Not provided"}
                </Text>
              </>
            )}

            <Text style={tw`text-sm mb-1 text-gray-500`}>
              Birth Weight: {formData.birthWeight || "Not provided"}
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-500`}>
              Sex of Baby: {formData.sexOfBaby || "Not provided"}
            </Text>
            {formData.sexOfBaby === "Others" && (
              <Text style={tw`text-sm mb-1 text-gray-500`}>
                Other Sex: {formData.otherSex || "Not provided"}
              </Text>
            )}

            <Text style={tw`text-base font-bold mt-4 mb-2 text-gray-500`}>
              2. Mother's details <RequiredAsterisk />
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-500`}>
              Mother's Age: {formData.motherAge || "Not provided"}
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-500`}>
              Married: {formData.motherMarried || "Not provided"}
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-500`}>
              Para: {formData.motherPara || "Not provided"}
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-500`}>
              Mother's Outcome: {formData.motherOutcome || "Not provided"}
            </Text>

            <Text style={tw`text-base font-bold mt-4 mb-2 text-gray-500`}>
              3. Obstetric history and care during Pregnancy{" "}
              <RequiredAsterisk />
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-500`}>
              Pregnancy Type: {formData.pregnancyType || "Not provided"}
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-500`}>
              Antenatal Care: {formData.antenatalCare || "Not provided"}
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-500`}>
              Obstetric Conditions:{" "}
              {formData.obstetricConditions.join(", ") || "None"}
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-500`}>
              Other Obstetric: {formData.otherObstetric || "Not provided"}
            </Text>

            <Text style={tw`text-base font-bold mt-4 mb-2 text-gray-500`}>
              4. Care during delivery <RequiredAsterisk />
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-500`}>
              Delivery Place: {formData.deliveryPlace || "Not provided"}
            </Text>
            {formData.deliveryPlace === "Others" && (
              <Text style={tw`text-sm mb-1 text-gray-500`}>
                Other Delivery Place:{" "}
                {formData.otherDeliveryPlace || "Not provided"}
              </Text>
            )}
            {formData.deliveryPlace === "Facility" && (
              <Text style={tw`text-sm mb-1 text-gray-500`}>
                Facility Level: {formData.facilityLevel || "Not provided"}
              </Text>
            )}
            <Text style={tw`text-sm mb-1 text-gray-500`}>
              Delivery Type: {formData.deliveryType || "Not provided"}
            </Text>
            {formData.deliveryType === "Other" && (
              <Text style={tw`text-sm mb-1 text-gray-500`}>
                Other Delivery Type:{" "}
                {formData.otherDeliveryType || "Not provided"}
              </Text>
            )}

            <Text style={tw`text-base font-bold mt-4 mb-2 text-gray-500`}>
              5. Cause of death <RequiredAsterisk />
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-500`}>
              Period of Death: {formData.periodOfDeath || "Not provided"}
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-500`}>
              Perinatal Cause:{" "}
              {formData.perinatalCause.join(", ") || "Not provided"}
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-500`}>
              Maternal Condition: {formData.maternalCondition || "Not provided"}
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-500`}>
              Other Cause: {formData.otherCause || "Not provided"}
            </Text>

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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={tw`flex-row justify-between items-center p-5 bg-white border-b border-gray-300`}
      >
        <HamburgerButton
          onPress={() => setDrawerVisible(true)}
          position="relative"
        />
        <Text style={tw`text-2xl font-bold text-purple-500`}>
          MOH 369 register
        </Text>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={() => {}}>
            <FilePenIcon color="#682483ff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={tw`flex-1`}>
        <ScrollView
          contentContainerStyle={tw`p-5 pb-32 `} // Increased bottom padding
          showsVerticalScrollIndicator={true}
        >
          {renderScreen()}
        </ScrollView>

        {/* Navigation buttons fixed at the bottom */}
        {currentScreen < 6 && (
          <View
            style={tw`absolute bottom-5 left-5 right-5 flex-row justify-between`}
          >
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
                currentScreen === 1 ? tw`flex-1` : tw`flex-1 ml-2`,
              ]}
              onPress={nextScreen}
            >
              <Text style={tw`text-white font-bold`}>
                {currentScreen === 5 ? "Review" : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Drawer */}
      <CustomDrawer
        drawerVisible={drawerVisible}
        setDrawerVisible={setDrawerVisible}
        userRole={userRole}
        handleLogout={handleLogout}
      />
    </KeyboardAvoidingView>
  );
};

export default StillbirthRegistrationScreen;
