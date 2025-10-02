import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { FilePenIcon } from "lucide-react-native";
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
import tw from "tailwind-react-native-classnames";
import CustomDrawer from "../components/CustomDrawer";
import HamburgerButton from "../components/HamburgerButton";
import { BASE_URL } from "../constants/ApiConfig";

type BabyData = {
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
};

type MotherData = {
  motherAge: string;
  motherMarried: string;
  motherPara: string;
  motherOutcome: string;
  pregnancyType: string;
  antenatalCare: string;
  obstetricConditions: string[];
  otherObstetric: string;
  deliveryPlace: string;
  otherDeliveryPlace: string;
  facilityLevel: string;
  deliveryType: string;
  otherDeliveryType: string;
  periodOfDeath: string;
  perinatalCause: string[];
  maternalCondition: string;
  otherCause: string;
};

const initialMotherData: MotherData = {
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

const initialBabyData: BabyData = {
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
};

const StillbirthRegistrationScreen = () => {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [userInfo, setUserInfo] = useState<{
    name: string;
    role: string;
    location: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeDatePicker, setActiveDatePicker] = useState<number | null>(null);
  const [activeTimePicker, setActiveTimePicker] = useState<number | null>(null);

  const [babies, setBabies] = useState<BabyData[]>([{ ...initialBabyData }]);
  const [motherData, setMotherData] = useState<MotherData>({
    ...initialMotherData,
  });

  const addBaby = () => {
    setBabies((prev) => [...prev, { ...initialBabyData }]);
  };

  const updateBaby = (index: number, field: keyof BabyData, value: string) => {
    const newBabies = [...babies];
    newBabies[index][field] = value;
    setBabies(newBabies);
  };

  const updateMotherData = (field: keyof MotherData, value: any) => {
    setMotherData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleObstetricCondition = (condition: string) => {
    const currentConditions = [...motherData.obstetricConditions];
    const index = currentConditions.indexOf(condition);

    if (index > -1) {
      currentConditions.splice(index, 1);
    } else {
      currentConditions.push(condition);
    }

    updateMotherData("obstetricConditions", currentConditions);
  };

  const togglePerinatalCause = (cause: string) => {
    const currentCauses = [...motherData.perinatalCause];
    const index = currentCauses.indexOf(cause);

    if (index > -1) {
      currentCauses.splice(index, 1);
    } else {
      currentCauses.push(cause);
    }

    updateMotherData("perinatalCause", currentCauses);
  };

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const [userName, userRole, locationName] = await Promise.all([
          AsyncStorage.getItem("user_name"),
          AsyncStorage.getItem("role"),
          AsyncStorage.getItem("location_name"),
        ]);

        setUserRole(userRole || "");
        setUserInfo({
          name: userName || "User",
          role: userRole || "nurse",
          location: locationName || "Unknown Location",
        });
      } catch (error) {
        console.error("Error loading user info:", error);
      }
    };
    getUserInfo();
  }, []);

  // Clear authentication tokens
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
        "subcounty_id",
        "subcounty_name",
        "county_id",
        "county_name",
        "location_hierarchy",
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

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const validateCurrentScreen = () => {
    switch (currentScreen) {
      case 1:
        // Validate all babies
        for (const baby of babies) {
          if (
            !baby.dateOfDeath ||
            !baby.timeOfDeath ||
            !baby.gestationWeeks ||
            !baby.babyOutcome ||
            !baby.birthWeight ||
            !baby.sexOfBaby ||
            (baby.sexOfBaby === "Others" && !baby.otherSex) ||
            (baby.babyOutcome === "Alive" &&
              (!baby.apgar1min ||
                !baby.apgar5min ||
                !baby.apgar10min ||
                !baby.ageAtDeath))
          ) {
            return false;
          }
        }
        return true;

      case 2: {
        if (
          !motherData.motherAge ||
          !motherData.motherMarried ||
          !motherData.motherPara ||
          !motherData.motherOutcome
        ) {
          return false;
        }

        const age = Number(motherData.motherAge);
        if (isNaN(age) || age < 14 || age > 70) {
          Alert.alert(
            "Invalid Age",
            "Mother's age must be between 14 and 70 years."
          );
          return false;
        }

        return true;
      }

      case 3:
        return (
          motherData.pregnancyType &&
          motherData.antenatalCare &&
          (motherData.obstetricConditions.length > 0 ||
            motherData.otherObstetric)
        );

      case 4:
        return (
          motherData.deliveryPlace &&
          (motherData.deliveryPlace !== "Others" ||
            motherData.otherDeliveryPlace) &&
          (motherData.deliveryPlace !== "Facility" ||
            motherData.facilityLevel) &&
          motherData.deliveryType &&
          (motherData.deliveryType !== "Other" || motherData.otherDeliveryType)
        );

      case 5:
        return (
          motherData.periodOfDeath &&
          (motherData.perinatalCause.length > 0 ||
            motherData.maternalCondition ||
            motherData.otherCause)
        );

      default:
        return true;
    }
  };

  const nextScreen = () => {
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

  const submitForm = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const [accessToken, locationId, locationName, locationType] =
        await Promise.all([
          AsyncStorage.getItem("access_token"),
          AsyncStorage.getItem("location_id"),
          AsyncStorage.getItem("location_name"),
          AsyncStorage.getItem("location_type"),
        ]);

      console.log("User Info:", userInfo);
      console.log("Location ID:", locationId);
      console.log("Location Name:", locationName);

      if (!accessToken) {
        throw new Error("User not authenticated. Please login again.");
      }

      if (!locationId) {
        throw new Error(
          "Location information not found. Please contact administrator."
        );
      }

      const payload = {
        locationId: parseInt(locationId),
        dateOfNotification: new Date().toISOString().split("T")[0],
        mother: {
          age: parseInt(motherData.motherAge) || null,
          married: motherData.motherMarried === "Yes",
          parity: motherData.motherPara,
          outcome: motherData.motherOutcome,
          typeOfPregnancy: motherData.pregnancyType,
          attendedAntenatal: motherData.antenatalCare,
          placeOfDelivery: motherData.deliveryPlace,
          facilityLevelOfCare: motherData.facilityLevel,
          typeOfDelivery: motherData.deliveryType,
          periodOfDeath: motherData.periodOfDeath,
          perinatalCause: motherData.perinatalCause.join(", "),
          maternalCondition: motherData.maternalCondition,
          conditions: motherData.obstetricConditions,
        },
        babies: babies.map((b) => ({
          dateOfDeath: b.dateOfDeath,
          timeOfDeath: b.timeOfDeath,
          gestationWeeks: parseInt(b.gestationWeeks) || null,
          outcome: b.babyOutcome,
          apgarScore1min: b.apgar1min || null,
          apgarScore5min: b.apgar5min || null,
          apgarScore10min: b.apgar10min || null,
          ageAtDeathDays: parseInt(b.ageAtDeath) || 0,
          birthWeight: parseInt(b.birthWeight) || null,
          sex: b.sexOfBaby === "Others" ? b.otherSex : b.sexOfBaby,
        })),
      };

      console.log("Submitting payload to this baseURL:", BASE_URL);
      console.log("Submitting payload:", payload);

      const response = await fetch(`${BASE_URL}/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);

        let errorMessage = "Failed to submit form";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      Alert.alert(
        "Success",
        "Stillbirth registration submitted successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              // Reset form and go back to screen 1
              setMotherData({ ...initialMotherData });
              setBabies([{ ...initialBabyData }]);
              setCurrentScreen(1);
            },
          },
        ]
      );

      console.log("Server response:", data);
    } catch (error: any) {
      console.error("Error submitting form:", error);
      Alert.alert(
        "Submission Error",
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const RequiredAsterisk = () => <Text style={tw`text-red-500`}>*</Text>;

  const renderScreen = () => {
    switch (currentScreen) {
      case 1:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-700`}>
              1. Details of Deceased Baby <RequiredAsterisk />
            </Text>

            {babies.map((baby, index) => (
              <View key={index} style={tw`mb-8 border-b border-gray-200 pb-5`}>
                <Text style={tw`text-base font-bold mb-4 text-gray-700`}>
                  Baby {index + 1}
                </Text>

                {/* Date Picker Field */}
                <Text style={tw`text-base font-semibold mb-2 text-gray-600`}>
                  Date of death <RequiredAsterisk />
                </Text>
                <TouchableOpacity
                  style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
                  onPress={() => setActiveDatePicker(index)}
                >
                  <Text style={tw`text-gray-500`}>
                    {baby.dateOfDeath || "Select date (YYYY-MM-DD)"}
                  </Text>
                </TouchableOpacity>

                {activeDatePicker === index && (
                  <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, selectedDate) => {
                      setActiveDatePicker(null);
                      if (selectedDate) {
                        updateBaby(
                          index,
                          "dateOfDeath",
                          formatDate(selectedDate)
                        );
                      }
                    }}
                  />
                )}

                {/* Time Picker Field */}
                <Text style={tw`text-base font-semibold mb-2 text-gray-600`}>
                  Time of death <RequiredAsterisk />
                </Text>
                <TouchableOpacity
                  style={tw`bg-white p-4 rounded mb-4 border border-gray-300`}
                  onPress={() => setActiveTimePicker(index)}
                >
                  <Text style={tw`text-gray-400`}>
                    {baby.timeOfDeath || "Select time (HH:MM)"}
                  </Text>
                </TouchableOpacity>

                {activeTimePicker === index && (
                  <DateTimePicker
                    value={new Date()}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, selectedDate) => {
                      setActiveTimePicker(null);
                      if (selectedDate) {
                        updateBaby(
                          index,
                          "timeOfDeath",
                          formatTime(selectedDate)
                        );
                      }
                    }}
                  />
                )}

                {/* Gestation */}
                <Text style={tw`text-base font-semibold mb-2 text-gray-600`}>
                  Gestation at birth (in weeks) <RequiredAsterisk />
                </Text>
                <TextInput
                  style={tw`bg-white p-4 rounded mb-4 border border-gray-300 text-gray-700`}
                  placeholder="Enter gestation in weeks"
                  placeholderTextColor="#9CA3AF"
                  value={baby.gestationWeeks}
                  onChangeText={(text) =>
                    updateBaby(index, "gestationWeeks", text)
                  }
                  keyboardType="numeric"
                />

                {/* Baby outcome */}
                <Text style={tw`text-base font-semibold mb-2 text-gray-600`}>
                  Baby outcome <RequiredAsterisk />
                </Text>
                <View style={tw`mb-4`}>
                  {["Alive", "fresh stillbirth", "macerated stillbirth"].map(
                    (option) => (
                      <TouchableOpacity
                        key={option}
                        style={tw`flex-row items-center mb-2`}
                        onPress={() => updateBaby(index, "babyOutcome", option)}
                      >
                        <View
                          style={tw`h-5 w-5 rounded-full border-2 border-purple-500 items-center justify-center mr-2`}
                        >
                          {baby.babyOutcome === option && (
                            <View
                              style={tw`h-3 w-3 rounded-full bg-purple-500`}
                            />
                          )}
                        </View>
                        <Text style={tw`text-gray-700`}>{option}</Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>

                {baby.babyOutcome === "Alive" && (
                  <>
                    {/* Apgar */}
                    <Text
                      style={tw`text-base font-semibold mb-2 text-gray-600`}
                    >
                      Apgar score: <RequiredAsterisk />
                    </Text>
                    <View style={tw`flex-row justify-between mb-4`}>
                      {(
                        [
                          "apgar1min",
                          "apgar5min",
                          "apgar10min",
                        ] as (keyof BabyData)[]
                      ).map((field, i) => (
                        <View key={field} style={tw`flex-1 mx-1`}>
                          <Text
                            style={tw`text-sm font-semibold mb-1 text-gray-600`}
                          >
                            {i === 0 ? "1 min" : i === 1 ? "5 min" : "10 min"}
                          </Text>
                          <TextInput
                            style={tw`bg-white p-3 rounded border border-gray-300 text-gray-700 text-center`}
                            placeholder="0-10"
                            placeholderTextColor="#9CA3AF"
                            value={baby[field]}
                            onChangeText={(text) =>
                              updateBaby(index, field, text)
                            }
                            keyboardType="numeric"
                            maxLength={2}
                          />
                        </View>
                      ))}
                    </View>

                    {/* Age at death */}
                    <Text
                      style={tw`text-base font-semibold mb-2 text-gray-600`}
                    >
                      Age at time of death (in days) <RequiredAsterisk />
                    </Text>
                    <TextInput
                      style={tw`bg-white p-4 rounded mb-4 border border-gray-300 text-gray-700`}
                      placeholder="Enter age in days"
                      placeholderTextColor="#9CA3AF"
                      value={baby.ageAtDeath}
                      onChangeText={(text) =>
                        updateBaby(index, "ageAtDeath", text)
                      }
                      keyboardType="numeric"
                    />
                  </>
                )}

                {/* Birth weight */}
                <Text style={tw`text-base font-semibold mb-2 text-gray-600`}>
                  Birth weight (in grams) <RequiredAsterisk />
                </Text>
                <TextInput
                  style={tw`bg-white p-4 rounded mb-4 border border-gray-300 text-gray-700`}
                  placeholder="Enter birth weight in grams"
                  placeholderTextColor="#9CA3AF"
                  value={baby.birthWeight}
                  onChangeText={(text) =>
                    updateBaby(index, "birthWeight", text)
                  }
                  keyboardType="numeric"
                />

                {/* Sex */}
                <Text style={tw`text-base font-semibold mb-2 text-gray-600`}>
                  Sex of baby <RequiredAsterisk />
                </Text>
                <View style={tw`mb-4`}>
                  {["Male", "Female", "Others"].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={tw`flex-row items-center mb-2`}
                      onPress={() => updateBaby(index, "sexOfBaby", option)}
                    >
                      <View
                        style={tw`h-5 w-5 rounded-full border-2 border-purple-500 items-center justify-center mr-2`}
                      >
                        {baby.sexOfBaby === option && (
                          <View
                            style={tw`h-3 w-3 rounded-full bg-purple-500`}
                          />
                        )}
                      </View>
                      <Text style={tw`text-gray-700`}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {baby.sexOfBaby === "Others" && (
                  <>
                    <Text
                      style={tw`text-base font-semibold mb-2 text-gray-600`}
                    >
                      Specify other sex <RequiredAsterisk />
                    </Text>
                    <TextInput
                      style={tw`bg-white p-4 rounded mb-4 border border-gray-300 text-gray-700`}
                      placeholder="Enter specification"
                      placeholderTextColor="#9CA3AF"
                      value={baby.otherSex}
                      onChangeText={(text) =>
                        updateBaby(index, "otherSex", text)
                      }
                    />
                  </>
                )}

                {/* Remove Baby button */}
                {babies.length > 1 && (
                  <TouchableOpacity
                    style={tw`bg-red-500 p-3 rounded`}
                    onPress={() =>
                      setBabies((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <Text style={tw`text-white text-center`}>
                      🗑 Remove Baby {index + 1}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* Add Another Baby */}
            <TouchableOpacity
              style={tw`bg-purple-500 p-3 rounded`}
              onPress={addBaby}
            >
              <Text style={tw`text-white text-center`}>+ Add Another Baby</Text>
            </TouchableOpacity>
          </View>
        );

      case 2:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-700`}>
              2. Mother's details <RequiredAsterisk />
            </Text>

            <Text style={tw`text-base font-semibold mb-2 text-gray-600`}>
              Age (in years) <RequiredAsterisk />
            </Text>
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300 text-gray-700`}
              placeholder="Enter mother's age"
              placeholderTextColor="#9CA3AF"
              value={motherData.motherAge}
              onChangeText={(text) => updateMotherData("motherAge", text)}
              keyboardType="numeric"
            />

            <Text style={tw`text-base font-semibold mb-2 text-gray-600`}>
              Married: <RequiredAsterisk />
            </Text>
            <View style={tw`mb-4`}>
              {["Yes", "No"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateMotherData("motherMarried", option)}
                >
                  <View
                    style={tw`h-5 w-5 rounded-full border-2 border-purple-500 items-center justify-center mr-2`}
                  >
                    {motherData.motherMarried === option && (
                      <View style={tw`h-3 w-3 rounded-full bg-purple-500`} />
                    )}
                  </View>
                  <Text style={tw`text-gray-700`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={tw`text-base font-semibold mb-2 text-gray-600`}>
              Para + <RequiredAsterisk />
            </Text>
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300 text-gray-700`}
              placeholder="Enter para information"
              placeholderTextColor="#9CA3AF"
              value={motherData.motherPara}
              onChangeText={(text) => updateMotherData("motherPara", text)}
            />

            <Text style={tw`text-base font-semibold mb-2 text-gray-600`}>
              Mother's outcome: <RequiredAsterisk />
            </Text>
            <View style={tw`mb-4`}>
              {["Alive", "Dead", "Not known"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateMotherData("motherOutcome", option)}
                >
                  <View
                    style={tw`h-5 w-5 rounded-full border-2 border-purple-500 items-center justify-center mr-2`}
                  >
                    {motherData.motherOutcome === option && (
                      <View style={tw`h-3 w-3 rounded-full bg-purple-500`} />
                    )}
                  </View>
                  <Text style={tw`text-gray-700`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-700`}>
              3. Obstetric history and care during Pregnancy{" "}
              <RequiredAsterisk />
            </Text>

            <Text style={tw`text-base font-semibold mb-2 text-gray-600`}>
              Type of pregnancy: <RequiredAsterisk />
            </Text>
            <View style={tw`mb-4`}>
              {["Singleton", "Multiple"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateMotherData("pregnancyType", option)}
                >
                  <View
                    style={tw`h-5 w-5 rounded-full border-2 border-purple-500 items-center justify-center mr-2`}
                  >
                    {motherData.pregnancyType === option && (
                      <View style={tw`h-3 w-3 rounded-full bg-purple-500`} />
                    )}
                  </View>
                  <Text style={tw`text-gray-700`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={tw`text-base font-semibold mb-2 text-gray-600`}>
              Attendance of Antenatal care: <RequiredAsterisk />
            </Text>
            <View style={tw`mb-4`}>
              {["Yes", "No", "Unknown"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateMotherData("antenatalCare", option)}
                >
                  <View
                    style={tw`h-5 w-5 rounded-full border-2 border-purple-500 items-center justify-center mr-2`}
                  >
                    {motherData.antenatalCare === option && (
                      <View style={tw`h-3 w-3 rounded-full bg-purple-500`} />
                    )}
                  </View>
                  <Text style={tw`text-gray-700`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={tw`text-base font-semibold mb-2 text-gray-600`}>
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
                  {motherData.obstetricConditions.includes(condition) && (
                    <Text style={tw`text-purple-500 font-bold`}>✓</Text>
                  )}
                </View>
                <Text style={tw`text-gray-700`}>{condition}</Text>
              </TouchableOpacity>
            ))}

            <Text style={tw`text-base font-semibold mb-2 text-gray-600`}>
              Others (Specify) <RequiredAsterisk />
            </Text>
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300 text-gray-700`}
              placeholder="Enter other conditions"
              placeholderTextColor="#9CA3AF"
              value={motherData.otherObstetric}
              onChangeText={(text) => updateMotherData("otherObstetric", text)}
            />
          </View>
        );

      case 4:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-700`}>
              4. Care during delivery <RequiredAsterisk />
            </Text>

            <Text style={tw`text-base font-semibold mb-2 text-gray-600`}>
              Place of delivery: <RequiredAsterisk />
            </Text>
            <View style={tw`mb-4`}>
              {["Home", "Facility", "Others"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={tw`flex-row items-center mb-2`}
                  onPress={() => updateMotherData("deliveryPlace", option)}
                >
                  <View
                    style={tw`h-5 w-5 rounded-full border-2 border-purple-500 items-center justify-center mr-2`}
                  >
                    {motherData.deliveryPlace === option && (
                      <View style={tw`h-3 w-3 rounded-full bg-purple-500`} />
                    )}
                  </View>
                  <Text style={tw`text-gray-700`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {motherData.deliveryPlace === "Others" && (
              <>
                <Text style={tw`text-base font-semibold mb-2 text-gray-600`}>
                  Specify other delivery place <RequiredAsterisk />
                </Text>
                <TextInput
                  style={tw`bg-white p-4 rounded mb-4 border border-gray-300 text-gray-700`}
                  placeholder="Enter delivery place"
                  placeholderTextColor="#9CA3AF"
                  value={motherData.otherDeliveryPlace}
                  onChangeText={(text) =>
                    updateMotherData("otherDeliveryPlace", text)
                  }
                />
              </>
            )}

            {motherData.deliveryPlace === "Facility" && (
              <>
                <Text style={tw`text-base font-semibold mb-2 text-gray-600`}>
                  Level of care (2, 3, 4, 5, 6) <RequiredAsterisk />
                </Text>
                <TextInput
                  style={tw`bg-white p-4 rounded mb-4 border border-gray-300 text-gray-700`}
                  placeholder="Enter level of care"
                  placeholderTextColor="#9CA3AF"
                  value={motherData.facilityLevel}
                  onChangeText={(text) =>
                    updateMotherData("facilityLevel", text)
                  }
                  keyboardType="numeric"
                />
              </>
            )}

            <Text style={tw`text-base font-semibold mb-2 text-gray-600`}>
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
                  onPress={() => updateMotherData("deliveryType", option)}
                >
                  <View
                    style={tw`h-5 w-5 rounded-full border-2 border-purple-500 items-center justify-center mr-2`}
                  >
                    {motherData.deliveryType === option && (
                      <View style={tw`h-3 w-3 rounded-full bg-purple-500`} />
                    )}
                  </View>
                  <Text style={tw`text-gray-700`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {motherData.deliveryType === "Other" && (
              <>
                <Text style={tw`text-base font-semibold mb-2 text-gray-600`}>
                  Specify other delivery type <RequiredAsterisk />
                </Text>
                <TextInput
                  style={tw`bg-white p-4 rounded mb-4 border border-gray-300 text-gray-700`}
                  placeholder="Enter delivery type"
                  placeholderTextColor="#9CA3AF"
                  value={motherData.otherDeliveryType}
                  onChangeText={(text) =>
                    updateMotherData("otherDeliveryType", text)
                  }
                />
              </>
            )}
          </View>
        );

      case 5:
        return (
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-700`}>
              5. Cause of death <RequiredAsterisk />
            </Text>

            <Text style={tw`text-base font-semibold mb-2 text-gray-600`}>
              Period of death: <RequiredAsterisk />
            </Text>
            <View style={tw`mb-4`}>
              {["Antepartum", "Intrapartum", "Neonatal", "Unknown"].map(
                (option) => (
                  <TouchableOpacity
                    key={option}
                    style={tw`flex-row items-center mb-2`}
                    onPress={() => updateMotherData("periodOfDeath", option)}
                  >
                    <View
                      style={tw`h-5 w-5 rounded-full border-2 border-purple-500 items-center justify-center mr-2`}
                    >
                      {motherData.periodOfDeath === option && (
                        <View style={tw`h-3 w-3 rounded-full bg-purple-500`} />
                      )}
                    </View>
                    <Text style={tw`text-gray-700`}>{option}</Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <Text style={tw`text-base font-semibold mb-2 text-gray-600`}>
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
                  {motherData.perinatalCause.includes(cause) && (
                    <Text style={tw`text-purple-500 font-bold`}>✓</Text>
                  )}
                </View>
                <Text style={tw`text-gray-700`}>{cause}</Text>
              </TouchableOpacity>
            ))}

            <Text style={tw`text-base font-semibold mb-2 text-gray-600 mt-4`}>
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
                  onPress={() => updateMotherData("maternalCondition", option)}
                >
                  <View
                    style={tw`h-5 w-5 rounded-full border-2 border-purple-500 items-center justify-center mr-2`}
                  >
                    {motherData.maternalCondition === option && (
                      <View style={tw`h-3 w-3 rounded-full bg-purple-500`} />
                    )}
                  </View>
                  <Text style={tw`text-gray-700`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={tw`text-base font-semibold mb-2 text-gray-600`}>
              Others (Specify) <RequiredAsterisk />
            </Text>
            <TextInput
              style={tw`bg-white p-4 rounded mb-4 border border-gray-300 text-gray-700`}
              placeholder="Enter other causes"
              placeholderTextColor="#9CA3AF"
              value={motherData.otherCause}
              onChangeText={(text) => updateMotherData("otherCause", text)}
            />
          </View>
        );

      case 6:
        return (
          <View style={tw`flex-1 mb-5`}>
            <Text style={tw`text-lg font-bold mb-5 text-gray-700`}>
              Review All Information
            </Text>

            {/* User and Location Info */}
            <View style={tw`bg-purple-50 p-3 rounded-lg mb-4`}>
              <Text style={tw`text-purple-700 font-semibold text-center`}>
                {userInfo?.location || "Unknown Location"}
              </Text>
              <Text style={tw`text-purple-600 text-xs text-center`}>
                Registered by: {userInfo?.name} ({userInfo?.role}) •{" "}
                {new Date().toLocaleDateString()}
              </Text>
            </View>

            {/* Babies Information */}
            {babies.map((baby, index) => (
              <View key={index} style={tw`mb-6`}>
                <Text style={tw`text-base font-bold mt-4 mb-2 text-gray-700`}>
                  Baby {index + 1} Details
                </Text>
                <Text style={tw`text-sm mb-1 text-gray-600`}>
                  Date of Death: {baby.dateOfDeath || "Not provided"}
                </Text>
                <Text style={tw`text-sm mb-1 text-gray-600`}>
                  Time of Death: {baby.timeOfDeath || "Not provided"}
                </Text>
                <Text style={tw`text-sm mb-1 text-gray-600`}>
                  Gestation Weeks: {baby.gestationWeeks || "Not provided"}
                </Text>
                <Text style={tw`text-sm mb-1 text-gray-600`}>
                  Baby Outcome: {baby.babyOutcome || "Not provided"}
                </Text>

                {baby.babyOutcome === "Alive" && (
                  <>
                    <Text style={tw`text-sm mb-1 text-gray-600`}>
                      Apgar 1min: {baby.apgar1min || "Not provided"}
                    </Text>
                    <Text style={tw`text-sm mb-1 text-gray-600`}>
                      Apgar 5min: {baby.apgar5min || "Not provided"}
                    </Text>
                    <Text style={tw`text-sm mb-1 text-gray-600`}>
                      Apgar 10min: {baby.apgar10min || "Not provided"}
                    </Text>
                    <Text style={tw`text-sm mb-1 text-gray-600`}>
                      Age at Death: {baby.ageAtDeath || "Not provided"}
                    </Text>
                  </>
                )}

                <Text style={tw`text-sm mb-1 text-gray-600`}>
                  Birth Weight: {baby.birthWeight || "Not provided"}
                </Text>
                <Text style={tw`text-sm mb-1 text-gray-600`}>
                  Sex of Baby: {baby.sexOfBaby || "Not provided"}
                </Text>
                {baby.sexOfBaby === "Others" && (
                  <Text style={tw`text-sm mb-1 text-gray-600`}>
                    Other Sex: {baby.otherSex || "Not provided"}
                  </Text>
                )}
              </View>
            ))}

            <Text style={tw`text-base font-bold mt-4 mb-2 text-gray-700`}>
              2. Mother's details
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-600`}>
              Mother's Age: {motherData.motherAge || "Not provided"}
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-600`}>
              Married: {motherData.motherMarried || "Not provided"}
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-600`}>
              Para: {motherData.motherPara || "Not provided"}
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-600`}>
              Mother's Outcome: {motherData.motherOutcome || "Not provided"}
            </Text>

            <Text style={tw`text-base font-bold mt-4 mb-2 text-gray-700`}>
              3. Obstetric history and care during Pregnancy
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-600`}>
              Pregnancy Type: {motherData.pregnancyType || "Not provided"}
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-600`}>
              Antenatal Care: {motherData.antenatalCare || "Not provided"}
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-600`}>
              Obstetric Conditions:{" "}
              {motherData.obstetricConditions.join(", ") || "None"}
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-600`}>
              Other Obstetric: {motherData.otherObstetric || "Not provided"}
            </Text>

            <Text style={tw`text-base font-bold mt-4 mb-2 text-gray-700`}>
              4. Care during delivery
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-600`}>
              Delivery Place: {motherData.deliveryPlace || "Not provided"}
            </Text>
            {motherData.deliveryPlace === "Others" && (
              <Text style={tw`text-sm mb-1 text-gray-600`}>
                Other Delivery Place:{" "}
                {motherData.otherDeliveryPlace || "Not provided"}
              </Text>
            )}
            {motherData.deliveryPlace === "Facility" && (
              <Text style={tw`text-sm mb-1 text-gray-600`}>
                Facility Level: {motherData.facilityLevel || "Not provided"}
              </Text>
            )}
            <Text style={tw`text-sm mb-1 text-gray-600`}>
              Delivery Type: {motherData.deliveryType || "Not provided"}
            </Text>
            {motherData.deliveryType === "Other" && (
              <Text style={tw`text-sm mb-1 text-gray-600`}>
                Other Delivery Type:{" "}
                {motherData.otherDeliveryType || "Not provided"}
              </Text>
            )}

            <Text style={tw`text-base font-bold mt-4 mb-2 text-gray-700`}>
              5. Cause of death
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-600`}>
              Period of Death: {motherData.periodOfDeath || "Not provided"}
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-600`}>
              Perinatal Cause:{" "}
              {motherData.perinatalCause.join(", ") || "Not provided"}
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-600`}>
              Maternal Condition:{" "}
              {motherData.maternalCondition || "Not provided"}
            </Text>
            <Text style={tw`text-sm mb-1 text-gray-600`}>
              Other Cause: {motherData.otherCause || "Not provided"}
            </Text>

            <TouchableOpacity
              style={tw`bg-gray-500 p-4 rounded mb-3 items-center`}
              onPress={() => setCurrentScreen(1)}
            >
              <Text style={tw`text-white font-bold`}>Edit Information</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`bg-purple-500 p-4 rounded items-center ${
                isSubmitting ? "opacity-50" : ""
              }`}
              onPress={submitForm}
              disabled={isSubmitting}
            >
              <Text style={tw`text-white font-bold`}>
                {isSubmitting ? "Submitting..." : "Submit Registration"}
              </Text>
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
          MOH 369 Register
        </Text>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={() => {}}>
            <FilePenIcon color="#682483" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={tw`flex-1`}>
        <ScrollView
          contentContainerStyle={tw`p-5 pb-32`}
          showsVerticalScrollIndicator={true}
        >
          {renderScreen()}
        </ScrollView>

        {/* Navigation buttons fixed at the bottom */}
        {currentScreen < 6 && (
          <View
            style={tw`absolute bottom-10 left-5 right-5 flex-row justify-between`}
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
        //userRole={userRole}
        handleLogout={handleLogout}
      />
    </KeyboardAvoidingView>
  );
};

export default StillbirthRegistrationScreen;
