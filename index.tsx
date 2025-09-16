import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const goToTemperatura = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/temperatura");
    }, 1500); 
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold mb-4">EchoTemperature</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" />
      ) : (
        <TouchableOpacity
          onPress={goToTemperatura}
          className="bg-blue-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-medium">Temperatura</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
