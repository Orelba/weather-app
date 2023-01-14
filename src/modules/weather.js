const weather = (() => {
  function filterData(data) {
    const {
      name: cityName,
      main: {
        temp: temperature,
        feels_like: feelsLike,
        temp_min: minTemp,
        temp_max: maxTemp,
        humidity,
      },
      sys: {
        country: countryName,
        sunrise: sunriseTimestamp,
        sunset: sunsetTimestamp,
      },
      wind: { speed: windSpeed },
      weather: [
        {
          main: weatherName,
          description: weatherDescription,
          icon: weatherIcon,
        },
      ],
    } = data
    return {
      cityName,
      countryName,
      temperature,
      feelsLike,
      minTemp,
      maxTemp,
      humidity,
      sunriseTimestamp,
      sunsetTimestamp,
      windSpeed,
      weatherName,
      weatherDescription,
      weatherIcon,
    }
  }

  async function getData(cityName, coordinates) {
    const API_KEY = '4a690db620f1dcc5aa19b64e38ecec86' // Not safe, but it's a free API key just for the purpose of this project.
    const apiURL = coordinates
      ? `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&units=metric&appid=${API_KEY}`
      : `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${API_KEY}`

    try {
      const response = await fetch(apiURL, { mode: 'cors' })
      const data = await response.json()
      if (data.cod === 200) return filterData(data)
      throw new Error(data.message)
    } catch (error) {
      console.error(error)
    }
  }

  return { getData }
})()

export default weather