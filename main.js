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

  async function loadInitialData() {
    try {
      // Load default data (to be shown in the meantime if user hasn't yet allowed or blocked geolocation)
      const initialData = await _weather__WEBPACK_IMPORTED_MODULE_0__["default"].getData('New York')
      lastFetchData = Object.assign({}, initialData)
      renderView(convertData(initialData, _storage__WEBPACK_IMPORTED_MODULE_2__["default"].getSystemOfMeasurement()))
      document.body.classList.remove('preload') // TODO: Insert the loading animation to preload

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
      document.body.classList.remove('preload')
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

  async function searchLocation(e) {
    e.preventDefault()
    removeSearchError()

    try {
      const searchValue = document.querySelector('input[type="search"]').value.trim()
      if (searchValue === '') return renderSearchError('Please enter a location name')

      const data = await _weather__WEBPACK_IMPORTED_MODULE_0__["default"].getData(searchValue)

      if (data.cod === 200) {
        lastFetchData = Object.assign({}, data)
        renderView(convertData(data, _storage__WEBPACK_IMPORTED_MODULE_2__["default"].getSystemOfMeasurement()))
      } else if (data.cod === '404' || data.cod === '400') {
        renderSearchError('No results found')
      }
    } catch (error) {
      console.error('Search error:', error)
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
/* harmony import */ var _modules_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./modules/utils */ "./src/modules/utils.js");



window.addEventListener('load', _modules_view__WEBPACK_IMPORTED_MODULE_0__["default"].initWebsite)

// FIX: If span.error text gets too long it goes up
// TODO: Add loading animations
// TODO: Mobile optimization
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7OztBQ05pQztBQUNFO0FBQ25DO0FBQ0EsZ0NBQWdDLGlFQUFnQjtBQUNoRDtBQUNBO0FBQ0E7QUFDQSw0QiIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYXRoZXItYXBwLy4vc3JjL21vZHVsZXMvZ2VvbG9jYXRpb24uanMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvbW9kdWxlcy9zdG9yYWdlLmpzIiwid2VicGFjazovL3dlYXRoZXItYXBwLy4vc3JjL21vZHVsZXMvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvbW9kdWxlcy92aWV3LmpzIiwid2VicGFjazovL3dlYXRoZXItYXBwLy4vc3JjL21vZHVsZXMvd2VhdGhlci5qcyIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3dlYXRoZXItYXBwLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIGdldFBvc2l0aW9uKCkge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxyXG4gICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihyZXNvbHZlLCByZWplY3QsIHsgdGltZW91dDogNjAwMCB9KVxyXG4gIClcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZ2V0VXNlclBvc2l0aW9uKCkge1xyXG4gIHRyeSB7XHJcbiAgICBpZiAobmF2aWdhdG9yLmdlb2xvY2F0aW9uKSB7XHJcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gYXdhaXQgZ2V0UG9zaXRpb24oKVxyXG4gICAgICBjb25zdCB7XHJcbiAgICAgICAgY29vcmRzOiB7IGxhdGl0dWRlLCBsb25naXR1ZGUgfSxcclxuICAgICAgfSA9IHBvc2l0aW9uXHJcbiAgICAgIHJldHVybiB7IGxhdGl0dWRlLCBsb25naXR1ZGUgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdCcm93c2VyIGRvZXMgbm90IHN1cHBvcnQgZ2VvbG9jYXRpb24nKVxyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLndhcm4oYCR7ZXJyb3IubWVzc2FnZX0sIGRlZmF1bHQgbG9jYXRpb24gd2lsbCBiZSB1c2VkLmApXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnZXRVc2VyUG9zaXRpb24iLCJjb25zdCBzdG9yYWdlID0gKCgpID0+IHtcclxuICBmdW5jdGlvbiBzZXRTeXN0ZW1PZk1lYXN1cmVtZW50KHVuaXROYW1lKSB7XHJcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndW5pdCcsIHVuaXROYW1lKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0U3lzdGVtT2ZNZWFzdXJlbWVudCgpIHtcclxuICAgIGxldCBjaG9zZW5Vbml0ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VuaXQnKVxyXG4gICAgaWYgKGNob3NlblVuaXQgPT09ICdtZXRyaWMnIHx8IGNob3NlblVuaXQgPT09ICdpbXBlcmlhbCcpIHtcclxuICAgICAgcmV0dXJuIGNob3NlblVuaXRcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNldFN5c3RlbU9mTWVhc3VyZW1lbnQoJ21ldHJpYycpXHJcbiAgICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndW5pdCcpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgc2V0U3lzdGVtT2ZNZWFzdXJlbWVudCxcclxuICAgIGdldFN5c3RlbU9mTWVhc3VyZW1lbnQsXHJcbiAgfVxyXG59KSgpXHJcblxyXG5leHBvcnQgZGVmYXVsdCBzdG9yYWdlIiwiY29uc3QgdXRpbHMgPSAoKCkgPT4ge1xyXG4gIGZ1bmN0aW9uIF9zaG9ydGVuRGVjaW1hbChudW1iZXIpIHtcclxuICAgIHJldHVybiBOdW1iZXIoKG51bWJlcikudG9GaXhlZCgyKS5yZXBsYWNlKC9bLixdMDAkLywgXCJcIikpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb252ZXJ0Q1RvRih0ZW1wSW5DZWxjaXVzKSB7XHJcbiAgICByZXR1cm4gX3Nob3J0ZW5EZWNpbWFsKHRlbXBJbkNlbGNpdXMgKiAxLjggKyAzMilcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbnZlcnRLbWhUb01waChzcGVlZEluS21oKSB7XHJcbiAgICByZXR1cm4gX3Nob3J0ZW5EZWNpbWFsKHNwZWVkSW5LbWggLyAxLjYwOTM0NClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbnZlcnRNZXRlcnNUb0ttKG1ldGVycykge1xyXG4gICAgcmV0dXJuIF9zaG9ydGVuRGVjaW1hbChtZXRlcnMgLyAxMDAwKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29udmVydE1ldGVyc1RvTWlsZXMobWV0ZXJzKSB7XHJcbiAgICByZXR1cm4gX3Nob3J0ZW5EZWNpbWFsKG1ldGVycyAqIDAuMDAwNjIxMzcpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb252ZXJ0VGltZXN0YW1wVG9EYXkodGltZXN0YW1wKSB7XHJcbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUodGltZXN0YW1wICogMTAwMClcclxuICAgIHJldHVybiBkYXRlLnRvTG9jYWxlU3RyaW5nKCdlbi1VUycsIHsgd2Vla2RheTogJ2xvbmcnIH0pXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb252ZXJ0VGltZXN0YW1wVG9Ib3VyKHRpbWVzdGFtcCwgdGltZXpvbmUsIGhvdXJGb3JtYXQpIHtcclxuICAgIGNvbnN0IGZvcm1hdCA9IChOdW1iZXIoaG91ckZvcm1hdCkgPT0gMTIpID8gdHJ1ZSA6IGZhbHNlXHJcbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKHRpbWVzdGFtcCArIHRpbWV6b25lKSAqIDEwMDApXHJcbiAgICByZXR1cm4gZGF0ZS50b0xvY2FsZVN0cmluZygnZW4tVVMnLCB7IGhvdXI6ICdudW1lcmljJywgbWludXRlOiAnbnVtZXJpYycsIHRpbWVab25lOiAnVVRDJywgaG91cjEyOiBmb3JtYXQgfSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbnZlcnRUb0ltcGVyaWFsKGRhdGEpIHtcclxuICAgIGNvbnN0IGNvbnZlcnRlZERhdGEgPSBPYmplY3QuYXNzaWduKHt9LCBkYXRhLCB7XHJcbiAgICAgIHRlbXBlcmF0dXJlOiBjb252ZXJ0Q1RvRihkYXRhLnRlbXBlcmF0dXJlKSxcclxuICAgICAgZmVlbHNMaWtlOiBjb252ZXJ0Q1RvRihkYXRhLmZlZWxzTGlrZSksXHJcbiAgICAgIG1heFRlbXA6IGNvbnZlcnRDVG9GKGRhdGEubWF4VGVtcCksXHJcbiAgICAgIG1pblRlbXA6IGNvbnZlcnRDVG9GKGRhdGEubWluVGVtcCksXHJcbiAgICAgIHdpbmRTcGVlZDogY29udmVydEttaFRvTXBoKGRhdGEud2luZFNwZWVkKSxcclxuICAgICAgdmlzaWJpbGl0eTogY29udmVydE1ldGVyc1RvTWlsZXMoZGF0YS52aXNpYmlsaXR5KSxcclxuICAgICAgc3VucmlzZVRpbWVzdGFtcDogY29udmVydFRpbWVzdGFtcFRvSG91cihkYXRhLnN1bnJpc2VUaW1lc3RhbXAsIGRhdGEudGltZXpvbmUsIDEyKSxcclxuICAgICAgc3Vuc2V0VGltZXN0YW1wOiBjb252ZXJ0VGltZXN0YW1wVG9Ib3VyKGRhdGEuc3Vuc2V0VGltZXN0YW1wLCBkYXRhLnRpbWV6b25lLCAxMiksXHJcbiAgICB9KVxyXG4gICAgcmV0dXJuIGNvbnZlcnRlZERhdGFcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbnZlcnRUb01ldHJpYyhkYXRhKSB7XHJcbiAgICBjb25zdCBjb252ZXJ0ZWREYXRhID0gT2JqZWN0LmFzc2lnbih7fSwgZGF0YSwge1xyXG4gICAgICB2aXNpYmlsaXR5OiBjb252ZXJ0TWV0ZXJzVG9LbShkYXRhLnZpc2liaWxpdHkpLFxyXG4gICAgICBzdW5yaXNlVGltZXN0YW1wOiBjb252ZXJ0VGltZXN0YW1wVG9Ib3VyKGRhdGEuc3VucmlzZVRpbWVzdGFtcCwgZGF0YS50aW1lem9uZSwgMjQpLFxyXG4gICAgICBzdW5zZXRUaW1lc3RhbXA6IGNvbnZlcnRUaW1lc3RhbXBUb0hvdXIoZGF0YS5zdW5zZXRUaW1lc3RhbXAsIGRhdGEudGltZXpvbmUsIDI0KSxcclxuICAgIH0pXHJcbiAgICByZXR1cm4gY29udmVydGVkRGF0YVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGNvbnZlcnRUaW1lc3RhbXBUb0RheSxcclxuICAgIGNvbnZlcnRUb0ltcGVyaWFsLFxyXG4gICAgY29udmVydFRvTWV0cmljLFxyXG4gIH1cclxufSkoKVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgdXRpbHMiLCJpbXBvcnQgd2VhdGhlciBmcm9tICcuL3dlYXRoZXInXHJcbmltcG9ydCBnZXRVc2VyUG9zaXRpb24gZnJvbSAnLi9nZW9sb2NhdGlvbidcclxuaW1wb3J0IHN0b3JhZ2UgZnJvbSAnLi9zdG9yYWdlJ1xyXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi91dGlscydcclxuXHJcbmNvbnN0IHZpZXcgPSAoKCkgPT4ge1xyXG4gIGxldCBsYXN0RmV0Y2hEYXRhO1xyXG5cclxuICBmdW5jdGlvbiBpbml0V2Vic2l0ZSgpIHtcclxuICAgIGxvYWRJbml0aWFsRGF0YSgpXHJcbiAgICByZW5kZXJVbml0QnV0dG9uKHN0b3JhZ2UuZ2V0U3lzdGVtT2ZNZWFzdXJlbWVudCgpKVxyXG4gICAgaW5pdFNlYXJjaEZvcm0oKVxyXG4gICAgaW5pdFN5c3RlbU9mTWVhc3VyZW1lbnRTd2l0Y2goKVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gbG9hZEluaXRpYWxEYXRhKCkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gTG9hZCBkZWZhdWx0IGRhdGEgKHRvIGJlIHNob3duIGluIHRoZSBtZWFudGltZSBpZiB1c2VyIGhhc24ndCB5ZXQgYWxsb3dlZCBvciBibG9ja2VkIGdlb2xvY2F0aW9uKVxyXG4gICAgICBjb25zdCBpbml0aWFsRGF0YSA9IGF3YWl0IHdlYXRoZXIuZ2V0RGF0YSgnTmV3IFlvcmsnKVxyXG4gICAgICBsYXN0RmV0Y2hEYXRhID0gT2JqZWN0LmFzc2lnbih7fSwgaW5pdGlhbERhdGEpXHJcbiAgICAgIHJlbmRlclZpZXcoY29udmVydERhdGEoaW5pdGlhbERhdGEsIHN0b3JhZ2UuZ2V0U3lzdGVtT2ZNZWFzdXJlbWVudCgpKSlcclxuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdwcmVsb2FkJykgLy8gVE9ETzogSW5zZXJ0IHRoZSBsb2FkaW5nIGFuaW1hdGlvbiB0byBwcmVsb2FkXHJcblxyXG4gICAgICAvLyBTd2l0Y2ggdG8gbG9jYWwgZGF0YSBpZiB1c2VyIGdlb2xvY2F0aW9uIHBlcm1pc3Npb24gaXMgZ3JhbnRlZFxyXG4gICAgICBjb25zdCBwb3NpdGlvbiA9IGF3YWl0IGdldFVzZXJQb3NpdGlvbigpXHJcbiAgICAgIGlmIChwb3NpdGlvbiAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHdlYXRoZXIuZ2V0RGF0YShudWxsLCBwb3NpdGlvbilcclxuICAgICAgICBsYXN0RmV0Y2hEYXRhID0gT2JqZWN0LmFzc2lnbih7fSwgZGF0YSlcclxuICAgICAgICByZW5kZXJWaWV3KGNvbnZlcnREYXRhKGRhdGEsIHN0b3JhZ2UuZ2V0U3lzdGVtT2ZNZWFzdXJlbWVudCgpKSlcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihlcnJvcilcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgncHJlbG9hZCcpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbml0U2VhcmNoRm9ybSgpIHtcclxuICAgIGNvbnN0IHNlYXJjaEZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdmb3JtJylcclxuICAgIHNlYXJjaEZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0Jywgc2VhcmNoTG9jYXRpb24pXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXJTZWFyY2hFcnJvcihtZXNzYWdlKSB7XHJcbiAgICBjb25zdCBzZWFyY2hGb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZm9ybScpXHJcbiAgICBjb25zdCBlcnJvclNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcclxuXHJcbiAgICBlcnJvclNwYW4uY2xhc3NMaXN0LmFkZCgnZXJyb3InKVxyXG4gICAgZXJyb3JTcGFuLnRleHRDb250ZW50ID0gbWVzc2FnZVxyXG5cclxuICAgIHNlYXJjaEZvcm0uYXBwZW5kQ2hpbGQoZXJyb3JTcGFuKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVtb3ZlU2VhcmNoRXJyb3IoKSB7XHJcbiAgICBjb25zdCBlcnJvclNwYW4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzcGFuLmVycm9yJylcclxuICAgIGlmIChlcnJvclNwYW4gIT09IG51bGwpIGVycm9yU3Bhbi5yZW1vdmUoKVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gc2VhcmNoTG9jYXRpb24oZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICByZW1vdmVTZWFyY2hFcnJvcigpXHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3Qgc2VhcmNoVmFsdWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdJykudmFsdWUudHJpbSgpXHJcbiAgICAgIGlmIChzZWFyY2hWYWx1ZSA9PT0gJycpIHJldHVybiByZW5kZXJTZWFyY2hFcnJvcignUGxlYXNlIGVudGVyIGEgbG9jYXRpb24gbmFtZScpXHJcblxyXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgd2VhdGhlci5nZXREYXRhKHNlYXJjaFZhbHVlKVxyXG5cclxuICAgICAgaWYgKGRhdGEuY29kID09PSAyMDApIHtcclxuICAgICAgICBsYXN0RmV0Y2hEYXRhID0gT2JqZWN0LmFzc2lnbih7fSwgZGF0YSlcclxuICAgICAgICByZW5kZXJWaWV3KGNvbnZlcnREYXRhKGRhdGEsIHN0b3JhZ2UuZ2V0U3lzdGVtT2ZNZWFzdXJlbWVudCgpKSlcclxuICAgICAgfSBlbHNlIGlmIChkYXRhLmNvZCA9PT0gJzQwNCcgfHwgZGF0YS5jb2QgPT09ICc0MDAnKSB7XHJcbiAgICAgICAgcmVuZGVyU2VhcmNoRXJyb3IoJ05vIHJlc3VsdHMgZm91bmQnKVxyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdTZWFyY2ggZXJyb3I6JywgZXJyb3IpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbml0U3lzdGVtT2ZNZWFzdXJlbWVudFN3aXRjaCgpIHtcclxuICAgIGNvbnN0IHN3aXRjaFdyYXBwZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc3dpdGNoLXdyYXBwZXInKVxyXG4gICAgc3dpdGNoV3JhcHBlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHN3aXRjaFN5c3RlbU9mTWVhc3VyZW1lbnQpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzd2l0Y2hTeXN0ZW1PZk1lYXN1cmVtZW50KGUpIHtcclxuICAgIGNvbnN0IHN3aXRjaEJ0bnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc3dpdGNoLWJ0bicpXHJcbiAgICBjb25zdCBzeXN0ZW1PZk1lYXN1cmVtZW50ID0gZS50YXJnZXQuZGF0YXNldC5zeXN0ZW1cclxuXHJcbiAgICBzdG9yYWdlLnNldFN5c3RlbU9mTWVhc3VyZW1lbnQoc3lzdGVtT2ZNZWFzdXJlbWVudClcclxuICAgIHN3aXRjaEJ0bnMuZm9yRWFjaChidG4gPT4gYnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpKVxyXG4gICAgZS50YXJnZXQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJylcclxuXHJcbiAgICByZW5kZXJWaWV3KGNvbnZlcnREYXRhKGxhc3RGZXRjaERhdGEsIHN5c3RlbU9mTWVhc3VyZW1lbnQpKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0VW5pdFN5bWJvbChzeXN0ZW1PZk1lYXN1cmVtZW50LCB1bml0VHlwZSkge1xyXG4gICAgY29uc3QgdW5pdFN5bWJvbHMgPSB7XHJcbiAgICAgIG1ldHJpYzoge1xyXG4gICAgICAgIHRlbXA6ICdcXHUwMEIwQycsXHJcbiAgICAgICAgc3BlZWQ6ICdLbS9oJyxcclxuICAgICAgICBkaXN0YW5jZTogJ0ttJyxcclxuICAgICAgfSxcclxuICAgICAgaW1wZXJpYWw6IHtcclxuICAgICAgICB0ZW1wOiAnXFx1MDBCMEYnLFxyXG4gICAgICAgIHNwZWVkOiAnTXBoJyxcclxuICAgICAgICBkaXN0YW5jZTogJ01pJyxcclxuICAgICAgfSxcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdW5pdFN5bWJvbHNbc3lzdGVtT2ZNZWFzdXJlbWVudF1bdW5pdFR5cGVdXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRXZWF0aGVySWNvblVSTChpY29uTmFtZSkge1xyXG4gICAgY29uc3QgaWNvbnMgPSB7XHJcbiAgICAgICcwMWQnOiAnMDFkJyxcclxuICAgICAgJzAxbic6ICcwMW4nLFxyXG4gICAgICAnMDJkJzogJzAyZCcsXHJcbiAgICAgICcwMm4nOiAnMDJuJyxcclxuICAgICAgJzAzZCc6ICcwM2RfMDNuJyxcclxuICAgICAgJzAzbic6ICcwM2RfMDNuJyxcclxuICAgICAgJzA0ZCc6ICcwNGRfMDRuJyxcclxuICAgICAgJzA0bic6ICcwNGRfMDRuJyxcclxuICAgICAgJzA5ZCc6ICcwOWRfMDluJyxcclxuICAgICAgJzA5bic6ICcwOWRfMDluJyxcclxuICAgICAgJzEwZCc6ICcxMGQnLFxyXG4gICAgICAnMTBuJzogJzEwbicsXHJcbiAgICAgICcxMWQnOiAnMTFkJyxcclxuICAgICAgJzExbic6ICcxMW4nLFxyXG4gICAgICAnMTNkJzogJzEzZF8xM24nLFxyXG4gICAgICAnMTNuJzogJzEzZF8xM24nLFxyXG4gICAgICAnNTBkJzogJzUwZF81MG4nLFxyXG4gICAgICAnNTBuJzogJzUwZF81MG4nLFxyXG4gICAgfVxyXG4gICAgY29uc3QgaW1nU3JjID0gYGltYWdlcy93ZWF0aGVyX2NvbmRpdGlvbnMvJHtpY29uc1tpY29uTmFtZV19LnN2Z2BcclxuXHJcbiAgICByZXR1cm4gaW1nU3JjXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb252ZXJ0RGF0YShkYXRhLCBvdXRwdXRNZWFzdXJlbWVudFN5c3RlbSkge1xyXG4gICAgaWYgKG91dHB1dE1lYXN1cmVtZW50U3lzdGVtID09PSAnaW1wZXJpYWwnKSB7XHJcbiAgICAgIGNvbnN0IGNvbnZlcnRlZERhdGEgPSB1dGlscy5jb252ZXJ0VG9JbXBlcmlhbChkYXRhKVxyXG4gICAgICByZXR1cm4gY29udmVydGVkRGF0YVxyXG4gICAgfSBlbHNlIGlmIChvdXRwdXRNZWFzdXJlbWVudFN5c3RlbSA9PT0gJ21ldHJpYycpIHtcclxuICAgICAgY29uc3QgY29udmVydGVkRGF0YSA9IHV0aWxzLmNvbnZlcnRUb01ldHJpYyhkYXRhKVxyXG4gICAgICByZXR1cm4gY29udmVydGVkRGF0YVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVuZGVyVmlldyhkYXRhKSB7XHJcbiAgICBjb25zdCBtZWFzdXJlbWVudFN5c3RlbSA9IHN0b3JhZ2UuZ2V0U3lzdGVtT2ZNZWFzdXJlbWVudCgpXHJcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kZXNjcmlwdGlvbicpXHJcbiAgICBjb25zdCBjb25kaXRpb25JbWcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29uZGl0aW9uJylcclxuICAgIGNvbnN0IGNpdHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2l0eScpXHJcbiAgICBjb25zdCBjb3VudHJ5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvdW50cnknKVxyXG4gICAgY29uc3QgdGVtcGVyYXR1cmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudGVtcGVyYXR1cmUnKVxyXG4gICAgY29uc3QgZGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRheScpXHJcbiAgICBjb25zdCBtaW5UZW1wID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1pbi10ZW1wJylcclxuICAgIGNvbnN0IG1heFRlbXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWF4LXRlbXAnKVxyXG4gICAgY29uc3QgZmVlbHNMaWtlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZlZWxzLWxpa2UgLnRlbXAnKVxyXG4gICAgY29uc3QgaHVtaWRpdHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaHVtaWRpdHkgLnBlcmNlbnRhZ2UnKVxyXG4gICAgY29uc3Qgd2luZFNwZWVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLndpbmQgLnNwZWVkJylcclxuICAgIGNvbnN0IHZpc2liaWxpdHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudmlzaWJpbGl0eSAuZGlzdGFuY2UnKVxyXG4gICAgY29uc3Qgc3VucmlzZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zdW5yaXNlIC50aW1lJylcclxuICAgIGNvbnN0IHN1bnNldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zdW5zZXQgLnRpbWUnKVxyXG5cclxuXHJcbiAgICBkZXNjcmlwdGlvbi50ZXh0Q29udGVudCA9IGRhdGEud2VhdGhlckRlc2NyaXB0aW9uXHJcbiAgICBjb25kaXRpb25JbWcuc3JjID0gZ2V0V2VhdGhlckljb25VUkwoZGF0YS53ZWF0aGVySWNvbilcclxuICAgIGNpdHkudGV4dENvbnRlbnQgPSBkYXRhLmNpdHlOYW1lXHJcbiAgICBjb3VudHJ5LnRleHRDb250ZW50ID0gZGF0YS5jb3VudHJ5TmFtZVxyXG4gICAgZGF5LnRleHRDb250ZW50ID0gdXRpbHMuY29udmVydFRpbWVzdGFtcFRvRGF5KGRhdGEudGltZU9mQ2FsY3VsYXRpb24pXHJcbiAgICB0ZW1wZXJhdHVyZS50ZXh0Q29udGVudCA9IE1hdGgucm91bmQoZGF0YS50ZW1wZXJhdHVyZSkgKyBnZXRVbml0U3ltYm9sKG1lYXN1cmVtZW50U3lzdGVtLCAndGVtcCcpXHJcbiAgICBtaW5UZW1wLnRleHRDb250ZW50ID0gTWF0aC5yb3VuZChkYXRhLm1pblRlbXApICsgZ2V0VW5pdFN5bWJvbChtZWFzdXJlbWVudFN5c3RlbSwgJ3RlbXAnKVxyXG4gICAgbWF4VGVtcC50ZXh0Q29udGVudCA9IE1hdGgucm91bmQoZGF0YS5tYXhUZW1wKSArIGdldFVuaXRTeW1ib2wobWVhc3VyZW1lbnRTeXN0ZW0sICd0ZW1wJylcclxuICAgIGZlZWxzTGlrZS50ZXh0Q29udGVudCA9IE1hdGgucm91bmQoZGF0YS5mZWVsc0xpa2UpICsgJyAnICsgZ2V0VW5pdFN5bWJvbChtZWFzdXJlbWVudFN5c3RlbSwgJ3RlbXAnKVxyXG4gICAgaHVtaWRpdHkudGV4dENvbnRlbnQgPSBkYXRhLmh1bWlkaXR5XHJcbiAgICB3aW5kU3BlZWQudGV4dENvbnRlbnQgPSBNYXRoLnJvdW5kKGRhdGEud2luZFNwZWVkKSArICcgJyArIGdldFVuaXRTeW1ib2wobWVhc3VyZW1lbnRTeXN0ZW0sICdzcGVlZCcpXHJcbiAgICB2aXNpYmlsaXR5LnRleHRDb250ZW50ID0gTWF0aC5yb3VuZChkYXRhLnZpc2liaWxpdHkpICsgJyAnICsgZ2V0VW5pdFN5bWJvbChtZWFzdXJlbWVudFN5c3RlbSwgJ2Rpc3RhbmNlJylcclxuICAgIHN1bnJpc2UudGV4dENvbnRlbnQgPSBkYXRhLnN1bnJpc2VUaW1lc3RhbXBcclxuICAgIHN1bnNldC50ZXh0Q29udGVudCA9IGRhdGEuc3Vuc2V0VGltZXN0YW1wXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXJVbml0QnV0dG9uKHVuaXQpIHtcclxuICAgIGNvbnN0IGNCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2VsY2l1cycpXHJcbiAgICBjb25zdCBmQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZhaHJlbmhlaXQnKVxyXG5cclxuICAgIGlmICh1bml0ID09PSAnbWV0cmljJykge1xyXG4gICAgICBmQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpXHJcbiAgICAgIGNCdXR0b24uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJylcclxuICAgIH0gZWxzZSBpZiAodW5pdCA9PT0gJ2ltcGVyaWFsJykge1xyXG4gICAgICBjQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpXHJcbiAgICAgIGZCdXR0b24uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7IGluaXRXZWJzaXRlIH1cclxufSkoKVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgdmlldyIsImNvbnN0IHdlYXRoZXIgPSAoKCkgPT4ge1xyXG4gIGZ1bmN0aW9uIGZpbHRlckRhdGEoZGF0YSkge1xyXG4gICAgY29uc3Qge1xyXG4gICAgICBkdDogdGltZU9mQ2FsY3VsYXRpb24sXHJcbiAgICAgIG5hbWU6IGNpdHlOYW1lLFxyXG4gICAgICBtYWluOiB7XHJcbiAgICAgICAgdGVtcDogdGVtcGVyYXR1cmUsXHJcbiAgICAgICAgZmVlbHNfbGlrZTogZmVlbHNMaWtlLFxyXG4gICAgICAgIHRlbXBfbWluOiBtaW5UZW1wLFxyXG4gICAgICAgIHRlbXBfbWF4OiBtYXhUZW1wLFxyXG4gICAgICAgIGh1bWlkaXR5LFxyXG4gICAgICB9LFxyXG4gICAgICBzeXM6IHtcclxuICAgICAgICBjb3VudHJ5OiBjb3VudHJ5TmFtZSxcclxuICAgICAgICBzdW5yaXNlOiBzdW5yaXNlVGltZXN0YW1wLFxyXG4gICAgICAgIHN1bnNldDogc3Vuc2V0VGltZXN0YW1wLFxyXG4gICAgICB9LFxyXG4gICAgICB0aW1lem9uZSxcclxuICAgICAgdmlzaWJpbGl0eSxcclxuICAgICAgd2VhdGhlcjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIG1haW46IHdlYXRoZXJOYW1lLFxyXG4gICAgICAgICAgZGVzY3JpcHRpb246IHdlYXRoZXJEZXNjcmlwdGlvbixcclxuICAgICAgICAgIGljb246IHdlYXRoZXJJY29uLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICAgIHdpbmQ6IHsgc3BlZWQ6IHdpbmRTcGVlZCB9LFxyXG4gICAgICBjb2QsXHJcbiAgICB9ID0gZGF0YVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHRpbWVPZkNhbGN1bGF0aW9uLFxyXG4gICAgICBjaXR5TmFtZSxcclxuICAgICAgY291bnRyeU5hbWUsXHJcbiAgICAgIHRlbXBlcmF0dXJlLFxyXG4gICAgICBmZWVsc0xpa2UsXHJcbiAgICAgIG1pblRlbXAsXHJcbiAgICAgIG1heFRlbXAsXHJcbiAgICAgIGh1bWlkaXR5LFxyXG4gICAgICBzdW5yaXNlVGltZXN0YW1wLFxyXG4gICAgICBzdW5zZXRUaW1lc3RhbXAsXHJcbiAgICAgIHRpbWV6b25lLFxyXG4gICAgICB2aXNpYmlsaXR5LFxyXG4gICAgICB3aW5kU3BlZWQsXHJcbiAgICAgIHdlYXRoZXJOYW1lLFxyXG4gICAgICB3ZWF0aGVyRGVzY3JpcHRpb24sXHJcbiAgICAgIHdlYXRoZXJJY29uLFxyXG4gICAgICBjb2RcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGdldERhdGEoY2l0eU5hbWUsIGNvb3JkaW5hdGVzKSB7XHJcbiAgICBjb25zdCBBUElLZXkgPSAnNGE2OTBkYjYyMGYxZGNjNWFhMTliNjRlMzhlY2VjODYnIC8vIE5vdCBzYWZlLCBidXQgaXQncyBhIGZyZWUgQVBJIGtleSBqdXN0IGZvciB0aGUgcHVycG9zZSBvZiB0aGlzIHByb2plY3QuXHJcbiAgICBjb25zdCBhcGlVUkwgPSBjb29yZGluYXRlc1xyXG4gICAgICA/IGBodHRwczovL2FwaS5vcGVud2VhdGhlcm1hcC5vcmcvZGF0YS8yLjUvd2VhdGhlcj9sYXQ9JHtjb29yZGluYXRlcy5sYXRpdHVkZX0mbG9uPSR7Y29vcmRpbmF0ZXMubG9uZ2l0dWRlfSZ1bml0cz1tZXRyaWMmYXBwaWQ9JHtBUElLZXl9YFxyXG4gICAgICA6IGBodHRwczovL2FwaS5vcGVud2VhdGhlcm1hcC5vcmcvZGF0YS8yLjUvd2VhdGhlcj9xPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGNpdHlOYW1lKX0mdW5pdHM9bWV0cmljJmFwcGlkPSR7QVBJS2V5fWBcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGFwaVVSTCwgeyBtb2RlOiAnY29ycycgfSlcclxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxyXG4gICAgICBpZiAoZGF0YS5jb2QgPT09IDIwMCkgcmV0dXJuIGZpbHRlckRhdGEoZGF0YSlcclxuICAgICAgZWxzZSByZXR1cm4gZGF0YVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRmV0Y2ggRXJyb3I6JywgZXJyb3IubWVzc2FnZSlcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHsgZ2V0RGF0YSB9XHJcbn0pKClcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHdlYXRoZXIiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB2aWV3IGZyb20gJy4vbW9kdWxlcy92aWV3J1xyXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi9tb2R1bGVzL3V0aWxzJ1xyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCB2aWV3LmluaXRXZWJzaXRlKVxyXG5cclxuLy8gRklYOiBJZiBzcGFuLmVycm9yIHRleHQgZ2V0cyB0b28gbG9uZyBpdCBnb2VzIHVwXHJcbi8vIFRPRE86IEFkZCBsb2FkaW5nIGFuaW1hdGlvbnNcclxuLy8gVE9ETzogTW9iaWxlIG9wdGltaXphdGlvbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==