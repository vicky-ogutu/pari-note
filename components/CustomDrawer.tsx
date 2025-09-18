import { useRouter } from "expo-router";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import tw from "tailwind-react-native-classnames";

interface DrawerProps {
  drawerVisible: boolean;
  setDrawerVisible: (visible: boolean) => void;
  userRole: string;
  handleLogout: () => void;
}

const CustomDrawer: React.FC<DrawerProps> = ({
  drawerVisible,
  setDrawerVisible,
  userRole,
  handleLogout,
}) => {
  const router = useRouter();

  return (
    <Modal
      visible={drawerVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setDrawerVisible(false)}
    >
      <TouchableOpacity
        style={tw`flex-1 bg-black bg-opacity-50`}
        onPress={() => setDrawerVisible(false)}
        activeOpacity={1}
      >
        <View style={tw`w-64 h-full bg-white`}>
          {/* Header */}
          <View style={tw`p-5 bg-purple-500`}>
            <Text style={tw`text-white text-lg font-bold`}>
              MOH 369 Register
            </Text>
          </View>

          {/* Content */}
          <View style={tw`flex-1 p-4`}>
            <View style={tw`mb-6`}>
              <Text
                style={tw`text-gray-500 text-xs uppercase font-semibold mb-3 pl-2`}
              >
                Main Navigation
              </Text>

              {/* Nurse Menu */}
              {userRole === "nurse" && (
                <>
                  <TouchableOpacity
                    style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                    onPress={() => {
                      setDrawerVisible(false);
                      router.push("/home");
                    }}
                  >
                    <Text style={tw`text-gray-500 font-medium ml-2`}>
                      🏠 Dashboard
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                    onPress={() => {
                      setDrawerVisible(false);
                      router.push("/patient_registration");
                    }}
                  >
                    <Text style={tw`text-gray-500 font-medium ml-2`}>
                      📋 Report Stillbirth
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                    onPress={handleLogout}
                  >
                    <Text style={tw`text-gray-500 font-medium ml-2`}>
                      🚪 Logout
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Admin/County/Subcounty Menu */}
              {(userRole === "admin" ||
                userRole === "county user" ||
                userRole === "subcounty user") && (
                <>
                  <TouchableOpacity
                    style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                    onPress={() => {
                      setDrawerVisible(false);
                      router.push("/home");
                    }}
                  >
                    <Text style={tw`text-gray-500 font-medium ml-2`}>
                      🏠 Dashboard
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                    onPress={() => {
                      setDrawerVisible(false);
                      router.push("/users");
                    }}
                  >
                    <Text style={tw`text-gray-500 font-medium ml-2`}>
                      👥 Users
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={tw`flex-row items-center p-3 rounded-lg mb-2`}
                    onPress={handleLogout}
                  >
                    <Text style={tw`text-gray-500 font-medium ml-2`}>
                      🚪 Logout
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default CustomDrawer;
