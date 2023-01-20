/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/modules/geolocation.js":
/*!************************************!*\
  !*** ./src/modules/geolocation.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function getPosition() {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 6000 })
  )
}

async function getUserPosition() {
  try {
    if (navigator.geolocation) {
      const position = await getPosition()
      const {
        coords: { latitude, longitude },
      } = position
      return { latitude, longitude }
    } else {
      throw new Error('Browser does not support geolocation')
    }
  } catch (error) {
    console.warn(`${error.message}, default location will be used.`)
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getUserPosition);

/***/ }),

/***/ "./src/modules/storage.js":
/*!********************************!*\
  !*** ./src/modules/storage.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const storage = (() => {
  function setSystemOfMeasurement(unitName) {
    localStorage.setItem('unit', unitName)
  }

  function getSystemOfMeasurement() {
    let chosenUnit = localStorage.getItem('unit')
    if (chosenUnit === 'metric' || chosenUnit === 'imperial') {
      return chosenUnit
    } else {
      setSystemOfMeasurement('metric')
      return localStorage.getItem('unit')
    }
  }

  return {
    setSystemOfMeasurement,
    getSystemOfMeasurement,
  }
})()

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (storage);

/***/ }),

/***/ "./src/modules/utils.js":
/*!******************************!*\
  !*** ./src/modules/utils.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const utils = (() => {
  function _shortenDecimal(number) {
    return Number((number).toFixed(2).replace(/[.,]00$/, ""))
  }

  function convertCToF(tempInCelcius) {
    return _shortenDecimal(tempInCelcius * 1.8 + 32)
  }

  function convertKmhToMph(speedInKmh) {
    return _shortenDecimal(speedInKmh / 1.609344)
  }

  function convertMetersToKm(meters) {
    return _shortenDecimal(meters / 1000)
  }

  function convertMetersToMiles(meters) {
    return _shortenDecimal(meters * 0.00062137)
  }

  function convertTimestampToDay(timestamp) {
    const date = new Date(timestamp * 1000)
    return date.toLocaleString('en-US', { weekday: 'long' })
  }

  function convertTimestampToHour(timestamp, timezone, hourFormat) {
    const format = (Number(hourFormat) == 12) ? true : false
    const date = new Date((timestamp + timezone) * 1000)
    return date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', timeZone: 'UTC', hour12: format })
  }

  function convertToImperial(data) {
    const convertedData = Object.assign({}, data, {
      temperature: convertCToF(data.temperature),
      feelsLike: convertCToF(data.feelsLike),
      maxTemp: convertCToF(data.maxTemp),
      minTemp: convertCToF(data.minTemp),
      windSpeed: convertKmhToMph(data.windSpeed),
      visibility: convertMetersToMiles(data.visibility),
      sunriseTimestamp: convertTimestampToHour(data.sunriseTimestamp, data.timezone, 12),
      sunsetTimestamp: convertTimestampToHour(data.sunsetTimestamp, data.timezone, 12),
    })
    return convertedData
  }

  function convertToMetric(data) {
    const convertedData = Object.assign({}, data, {
      visibility: convertMetersToKm(data.visibility),
      sunriseTimestamp: convertTimestampToHour(data.sunriseTimestamp, data.timezone, 24),
      sunsetTimestamp: convertTimestampToHour(data.sunsetTimestamp, data.timezone, 24),
    })
    return convertedData
  }

  return {
    convertTimestampToDay,
    convertToImperial,
    convertToMetric,
  }
})()

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (utils);

/***/ }),

/***/ "./src/modules/view.js":
/*!*****************************!*\
  !*** ./src/modules/view.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _weather__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./weather */ "./src/modules/weather.js");
/* harmony import */ var _geolocation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./geolocation */ "./src/modules/geolocation.js");
/* harmony import */ var _storage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./storage */ "./src/modules/storage.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils */ "./src/modules/utils.js");





const view = (() => {
  let lastFetchData;

  function initWebsite() {
    loadInitialData()
    renderUnitButton(_storage__WEBPACK_IMPORTED_MODULE_2__["default"].getSystemOfMeasurement())
    initSearchForm()
    initSystemOfMeasurementSwitch()
  }

  function removePreloadOverlay() {
    const overlay = document.querySelector('.preload-overlay')
    overlay.style.visibility = 'collapse'
    overlay.style.opacity = 0;
  }

  async function loadInitialData() {
    try {
      // Load default data (to be shown in the meantime if user hasn't yet allowed or blocked geolocation)
      const initialData = await _weather__WEBPACK_IMPORTED_MODULE_0__["default"].getData('New York')
      lastFetchData = Object.assign({}, initialData)
      renderView(convertData(initialData, _storage__WEBPACK_IMPORTED_MODULE_2__["default"].getSystemOfMeasurement()))
      removePreloadOverlay()

      // Switch to local data if user geolocation permission is granted
      const position = await (0,_geolocation__WEBPACK_IMPORTED_MODULE_1__["default"])()
      if (position !== undefined) {
        const data = await _weather__WEBPACK_IMPORTED_MODULE_0__["default"].getData(null, position)
        lastFetchData = Object.assign({}, data)
        renderView(convertData(data, _storage__WEBPACK_IMPORTED_MODULE_2__["default"].getSystemOfMeasurement()))
      }
    } catch (error) {
      console.error(error)
    } finally {
      removePreloadOverlay()
    }
  }

  function initSearchForm() {
    const searchForm = document.querySelector('form')
    searchForm.addEventListener('submit', searchLocation)
  }

  function renderSearchError(message) {
    const searchForm = document.querySelector('form')
    const errorSpan = document.createElement('span')

    errorSpan.classList.add('error')
    errorSpan.textContent = message

    searchForm.appendChild(errorSpan)
  }

  function removeSearchError() {
    const errorSpan = document.querySelector('span.error')
    if (errorSpan !== null) errorSpan.remove()
  }

  function renderSearchLoader() {
    const searchButton = document.querySelector('button[type="submit"]')
    const loaderSpan = document.createElement('span')
    loaderSpan.classList.add('loader')

    if (searchButton.getElementsByClassName('search-img')) {
      searchButton.removeChild(searchButton.children[0])
      searchButton.appendChild(loaderSpan)
    }
  }

  function removeSearchLoader() {
    const searchButton = document.querySelector('button[type="submit"]')
    const searchImg = document.createElement('img')
    searchImg.src = './images/search.svg'
    searchImg.height = 20
    searchImg.width = 20
    searchImg.alt = 'Search Button Icon'
    searchImg.classList.add('search-img')

    if (searchButton.getElementsByClassName('loader')) {
      searchButton.removeChild(searchButton.children[0])
      searchButton.appendChild(searchImg)
    }
  }

  async function searchLocation(e) {
    e.preventDefault()
    removeSearchError()
    try {
      const searchValue = document.querySelector('input[type="search"]').value.trim()
      if (searchValue === '') return renderSearchError('Please enter a location name')

      renderSearchLoader()

      const data = await _weather__WEBPACK_IMPORTED_MODULE_0__["default"].getData(searchValue)

      if (data.cod === 200) {
        lastFetchData = Object.assign({}, data)
        renderView(convertData(data, _storage__WEBPACK_IMPORTED_MODULE_2__["default"].getSystemOfMeasurement()))
      } else if (data.cod === '404' || data.cod === '400') {
        renderSearchError('No results found')
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      removeSearchLoader()
    }
  }

  function initSystemOfMeasurementSwitch() {
    const switchWrapper = document.querySelector('.switch-wrapper')
    switchWrapper.addEventListener('click', switchSystemOfMeasurement)
  }

  function switchSystemOfMeasurement(e) {
    const switchBtns = document.querySelectorAll('.switch-btn')
    const systemOfMeasurement = e.target.dataset.system

    _storage__WEBPACK_IMPORTED_MODULE_2__["default"].setSystemOfMeasurement(systemOfMeasurement)
    switchBtns.forEach(btn => btn.classList.remove('active'))
    e.target.classList.add('active')

    renderView(convertData(lastFetchData, systemOfMeasurement))
  }

  function getUnitSymbol(systemOfMeasurement, unitType) {
    const unitSymbols = {
      metric: {
        temp: '\u00B0C',
        speed: 'Km/h',
        distance: 'Km',
      },
      imperial: {
        temp: '\u00B0F',
        speed: 'Mph',
        distance: 'Mi',
      },
    }

    return unitSymbols[systemOfMeasurement][unitType]
  }

  function getWeatherIconURL(iconName) {
    const icons = {
      '01d': '01d',
      '01n': '01n',
      '02d': '02d',
      '02n': '02n',
      '03d': '03d_03n',
      '03n': '03d_03n',
      '04d': '04d_04n',
      '04n': '04d_04n',
      '09d': '09d_09n',
      '09n': '09d_09n',
      '10d': '10d',
      '10n': '10n',
      '11d': '11d',
      '11n': '11n',
      '13d': '13d_13n',
      '13n': '13d_13n',
      '50d': '50d_50n',
      '50n': '50d_50n',
    }
    const imgSrc = `images/weather_conditions/${icons[iconName]}.svg`

    return imgSrc
  }

  function convertData(data, outputMeasurementSystem) {
    if (outputMeasurementSystem === 'imperial') {
      const convertedData = _utils__WEBPACK_IMPORTED_MODULE_3__["default"].convertToImperial(data)
      return convertedData
    } else if (outputMeasurementSystem === 'metric') {
      const convertedData = _utils__WEBPACK_IMPORTED_MODULE_3__["default"].convertToMetric(data)
      return convertedData
    }
  }

  function renderView(data) {
    const measurementSystem = _storage__WEBPACK_IMPORTED_MODULE_2__["default"].getSystemOfMeasurement()
    const description = document.querySelector('.description')
    const conditionImg = document.querySelector('.condition')
    const city = document.querySelector('.city')
    const country = document.querySelector('.country')
    const temperature = document.querySelector('.temperature')
    const day = document.querySelector('.day')
    const minTemp = document.querySelector('.min-temp')
    const maxTemp = document.querySelector('.max-temp')
    const feelsLike = document.querySelector('.feels-like .temp')
    const humidity = document.querySelector('.humidity .percentage')
    const windSpeed = document.querySelector('.wind .speed')
    const visibility = document.querySelector('.visibility .distance')
    const sunrise = document.querySelector('.sunrise .time')
    const sunset = document.querySelector('.sunset .time')


    description.textContent = data.weatherDescription
    conditionImg.src = getWeatherIconURL(data.weatherIcon)
    city.textContent = data.cityName
    country.textContent = data.countryName
    day.textContent = _utils__WEBPACK_IMPORTED_MODULE_3__["default"].convertTimestampToDay(data.timeOfCalculation)
    temperature.textContent = Math.round(data.temperature) + getUnitSymbol(measurementSystem, 'temp')
    minTemp.textContent = Math.round(data.minTemp) + getUnitSymbol(measurementSystem, 'temp')
    maxTemp.textContent = Math.round(data.maxTemp) + getUnitSymbol(measurementSystem, 'temp')
    feelsLike.textContent = Math.round(data.feelsLike) + ' ' + getUnitSymbol(measurementSystem, 'temp')
    humidity.textContent = data.humidity
    windSpeed.textContent = Math.round(data.windSpeed) + ' ' + getUnitSymbol(measurementSystem, 'speed')
    visibility.textContent = Math.round(data.visibility) + ' ' + getUnitSymbol(measurementSystem, 'distance')
    sunrise.textContent = data.sunriseTimestamp
    sunset.textContent = data.sunsetTimestamp
  }

  function renderUnitButton(unit) {
    const cButton = document.querySelector('.celcius')
    const fButton = document.querySelector('.fahrenheit')

    if (unit === 'metric') {
      fButton.classList.remove('active')
      cButton.classList.add('active')
    } else if (unit === 'imperial') {
      cButton.classList.remove('active')
      fButton.classList.add('active')
    }
  }

  return { initWebsite }
})()

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (view);

/***/ }),

/***/ "./src/modules/weather.js":
/*!********************************!*\
  !*** ./src/modules/weather.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const weather = (() => {
  function filterData(data) {
    const {
      dt: timeOfCalculation,
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
      timezone,
      visibility,
      weather: [
        {
          main: weatherName,
          description: weatherDescription,
          icon: weatherIcon,
        },
      ],
      wind: { speed: windSpeed },
      cod,
    } = data

    return {
      timeOfCalculation,
      cityName,
      countryName,
      temperature,
      feelsLike,
      minTemp,
      maxTemp,
      humidity,
      sunriseTimestamp,
      sunsetTimestamp,
      timezone,
      visibility,
      windSpeed,
      weatherName,
      weatherDescription,
      weatherIcon,
      cod
    }
  }

  async function getData(cityName, coordinates) {
    const APIKey = '4a690db620f1dcc5aa19b64e38ecec86' // Not safe, but it's a free API key just for the purpose of this project.
    const apiURL = coordinates
      ? `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&units=metric&appid=${APIKey}`
      : `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${APIKey}`

    try {
      const response = await fetch(apiURL, { mode: 'cors' })
      const data = await response.json()
      if (data.cod === 200) return filterData(data)
      else return data
    } catch (error) {
      console.error('Fetch Error:', error.message)
    }
  }
  return { getData }
})()

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (weather);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _modules_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modules/view */ "./src/modules/view.js");


window.addEventListener('load', _modules_view__WEBPACK_IMPORTED_MODULE_0__["default"].initWebsite)

// TODO: Mobile optimization
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1gsQ0FBQztBQUNEO0FBQ0EsaUVBQWU7Ozs7OztVQ3JFZjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7O0FDTmlDO0FBQ2pDO0FBQ0EsZ0NBQWdDLGlFQUFnQjtBQUNoRDtBQUNBLDRCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvbW9kdWxlcy9nZW9sb2NhdGlvbi5qcyIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC8uL3NyYy9tb2R1bGVzL3N0b3JhZ2UuanMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvbW9kdWxlcy91dGlscy5qcyIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC8uL3NyYy9tb2R1bGVzL3ZpZXcuanMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvbW9kdWxlcy93ZWF0aGVyLmpzIiwid2VicGFjazovL3dlYXRoZXItYXBwL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3dlYXRoZXItYXBwL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3dlYXRoZXItYXBwL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gZ2V0UG9zaXRpb24oKSB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+XHJcbiAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKHJlc29sdmUsIHJlamVjdCwgeyB0aW1lb3V0OiA2MDAwIH0pXHJcbiAgKVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBnZXRVc2VyUG9zaXRpb24oKSB7XHJcbiAgdHJ5IHtcclxuICAgIGlmIChuYXZpZ2F0b3IuZ2VvbG9jYXRpb24pIHtcclxuICAgICAgY29uc3QgcG9zaXRpb24gPSBhd2FpdCBnZXRQb3NpdGlvbigpXHJcbiAgICAgIGNvbnN0IHtcclxuICAgICAgICBjb29yZHM6IHsgbGF0aXR1ZGUsIGxvbmdpdHVkZSB9LFxyXG4gICAgICB9ID0gcG9zaXRpb25cclxuICAgICAgcmV0dXJuIHsgbGF0aXR1ZGUsIGxvbmdpdHVkZSB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Jyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBnZW9sb2NhdGlvbicpXHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUud2FybihgJHtlcnJvci5tZXNzYWdlfSwgZGVmYXVsdCBsb2NhdGlvbiB3aWxsIGJlIHVzZWQuYClcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdldFVzZXJQb3NpdGlvbiIsImNvbnN0IHN0b3JhZ2UgPSAoKCkgPT4ge1xyXG4gIGZ1bmN0aW9uIHNldFN5c3RlbU9mTWVhc3VyZW1lbnQodW5pdE5hbWUpIHtcclxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1bml0JywgdW5pdE5hbWUpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRTeXN0ZW1PZk1lYXN1cmVtZW50KCkge1xyXG4gICAgbGV0IGNob3NlblVuaXQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndW5pdCcpXHJcbiAgICBpZiAoY2hvc2VuVW5pdCA9PT0gJ21ldHJpYycgfHwgY2hvc2VuVW5pdCA9PT0gJ2ltcGVyaWFsJykge1xyXG4gICAgICByZXR1cm4gY2hvc2VuVW5pdFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2V0U3lzdGVtT2ZNZWFzdXJlbWVudCgnbWV0cmljJylcclxuICAgICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1bml0JylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBzZXRTeXN0ZW1PZk1lYXN1cmVtZW50LFxyXG4gICAgZ2V0U3lzdGVtT2ZNZWFzdXJlbWVudCxcclxuICB9XHJcbn0pKClcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHN0b3JhZ2UiLCJjb25zdCB1dGlscyA9ICgoKSA9PiB7XHJcbiAgZnVuY3Rpb24gX3Nob3J0ZW5EZWNpbWFsKG51bWJlcikge1xyXG4gICAgcmV0dXJuIE51bWJlcigobnVtYmVyKS50b0ZpeGVkKDIpLnJlcGxhY2UoL1suLF0wMCQvLCBcIlwiKSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbnZlcnRDVG9GKHRlbXBJbkNlbGNpdXMpIHtcclxuICAgIHJldHVybiBfc2hvcnRlbkRlY2ltYWwodGVtcEluQ2VsY2l1cyAqIDEuOCArIDMyKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29udmVydEttaFRvTXBoKHNwZWVkSW5LbWgpIHtcclxuICAgIHJldHVybiBfc2hvcnRlbkRlY2ltYWwoc3BlZWRJbkttaCAvIDEuNjA5MzQ0KVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29udmVydE1ldGVyc1RvS20obWV0ZXJzKSB7XHJcbiAgICByZXR1cm4gX3Nob3J0ZW5EZWNpbWFsKG1ldGVycyAvIDEwMDApXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb252ZXJ0TWV0ZXJzVG9NaWxlcyhtZXRlcnMpIHtcclxuICAgIHJldHVybiBfc2hvcnRlbkRlY2ltYWwobWV0ZXJzICogMC4wMDA2MjEzNylcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbnZlcnRUaW1lc3RhbXBUb0RheSh0aW1lc3RhbXApIHtcclxuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh0aW1lc3RhbXAgKiAxMDAwKVxyXG4gICAgcmV0dXJuIGRhdGUudG9Mb2NhbGVTdHJpbmcoJ2VuLVVTJywgeyB3ZWVrZGF5OiAnbG9uZycgfSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbnZlcnRUaW1lc3RhbXBUb0hvdXIodGltZXN0YW1wLCB0aW1lem9uZSwgaG91ckZvcm1hdCkge1xyXG4gICAgY29uc3QgZm9ybWF0ID0gKE51bWJlcihob3VyRm9ybWF0KSA9PSAxMikgPyB0cnVlIDogZmFsc2VcclxuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgodGltZXN0YW1wICsgdGltZXpvbmUpICogMTAwMClcclxuICAgIHJldHVybiBkYXRlLnRvTG9jYWxlU3RyaW5nKCdlbi1VUycsIHsgaG91cjogJ251bWVyaWMnLCBtaW51dGU6ICdudW1lcmljJywgdGltZVpvbmU6ICdVVEMnLCBob3VyMTI6IGZvcm1hdCB9KVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29udmVydFRvSW1wZXJpYWwoZGF0YSkge1xyXG4gICAgY29uc3QgY29udmVydGVkRGF0YSA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGEsIHtcclxuICAgICAgdGVtcGVyYXR1cmU6IGNvbnZlcnRDVG9GKGRhdGEudGVtcGVyYXR1cmUpLFxyXG4gICAgICBmZWVsc0xpa2U6IGNvbnZlcnRDVG9GKGRhdGEuZmVlbHNMaWtlKSxcclxuICAgICAgbWF4VGVtcDogY29udmVydENUb0YoZGF0YS5tYXhUZW1wKSxcclxuICAgICAgbWluVGVtcDogY29udmVydENUb0YoZGF0YS5taW5UZW1wKSxcclxuICAgICAgd2luZFNwZWVkOiBjb252ZXJ0S21oVG9NcGgoZGF0YS53aW5kU3BlZWQpLFxyXG4gICAgICB2aXNpYmlsaXR5OiBjb252ZXJ0TWV0ZXJzVG9NaWxlcyhkYXRhLnZpc2liaWxpdHkpLFxyXG4gICAgICBzdW5yaXNlVGltZXN0YW1wOiBjb252ZXJ0VGltZXN0YW1wVG9Ib3VyKGRhdGEuc3VucmlzZVRpbWVzdGFtcCwgZGF0YS50aW1lem9uZSwgMTIpLFxyXG4gICAgICBzdW5zZXRUaW1lc3RhbXA6IGNvbnZlcnRUaW1lc3RhbXBUb0hvdXIoZGF0YS5zdW5zZXRUaW1lc3RhbXAsIGRhdGEudGltZXpvbmUsIDEyKSxcclxuICAgIH0pXHJcbiAgICByZXR1cm4gY29udmVydGVkRGF0YVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29udmVydFRvTWV0cmljKGRhdGEpIHtcclxuICAgIGNvbnN0IGNvbnZlcnRlZERhdGEgPSBPYmplY3QuYXNzaWduKHt9LCBkYXRhLCB7XHJcbiAgICAgIHZpc2liaWxpdHk6IGNvbnZlcnRNZXRlcnNUb0ttKGRhdGEudmlzaWJpbGl0eSksXHJcbiAgICAgIHN1bnJpc2VUaW1lc3RhbXA6IGNvbnZlcnRUaW1lc3RhbXBUb0hvdXIoZGF0YS5zdW5yaXNlVGltZXN0YW1wLCBkYXRhLnRpbWV6b25lLCAyNCksXHJcbiAgICAgIHN1bnNldFRpbWVzdGFtcDogY29udmVydFRpbWVzdGFtcFRvSG91cihkYXRhLnN1bnNldFRpbWVzdGFtcCwgZGF0YS50aW1lem9uZSwgMjQpLFxyXG4gICAgfSlcclxuICAgIHJldHVybiBjb252ZXJ0ZWREYXRhXHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgY29udmVydFRpbWVzdGFtcFRvRGF5LFxyXG4gICAgY29udmVydFRvSW1wZXJpYWwsXHJcbiAgICBjb252ZXJ0VG9NZXRyaWMsXHJcbiAgfVxyXG59KSgpXHJcblxyXG5leHBvcnQgZGVmYXVsdCB1dGlscyIsImltcG9ydCB3ZWF0aGVyIGZyb20gJy4vd2VhdGhlcidcclxuaW1wb3J0IGdldFVzZXJQb3NpdGlvbiBmcm9tICcuL2dlb2xvY2F0aW9uJ1xyXG5pbXBvcnQgc3RvcmFnZSBmcm9tICcuL3N0b3JhZ2UnXHJcbmltcG9ydCB1dGlscyBmcm9tICcuL3V0aWxzJ1xyXG5cclxuY29uc3QgdmlldyA9ICgoKSA9PiB7XHJcbiAgbGV0IGxhc3RGZXRjaERhdGE7XHJcblxyXG4gIGZ1bmN0aW9uIGluaXRXZWJzaXRlKCkge1xyXG4gICAgbG9hZEluaXRpYWxEYXRhKClcclxuICAgIHJlbmRlclVuaXRCdXR0b24oc3RvcmFnZS5nZXRTeXN0ZW1PZk1lYXN1cmVtZW50KCkpXHJcbiAgICBpbml0U2VhcmNoRm9ybSgpXHJcbiAgICBpbml0U3lzdGVtT2ZNZWFzdXJlbWVudFN3aXRjaCgpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW1vdmVQcmVsb2FkT3ZlcmxheSgpIHtcclxuICAgIGNvbnN0IG92ZXJsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlbG9hZC1vdmVybGF5JylcclxuICAgIG92ZXJsYXkuc3R5bGUudmlzaWJpbGl0eSA9ICdjb2xsYXBzZSdcclxuICAgIG92ZXJsYXkuc3R5bGUub3BhY2l0eSA9IDA7XHJcbiAgfVxyXG5cclxuICBhc3luYyBmdW5jdGlvbiBsb2FkSW5pdGlhbERhdGEoKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBMb2FkIGRlZmF1bHQgZGF0YSAodG8gYmUgc2hvd24gaW4gdGhlIG1lYW50aW1lIGlmIHVzZXIgaGFzbid0IHlldCBhbGxvd2VkIG9yIGJsb2NrZWQgZ2VvbG9jYXRpb24pXHJcbiAgICAgIGNvbnN0IGluaXRpYWxEYXRhID0gYXdhaXQgd2VhdGhlci5nZXREYXRhKCdOZXcgWW9yaycpXHJcbiAgICAgIGxhc3RGZXRjaERhdGEgPSBPYmplY3QuYXNzaWduKHt9LCBpbml0aWFsRGF0YSlcclxuICAgICAgcmVuZGVyVmlldyhjb252ZXJ0RGF0YShpbml0aWFsRGF0YSwgc3RvcmFnZS5nZXRTeXN0ZW1PZk1lYXN1cmVtZW50KCkpKVxyXG4gICAgICByZW1vdmVQcmVsb2FkT3ZlcmxheSgpXHJcblxyXG4gICAgICAvLyBTd2l0Y2ggdG8gbG9jYWwgZGF0YSBpZiB1c2VyIGdlb2xvY2F0aW9uIHBlcm1pc3Npb24gaXMgZ3JhbnRlZFxyXG4gICAgICBjb25zdCBwb3NpdGlvbiA9IGF3YWl0IGdldFVzZXJQb3NpdGlvbigpXHJcbiAgICAgIGlmIChwb3NpdGlvbiAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHdlYXRoZXIuZ2V0RGF0YShudWxsLCBwb3NpdGlvbilcclxuICAgICAgICBsYXN0RmV0Y2hEYXRhID0gT2JqZWN0LmFzc2lnbih7fSwgZGF0YSlcclxuICAgICAgICByZW5kZXJWaWV3KGNvbnZlcnREYXRhKGRhdGEsIHN0b3JhZ2UuZ2V0U3lzdGVtT2ZNZWFzdXJlbWVudCgpKSlcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihlcnJvcilcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHJlbW92ZVByZWxvYWRPdmVybGF5KClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGluaXRTZWFyY2hGb3JtKCkge1xyXG4gICAgY29uc3Qgc2VhcmNoRm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0nKVxyXG4gICAgc2VhcmNoRm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBzZWFyY2hMb2NhdGlvbilcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbmRlclNlYXJjaEVycm9yKG1lc3NhZ2UpIHtcclxuICAgIGNvbnN0IHNlYXJjaEZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdmb3JtJylcclxuICAgIGNvbnN0IGVycm9yU3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxyXG5cclxuICAgIGVycm9yU3Bhbi5jbGFzc0xpc3QuYWRkKCdlcnJvcicpXHJcbiAgICBlcnJvclNwYW4udGV4dENvbnRlbnQgPSBtZXNzYWdlXHJcblxyXG4gICAgc2VhcmNoRm9ybS5hcHBlbmRDaGlsZChlcnJvclNwYW4pXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW1vdmVTZWFyY2hFcnJvcigpIHtcclxuICAgIGNvbnN0IGVycm9yU3BhbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NwYW4uZXJyb3InKVxyXG4gICAgaWYgKGVycm9yU3BhbiAhPT0gbnVsbCkgZXJyb3JTcGFuLnJlbW92ZSgpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXJTZWFyY2hMb2FkZXIoKSB7XHJcbiAgICBjb25zdCBzZWFyY2hCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpXHJcbiAgICBjb25zdCBsb2FkZXJTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXHJcbiAgICBsb2FkZXJTcGFuLmNsYXNzTGlzdC5hZGQoJ2xvYWRlcicpXHJcblxyXG4gICAgaWYgKHNlYXJjaEJ1dHRvbi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzZWFyY2gtaW1nJykpIHtcclxuICAgICAgc2VhcmNoQnV0dG9uLnJlbW92ZUNoaWxkKHNlYXJjaEJ1dHRvbi5jaGlsZHJlblswXSlcclxuICAgICAgc2VhcmNoQnV0dG9uLmFwcGVuZENoaWxkKGxvYWRlclNwYW4pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW1vdmVTZWFyY2hMb2FkZXIoKSB7XHJcbiAgICBjb25zdCBzZWFyY2hCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpXHJcbiAgICBjb25zdCBzZWFyY2hJbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKVxyXG4gICAgc2VhcmNoSW1nLnNyYyA9ICcuL2ltYWdlcy9zZWFyY2guc3ZnJ1xyXG4gICAgc2VhcmNoSW1nLmhlaWdodCA9IDIwXHJcbiAgICBzZWFyY2hJbWcud2lkdGggPSAyMFxyXG4gICAgc2VhcmNoSW1nLmFsdCA9ICdTZWFyY2ggQnV0dG9uIEljb24nXHJcbiAgICBzZWFyY2hJbWcuY2xhc3NMaXN0LmFkZCgnc2VhcmNoLWltZycpXHJcblxyXG4gICAgaWYgKHNlYXJjaEJ1dHRvbi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdsb2FkZXInKSkge1xyXG4gICAgICBzZWFyY2hCdXR0b24ucmVtb3ZlQ2hpbGQoc2VhcmNoQnV0dG9uLmNoaWxkcmVuWzBdKVxyXG4gICAgICBzZWFyY2hCdXR0b24uYXBwZW5kQ2hpbGQoc2VhcmNoSW1nKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gc2VhcmNoTG9jYXRpb24oZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICByZW1vdmVTZWFyY2hFcnJvcigpXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBzZWFyY2hWYWx1ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJzZWFyY2hcIl0nKS52YWx1ZS50cmltKClcclxuICAgICAgaWYgKHNlYXJjaFZhbHVlID09PSAnJykgcmV0dXJuIHJlbmRlclNlYXJjaEVycm9yKCdQbGVhc2UgZW50ZXIgYSBsb2NhdGlvbiBuYW1lJylcclxuXHJcbiAgICAgIHJlbmRlclNlYXJjaExvYWRlcigpXHJcblxyXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgd2VhdGhlci5nZXREYXRhKHNlYXJjaFZhbHVlKVxyXG5cclxuICAgICAgaWYgKGRhdGEuY29kID09PSAyMDApIHtcclxuICAgICAgICBsYXN0RmV0Y2hEYXRhID0gT2JqZWN0LmFzc2lnbih7fSwgZGF0YSlcclxuICAgICAgICByZW5kZXJWaWV3KGNvbnZlcnREYXRhKGRhdGEsIHN0b3JhZ2UuZ2V0U3lzdGVtT2ZNZWFzdXJlbWVudCgpKSlcclxuICAgICAgfSBlbHNlIGlmIChkYXRhLmNvZCA9PT0gJzQwNCcgfHwgZGF0YS5jb2QgPT09ICc0MDAnKSB7XHJcbiAgICAgICAgcmVuZGVyU2VhcmNoRXJyb3IoJ05vIHJlc3VsdHMgZm91bmQnKVxyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdTZWFyY2ggZXJyb3I6JywgZXJyb3IpXHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICByZW1vdmVTZWFyY2hMb2FkZXIoKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdFN5c3RlbU9mTWVhc3VyZW1lbnRTd2l0Y2goKSB7XHJcbiAgICBjb25zdCBzd2l0Y2hXcmFwcGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnN3aXRjaC13cmFwcGVyJylcclxuICAgIHN3aXRjaFdyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzd2l0Y2hTeXN0ZW1PZk1lYXN1cmVtZW50KVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc3dpdGNoU3lzdGVtT2ZNZWFzdXJlbWVudChlKSB7XHJcbiAgICBjb25zdCBzd2l0Y2hCdG5zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnN3aXRjaC1idG4nKVxyXG4gICAgY29uc3Qgc3lzdGVtT2ZNZWFzdXJlbWVudCA9IGUudGFyZ2V0LmRhdGFzZXQuc3lzdGVtXHJcblxyXG4gICAgc3RvcmFnZS5zZXRTeXN0ZW1PZk1lYXN1cmVtZW50KHN5c3RlbU9mTWVhc3VyZW1lbnQpXHJcbiAgICBzd2l0Y2hCdG5zLmZvckVhY2goYnRuID0+IGJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKSlcclxuICAgIGUudGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpXHJcblxyXG4gICAgcmVuZGVyVmlldyhjb252ZXJ0RGF0YShsYXN0RmV0Y2hEYXRhLCBzeXN0ZW1PZk1lYXN1cmVtZW50KSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFVuaXRTeW1ib2woc3lzdGVtT2ZNZWFzdXJlbWVudCwgdW5pdFR5cGUpIHtcclxuICAgIGNvbnN0IHVuaXRTeW1ib2xzID0ge1xyXG4gICAgICBtZXRyaWM6IHtcclxuICAgICAgICB0ZW1wOiAnXFx1MDBCMEMnLFxyXG4gICAgICAgIHNwZWVkOiAnS20vaCcsXHJcbiAgICAgICAgZGlzdGFuY2U6ICdLbScsXHJcbiAgICAgIH0sXHJcbiAgICAgIGltcGVyaWFsOiB7XHJcbiAgICAgICAgdGVtcDogJ1xcdTAwQjBGJyxcclxuICAgICAgICBzcGVlZDogJ01waCcsXHJcbiAgICAgICAgZGlzdGFuY2U6ICdNaScsXHJcbiAgICAgIH0sXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHVuaXRTeW1ib2xzW3N5c3RlbU9mTWVhc3VyZW1lbnRdW3VuaXRUeXBlXVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0V2VhdGhlckljb25VUkwoaWNvbk5hbWUpIHtcclxuICAgIGNvbnN0IGljb25zID0ge1xyXG4gICAgICAnMDFkJzogJzAxZCcsXHJcbiAgICAgICcwMW4nOiAnMDFuJyxcclxuICAgICAgJzAyZCc6ICcwMmQnLFxyXG4gICAgICAnMDJuJzogJzAybicsXHJcbiAgICAgICcwM2QnOiAnMDNkXzAzbicsXHJcbiAgICAgICcwM24nOiAnMDNkXzAzbicsXHJcbiAgICAgICcwNGQnOiAnMDRkXzA0bicsXHJcbiAgICAgICcwNG4nOiAnMDRkXzA0bicsXHJcbiAgICAgICcwOWQnOiAnMDlkXzA5bicsXHJcbiAgICAgICcwOW4nOiAnMDlkXzA5bicsXHJcbiAgICAgICcxMGQnOiAnMTBkJyxcclxuICAgICAgJzEwbic6ICcxMG4nLFxyXG4gICAgICAnMTFkJzogJzExZCcsXHJcbiAgICAgICcxMW4nOiAnMTFuJyxcclxuICAgICAgJzEzZCc6ICcxM2RfMTNuJyxcclxuICAgICAgJzEzbic6ICcxM2RfMTNuJyxcclxuICAgICAgJzUwZCc6ICc1MGRfNTBuJyxcclxuICAgICAgJzUwbic6ICc1MGRfNTBuJyxcclxuICAgIH1cclxuICAgIGNvbnN0IGltZ1NyYyA9IGBpbWFnZXMvd2VhdGhlcl9jb25kaXRpb25zLyR7aWNvbnNbaWNvbk5hbWVdfS5zdmdgXHJcblxyXG4gICAgcmV0dXJuIGltZ1NyY1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29udmVydERhdGEoZGF0YSwgb3V0cHV0TWVhc3VyZW1lbnRTeXN0ZW0pIHtcclxuICAgIGlmIChvdXRwdXRNZWFzdXJlbWVudFN5c3RlbSA9PT0gJ2ltcGVyaWFsJykge1xyXG4gICAgICBjb25zdCBjb252ZXJ0ZWREYXRhID0gdXRpbHMuY29udmVydFRvSW1wZXJpYWwoZGF0YSlcclxuICAgICAgcmV0dXJuIGNvbnZlcnRlZERhdGFcclxuICAgIH0gZWxzZSBpZiAob3V0cHV0TWVhc3VyZW1lbnRTeXN0ZW0gPT09ICdtZXRyaWMnKSB7XHJcbiAgICAgIGNvbnN0IGNvbnZlcnRlZERhdGEgPSB1dGlscy5jb252ZXJ0VG9NZXRyaWMoZGF0YSlcclxuICAgICAgcmV0dXJuIGNvbnZlcnRlZERhdGFcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbmRlclZpZXcoZGF0YSkge1xyXG4gICAgY29uc3QgbWVhc3VyZW1lbnRTeXN0ZW0gPSBzdG9yYWdlLmdldFN5c3RlbU9mTWVhc3VyZW1lbnQoKVxyXG4gICAgY29uc3QgZGVzY3JpcHRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZGVzY3JpcHRpb24nKVxyXG4gICAgY29uc3QgY29uZGl0aW9uSW1nID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbmRpdGlvbicpXHJcbiAgICBjb25zdCBjaXR5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNpdHknKVxyXG4gICAgY29uc3QgY291bnRyeSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb3VudHJ5JylcclxuICAgIGNvbnN0IHRlbXBlcmF0dXJlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRlbXBlcmF0dXJlJylcclxuICAgIGNvbnN0IGRheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kYXknKVxyXG4gICAgY29uc3QgbWluVGVtcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5taW4tdGVtcCcpXHJcbiAgICBjb25zdCBtYXhUZW1wID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1heC10ZW1wJylcclxuICAgIGNvbnN0IGZlZWxzTGlrZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5mZWVscy1saWtlIC50ZW1wJylcclxuICAgIGNvbnN0IGh1bWlkaXR5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmh1bWlkaXR5IC5wZXJjZW50YWdlJylcclxuICAgIGNvbnN0IHdpbmRTcGVlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy53aW5kIC5zcGVlZCcpXHJcbiAgICBjb25zdCB2aXNpYmlsaXR5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnZpc2liaWxpdHkgLmRpc3RhbmNlJylcclxuICAgIGNvbnN0IHN1bnJpc2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc3VucmlzZSAudGltZScpXHJcbiAgICBjb25zdCBzdW5zZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc3Vuc2V0IC50aW1lJylcclxuXHJcblxyXG4gICAgZGVzY3JpcHRpb24udGV4dENvbnRlbnQgPSBkYXRhLndlYXRoZXJEZXNjcmlwdGlvblxyXG4gICAgY29uZGl0aW9uSW1nLnNyYyA9IGdldFdlYXRoZXJJY29uVVJMKGRhdGEud2VhdGhlckljb24pXHJcbiAgICBjaXR5LnRleHRDb250ZW50ID0gZGF0YS5jaXR5TmFtZVxyXG4gICAgY291bnRyeS50ZXh0Q29udGVudCA9IGRhdGEuY291bnRyeU5hbWVcclxuICAgIGRheS50ZXh0Q29udGVudCA9IHV0aWxzLmNvbnZlcnRUaW1lc3RhbXBUb0RheShkYXRhLnRpbWVPZkNhbGN1bGF0aW9uKVxyXG4gICAgdGVtcGVyYXR1cmUudGV4dENvbnRlbnQgPSBNYXRoLnJvdW5kKGRhdGEudGVtcGVyYXR1cmUpICsgZ2V0VW5pdFN5bWJvbChtZWFzdXJlbWVudFN5c3RlbSwgJ3RlbXAnKVxyXG4gICAgbWluVGVtcC50ZXh0Q29udGVudCA9IE1hdGgucm91bmQoZGF0YS5taW5UZW1wKSArIGdldFVuaXRTeW1ib2wobWVhc3VyZW1lbnRTeXN0ZW0sICd0ZW1wJylcclxuICAgIG1heFRlbXAudGV4dENvbnRlbnQgPSBNYXRoLnJvdW5kKGRhdGEubWF4VGVtcCkgKyBnZXRVbml0U3ltYm9sKG1lYXN1cmVtZW50U3lzdGVtLCAndGVtcCcpXHJcbiAgICBmZWVsc0xpa2UudGV4dENvbnRlbnQgPSBNYXRoLnJvdW5kKGRhdGEuZmVlbHNMaWtlKSArICcgJyArIGdldFVuaXRTeW1ib2wobWVhc3VyZW1lbnRTeXN0ZW0sICd0ZW1wJylcclxuICAgIGh1bWlkaXR5LnRleHRDb250ZW50ID0gZGF0YS5odW1pZGl0eVxyXG4gICAgd2luZFNwZWVkLnRleHRDb250ZW50ID0gTWF0aC5yb3VuZChkYXRhLndpbmRTcGVlZCkgKyAnICcgKyBnZXRVbml0U3ltYm9sKG1lYXN1cmVtZW50U3lzdGVtLCAnc3BlZWQnKVxyXG4gICAgdmlzaWJpbGl0eS50ZXh0Q29udGVudCA9IE1hdGgucm91bmQoZGF0YS52aXNpYmlsaXR5KSArICcgJyArIGdldFVuaXRTeW1ib2wobWVhc3VyZW1lbnRTeXN0ZW0sICdkaXN0YW5jZScpXHJcbiAgICBzdW5yaXNlLnRleHRDb250ZW50ID0gZGF0YS5zdW5yaXNlVGltZXN0YW1wXHJcbiAgICBzdW5zZXQudGV4dENvbnRlbnQgPSBkYXRhLnN1bnNldFRpbWVzdGFtcFxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVuZGVyVW5pdEJ1dHRvbih1bml0KSB7XHJcbiAgICBjb25zdCBjQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNlbGNpdXMnKVxyXG4gICAgY29uc3QgZkJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5mYWhyZW5oZWl0JylcclxuXHJcbiAgICBpZiAodW5pdCA9PT0gJ21ldHJpYycpIHtcclxuICAgICAgZkJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKVxyXG4gICAgICBjQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpXHJcbiAgICB9IGVsc2UgaWYgKHVuaXQgPT09ICdpbXBlcmlhbCcpIHtcclxuICAgICAgY0J1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKVxyXG4gICAgICBmQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4geyBpbml0V2Vic2l0ZSB9XHJcbn0pKClcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHZpZXciLCJjb25zdCB3ZWF0aGVyID0gKCgpID0+IHtcclxuICBmdW5jdGlvbiBmaWx0ZXJEYXRhKGRhdGEpIHtcclxuICAgIGNvbnN0IHtcclxuICAgICAgZHQ6IHRpbWVPZkNhbGN1bGF0aW9uLFxyXG4gICAgICBuYW1lOiBjaXR5TmFtZSxcclxuICAgICAgbWFpbjoge1xyXG4gICAgICAgIHRlbXA6IHRlbXBlcmF0dXJlLFxyXG4gICAgICAgIGZlZWxzX2xpa2U6IGZlZWxzTGlrZSxcclxuICAgICAgICB0ZW1wX21pbjogbWluVGVtcCxcclxuICAgICAgICB0ZW1wX21heDogbWF4VGVtcCxcclxuICAgICAgICBodW1pZGl0eSxcclxuICAgICAgfSxcclxuICAgICAgc3lzOiB7XHJcbiAgICAgICAgY291bnRyeTogY291bnRyeU5hbWUsXHJcbiAgICAgICAgc3VucmlzZTogc3VucmlzZVRpbWVzdGFtcCxcclxuICAgICAgICBzdW5zZXQ6IHN1bnNldFRpbWVzdGFtcCxcclxuICAgICAgfSxcclxuICAgICAgdGltZXpvbmUsXHJcbiAgICAgIHZpc2liaWxpdHksXHJcbiAgICAgIHdlYXRoZXI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBtYWluOiB3ZWF0aGVyTmFtZSxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiB3ZWF0aGVyRGVzY3JpcHRpb24sXHJcbiAgICAgICAgICBpY29uOiB3ZWF0aGVySWNvbixcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgICB3aW5kOiB7IHNwZWVkOiB3aW5kU3BlZWQgfSxcclxuICAgICAgY29kLFxyXG4gICAgfSA9IGRhdGFcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0aW1lT2ZDYWxjdWxhdGlvbixcclxuICAgICAgY2l0eU5hbWUsXHJcbiAgICAgIGNvdW50cnlOYW1lLFxyXG4gICAgICB0ZW1wZXJhdHVyZSxcclxuICAgICAgZmVlbHNMaWtlLFxyXG4gICAgICBtaW5UZW1wLFxyXG4gICAgICBtYXhUZW1wLFxyXG4gICAgICBodW1pZGl0eSxcclxuICAgICAgc3VucmlzZVRpbWVzdGFtcCxcclxuICAgICAgc3Vuc2V0VGltZXN0YW1wLFxyXG4gICAgICB0aW1lem9uZSxcclxuICAgICAgdmlzaWJpbGl0eSxcclxuICAgICAgd2luZFNwZWVkLFxyXG4gICAgICB3ZWF0aGVyTmFtZSxcclxuICAgICAgd2VhdGhlckRlc2NyaXB0aW9uLFxyXG4gICAgICB3ZWF0aGVySWNvbixcclxuICAgICAgY29kXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBmdW5jdGlvbiBnZXREYXRhKGNpdHlOYW1lLCBjb29yZGluYXRlcykge1xyXG4gICAgY29uc3QgQVBJS2V5ID0gJzRhNjkwZGI2MjBmMWRjYzVhYTE5YjY0ZTM4ZWNlYzg2JyAvLyBOb3Qgc2FmZSwgYnV0IGl0J3MgYSBmcmVlIEFQSSBrZXkganVzdCBmb3IgdGhlIHB1cnBvc2Ugb2YgdGhpcyBwcm9qZWN0LlxyXG4gICAgY29uc3QgYXBpVVJMID0gY29vcmRpbmF0ZXNcclxuICAgICAgPyBgaHR0cHM6Ly9hcGkub3BlbndlYXRoZXJtYXAub3JnL2RhdGEvMi41L3dlYXRoZXI/bGF0PSR7Y29vcmRpbmF0ZXMubGF0aXR1ZGV9Jmxvbj0ke2Nvb3JkaW5hdGVzLmxvbmdpdHVkZX0mdW5pdHM9bWV0cmljJmFwcGlkPSR7QVBJS2V5fWBcclxuICAgICAgOiBgaHR0cHM6Ly9hcGkub3BlbndlYXRoZXJtYXAub3JnL2RhdGEvMi41L3dlYXRoZXI/cT0ke2VuY29kZVVSSUNvbXBvbmVudChjaXR5TmFtZSl9JnVuaXRzPW1ldHJpYyZhcHBpZD0ke0FQSUtleX1gXHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChhcGlVUkwsIHsgbW9kZTogJ2NvcnMnIH0pXHJcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKClcclxuICAgICAgaWYgKGRhdGEuY29kID09PSAyMDApIHJldHVybiBmaWx0ZXJEYXRhKGRhdGEpXHJcbiAgICAgIGVsc2UgcmV0dXJuIGRhdGFcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZldGNoIEVycm9yOicsIGVycm9yLm1lc3NhZ2UpXHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiB7IGdldERhdGEgfVxyXG59KSgpXHJcblxyXG5leHBvcnQgZGVmYXVsdCB3ZWF0aGVyIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgdmlldyBmcm9tICcuL21vZHVsZXMvdmlldydcclxuXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgdmlldy5pbml0V2Vic2l0ZSlcclxuXHJcbi8vIFRPRE86IE1vYmlsZSBvcHRpbWl6YXRpb24iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=