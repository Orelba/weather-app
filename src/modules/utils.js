const utils = (() => {
  function convertCToF(tempInCelcius) {
    return Math.floor(tempInCelcius * 1.8 + 32)
  }

  function convertKmhToMph(speedInKmh) {
    return Math.floor(speedInKmh / 1.609344)
  }

  function convertMetersToKm(meters) {
    return Math.floor(meters / 1000)
  }

  function convertMetersToMiles(meters) {
    return Math.floor(meters * 0.00062137)
  }

  function convertToImperial(data) {
    const newData = {
      temperature: convertCToF(data.temperature),
      feelsLike: convertCToF(data.feelsLike),
      maxTemp: convertCToF(data.maxTemp),
      minTemp: convertCToF(data.minTemp),
      windSpeed: convertKmhToMph(data.windSpeed),
    } // TODO: continue this. also check what to do with roundData since there is Math.floor() in the conversion utilities
    console.log(newData)
  }

  function roundData(data) {

  }

  return {
    convertCToF,
    convertKmhToMph,
    convertMetersToKm,
    convertMetersToMiles,
    convertToImperial,
    roundData,
  }
})()

export default utils