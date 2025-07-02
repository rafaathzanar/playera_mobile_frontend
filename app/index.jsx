import { StatusBar } from "expo-status-bar";
import { Redirect, router } from "expo-router";
import { View, Text, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "../constants";
import { CustomButton, Loader } from "../components";


const Welcome = () => {


  return (
    <SafeAreaView className="bg-primary h-full">


      <ScrollView
        contentContainerStyle={{
          height: "100%",
        }}
      >
        <View className="w-full flex justify-center items-center h-full px-4">
          <Image
            source={images.playeralogowhite}
            className="w-[300px] h-[300px]"
            resizeMode="contain"
          />

        

          <View className="relative mt-5">
            <Text className="text-3xl text-white font-bold text-center">
            Book Your Favorite Sport{"\n"}
              Venues with{" "}
              <Text className="text-secondary-200">PlayEra</Text>
            </Text>

            <Image
              source={images.path}
              className="w-[136px] h-[15px] absolute -bottom-3 -right-8"
              resizeMode="contain"
            />
          </View>

          <Text className="text-sm font-pregular text-gray-100 mt-7 text-center">
            All in one platform to book your favorite sport venues and{"\n"}
            enjoy your time with friends and family and Stay Fit.
          </Text>

          <CustomButton
            title="Continue with Email"
            // handlePress={() => router.push("/sign-in")}
                handlePress={() => router.push("/home")}
            containerStyles="w-full mt-7"
          />
        </View>
      </ScrollView>

      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
};

export default Welcome;