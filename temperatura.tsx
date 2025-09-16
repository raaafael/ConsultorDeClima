import { useState, useRef } from "react";
import {
  View,Text,TextInput,TouchableOpacity,FlatList,ActivityIndicator,} from "react-native";

const API_KEY = "5b5e2f49cec6d579b9f6e64c4e33f66f";


async function getWeatherByCity(city: string) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=pt_br`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Cidade não encontrada!");
  return await response.json();
}


async function getCitySuggestions(query: string) {
  if (!query) return [];
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`;
  const response = await fetch(url);
  return await response.json();
}


function formatTime(timestamp: number) {
  const date = new Date(timestamp * 1000);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}


function getEmoji(temp: number) {
  if (temp <= 15) return "❄️";
  if (temp <= 30) return "🌤️";
  return "🔥";
}

export default function Temperatura() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const debounceRef = useRef<any>(null);

  const handleCityInput = (text: string) => {
    setCity(text);
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (text.length > 2) {
        const results: any[] = await getCitySuggestions(text);
    
        const uniqueResults = results.filter(
          (v: any, i: number, a: any[]) =>
            a.findIndex(
              (t: any) => t.name === v.name && t.country === v.country
            ) === i
        );
        setSuggestions(uniqueResults);
      } else {
        setSuggestions([]);
      }
    }, 400);
  };

  const handleSearch = async (selectedCity?: string) => {
    const cityToSearch = selectedCity || city.trim();
    if (!cityToSearch) {
      setError("Digite uma cidade");
      setWeather(null);
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);
    setSuggestions([]);

    try {
      const data = await getWeatherByCity(cityToSearch);
      setWeather(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-blue-50 p-4">

      <TextInput
        placeholder="Digite a cidade"
        value={city}
        onChangeText={handleCityInput}
        className="border border-blue-300 rounded-lg p-3 mb-2 bg-white text-base"
      />

      <TouchableOpacity
        onPress={() => handleSearch()}
        className="bg-blue-600 p-3 rounded-lg items-center mb-3"
      >
        <Text className="text-white font-bold">Buscar</Text>
      </TouchableOpacity>

      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.name + item.country}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white p-3 mb-1 rounded-lg shadow-sm"
              onPress={() => handleSearch(item.name)}
            >
              <Text className="font-semibold text-blue-700 text-base">{item.name}</Text>
              <Text className="text-blue-500 text-sm mt-1">
                {item.state ? `${item.state}, ` : ""}
                {item.country}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

    
      {error ? (
        <Text className="text-red-600 text-center text-base mt-2">{error}</Text>
      ) : null}


      {loading && (
        <ActivityIndicator size="large" color="#3182ce" className="mt-4" />
      )}

      {weather && !loading && (
        <View className="bg-white p-5 rounded-lg items-center mt-4 shadow-md">
          <Text className="text-2xl font-bold">{weather.name}{weather.sys?.country ? `, ${weather.sys.country}` : ""}</Text>
          <Text className="text-base mt-1 capitalize">{weather.weather[0].description}</Text>
          <Text className="text-4xl font-bold mt-2">
            {getEmoji(Math.round(weather.main.temp))} {Math.round(weather.main.temp)}°C
          </Text>

          <Text className="mt-4">Min: {Math.round(weather.main.temp_min)}°C | Max: {Math.round(weather.main.temp_max)}°C</Text>
          <Text className="mt-2">Sensação: {Math.round(weather.main.feels_like)}°C</Text>
          <Text className="mt-2">💧 Umidade: {weather.main.humidity}%</Text>
          <Text className="mt-2">🌬️ Vento: {weather.wind.speed} m/s</Text>
          <Text className="mt-2">☁️ Nuvens: {weather.clouds.all}%</Text>
          <Text className="mt-2">🌅 Nascer do sol: {formatTime(weather.sys.sunrise)}</Text>
          <Text className="mt-2">🌇 Pôr do sol: {formatTime(weather.sys.sunset)}</Text>
        </View>
      )}
    </View>
  );
}
