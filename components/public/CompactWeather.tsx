/**
 * Compact weather widget that displays current conditions in a minimal horizontal format.
 * Adapts the existing weather functionality to a more space-efficient design.
 */
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Image, Text, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { fetchWeatherApi } from "openmeteo";
import { weatherDict, WeatherDescription } from "@/constants/weather";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

interface Weather {
  temperature: number;
  minTemperature?: number;
  maxTemperature?: number;
  precipitation: number;
  weatherCode: number;
}

export default function CompactWeather() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [weatherInfo, setWeather] = useState<Weather | null>(null);
  const [weatherDesc, setWeatherDesc] = useState<WeatherDescription | null>(null);
  const colorScheme = useColorScheme() ?? "light";
  const isDaytime = new Date().getHours() >= 6 && new Date().getHours() < 18;
  const [location, setLocation] = useState("unknown");

  async function getCurrentLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return null;
    }

    let location = await Location.getCurrentPositionAsync({});
    return location;
  }

  useEffect(() => {
    async function getWeather() {
      try {
        const myLocation = await getCurrentLocation();
        if (myLocation) {
          const { latitude, longitude } = myLocation.coords;
          const city = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });
          if (city) {
            setLocation(JSON.stringify(city[0]["city"]).replace(/"/g, ""));
          }
          const params = {
            latitude: latitude,
            longitude: longitude,
            current: ["temperature_2m", "precipitation", "weather_code"],
            daily: ["temperature_2m_max", "temperature_2m_min"],
            timezone: "auto",
          };

          const url = "https://api.open-meteo.com/v1/forecast";
          const responses = await fetchWeatherApi(url, params);

          const response = responses[0];
          const current = response.current()!;
          const daily = response.daily()!;

          const temperature = current.variables(0)!.value();
          const precipitation = current.variables(1)!.value();
          const weatherCode = current.variables(2)!.value();

          let minTemp, maxTemp;
          try {
            minTemp = daily.variables(1)!.valuesArray()![0];
            maxTemp = daily.variables(0)!.valuesArray()![0];
          } catch (e) {
            // If daily forecast isn't available, we'll proceed without min/max
          }

          const weatherData: Weather = {
            precipitation: precipitation,
            temperature: temperature,
            weatherCode: weatherCode,
            minTemperature: minTemp,
            maxTemperature: maxTemp,
          };

          setWeatherDesc(
            weatherDict[weatherCode.toString()][isDaytime ? "day" : "night"]
          );
          setWeather(weatherData);
        }
      } catch (e) {
        console.error("Weather fetch error:", e);
        setErrorMsg("Could not fetch weather");
      }
    }

    getWeather();

    // Set up periodic refresh without showing loading state
    const refreshInterval = setInterval(() => {
      getWeather();
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  // Format temperature range like "4°C - 3°C"
  const getTemperatureRange = (): string => {
    if (weatherInfo) {
      if (
        weatherInfo.maxTemperature !== undefined &&
        weatherInfo.minTemperature !== undefined
      ) {
        return `${Math.round(weatherInfo.maxTemperature)}°C – ${Math.round(
          weatherInfo.minTemperature
        )}°C`;
      } else {
        return `${Math.round(weatherInfo.temperature)}°C`;
      }
    }
    return "";
  };

  // Determine precipitation text
  const getPrecipitationText = (): string => {
    if (weatherInfo && weatherInfo.precipitation > 0 && weatherDesc) {
      // For demonstration - you might want to fetch actual precipitation duration
      const duration = "120 mins"; // This would ideally come from the API
      return `${weatherDesc.description.toLowerCase()} for ${duration}`;
    } else if (weatherDesc) {
      return weatherDesc.description;
    }
    return "";
  };

  if (errorMsg) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>Weather unavailable</ThemedText>
      </ThemedView>
    );
  }

  if (!weatherInfo || !weatherDesc) {
    return (
      <ThemedView style={styles.container}>
        <Text>{location}</Text>
        <View style={styles.weatherContent}>
          <View style={styles.weatherIcon} />
          <ThemedText style={styles.weatherText}>Weather updating...</ThemedText>
        </View>
        <ThemedText style={styles.temperatureText}>--°C</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Text>{location}</Text>
      <View style={styles.weatherContent}>
        <Image source={{ uri: weatherDesc.image }} style={styles.weatherIcon} />
        <ThemedText style={styles.weatherText}>
          {getPrecipitationText()}
        </ThemedText>
      </View>
      <ThemedText style={styles.temperatureText}>
        {getTemperatureRange()}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: "#d1dde8",
    marginBottom: 0,
  },
  weatherContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  weatherIcon: {
    width: 30,
    height: 30,
    marginRight: 6,
  },
  weatherText: {
    fontSize: 13,
  },
  temperatureText: {
    fontSize: 13,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 13,
    color: "#FF3B30",
  },
});
