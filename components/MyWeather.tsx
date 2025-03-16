import { useState, useEffect } from "react";
import { Platform, Text, View, StyleSheet, Image } from "react-native";
//import * as Device from "expo-device";
import * as Location from "expo-location";
import { fetchWeatherApi } from "openmeteo";
import { weatherDict, WeatherDescription } from "@/constants/weather";

interface Weather {
  temperature: number;
  precipitation: number;
  weatherCode: number;
}

export default function MyLocation() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [weatherInfo, setWeather] = useState<Weather>();
  const isDaytime = new Date().getHours() >= 6 && new Date().getHours() < 18;
  const [weatherDesc, setWeatherDesc] = useState<WeatherDescription>();
  const [location, setLocation] = useState("unknown");

  async function getCurrentLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync();
    return location;
  }

  useEffect(() => {
    async function getWeather() {
      try {
        const myLocation = await getCurrentLocation();

        if (myLocation) {
          console.log(myLocation);
          const { latitude, longitude } = myLocation.coords;
          const city = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });
          console.log(longitude, latitude);
          /*if (city) {
            setLocation(JSON.stringify(city[0]["city"]).replace(/"/g, ""));
          }*/
          const params = {
            // Vancouver
            //latitude: 49.28273,
            //longitude: -123.120735,

            latitude: latitude,
            longitude: longitude,

            current: ["temperature_2m", "precipitation", "weather_code"],
          };
          const url = "https://api.open-meteo.com/v1/forecast";
          const responses = await fetchWeatherApi(url, params);

          const response = responses[0];
          const current = response.current()!;

          const temperature = current.variables(0)!.value();
          const precipitation = current.variables(1)!.value();
          const weatherCode = current.variables(2)!.value();

          // Note: The order of weather variables in the URL query and the indices below need to match!
          const weatherData = {
            precipitation: precipitation,
            temperature: temperature,
            weatherCode: weatherCode,
          };
          setWeatherDesc(
            weatherDict[weatherCode.toString()][isDaytime ? "day" : "night"]
          );
          setWeather(weatherData);

          console.log(weatherData);
        }
      } catch (e) {
        setErrorMsg("");
      }
    }

    getWeather();
  }, []);

  let text = "Waiting...";
  if (errorMsg) {
    text = errorMsg;
  }

  return (
    <View style={styles.container}>
      {errorMsg && <Text style={styles.paragraph}>{text}</Text>}

      {weatherInfo && (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={{ uri: weatherDesc?.image }}
            style={styles.weatherImage}
          />
          <View style={{ flexDirection: "column" }}>
            <Text>{location}</Text>
            <Text>Weather: {weatherDesc?.description}</Text>
            <Text>Temperature: {weatherInfo.temperature.toFixed(0)}°C</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  paragraph: {
    fontSize: 18,
    textAlign: "center",
  },
  weatherImage: {
    width: 50,
    height: 50,
    borderWidth: 1,
    backgroundColor: "white",
    marginRight: 10,
  },
});
