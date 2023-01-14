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

  return {
    convertCToF,
    convertKmhToMph,
    convertMetersToKm,
    convertMetersToMiles,
  }
})()

export default utils