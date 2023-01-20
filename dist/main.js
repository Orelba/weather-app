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
const geolocation = (() => {
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

  return { getUserPosition }
})()

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (geolocation);

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

  function convertTimestampToDay(timestamp, timezone) {
    const date = new Date((timestamp + timezone) * 1000)
    return date.toLocaleString('en-US', { weekday: 'long', timeZone: 'UTC'})
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
      const position = await _geolocation__WEBPACK_IMPORTED_MODULE_1__["default"].getUserPosition()
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
        console.log(data)
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
    day.textContent = _utils__WEBPACK_IMPORTED_MODULE_3__["default"].convertTimestampToDay(data.timeOfCalculation, data.timezone)
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
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QyxjQUFjO0FBQzNEO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1gsQ0FBQztBQUNEO0FBQ0EsaUVBQWU7Ozs7OztVQ3JFZjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7O0FDTmlDO0FBQ2pDO0FBQ0EsZ0NBQWdDLGlFQUFnQixDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvbW9kdWxlcy9nZW9sb2NhdGlvbi5qcyIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC8uL3NyYy9tb2R1bGVzL3N0b3JhZ2UuanMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvbW9kdWxlcy91dGlscy5qcyIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC8uL3NyYy9tb2R1bGVzL3ZpZXcuanMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvbW9kdWxlcy93ZWF0aGVyLmpzIiwid2VicGFjazovL3dlYXRoZXItYXBwL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3dlYXRoZXItYXBwL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3dlYXRoZXItYXBwL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZ2VvbG9jYXRpb24gPSAoKCkgPT4ge1xyXG4gIGZ1bmN0aW9uIGdldFBvc2l0aW9uKCkge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+XHJcbiAgICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24ocmVzb2x2ZSwgcmVqZWN0LCB7IHRpbWVvdXQ6IDYwMDAgfSlcclxuICAgIClcclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGdldFVzZXJQb3NpdGlvbigpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGlmIChuYXZpZ2F0b3IuZ2VvbG9jYXRpb24pIHtcclxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IGF3YWl0IGdldFBvc2l0aW9uKClcclxuICAgICAgICBjb25zdCB7XHJcbiAgICAgICAgICBjb29yZHM6IHsgbGF0aXR1ZGUsIGxvbmdpdHVkZSB9LFxyXG4gICAgICAgIH0gPSBwb3NpdGlvblxyXG4gICAgICAgIHJldHVybiB7IGxhdGl0dWRlLCBsb25naXR1ZGUgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGdlb2xvY2F0aW9uJylcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS53YXJuKGAke2Vycm9yLm1lc3NhZ2V9LCBkZWZhdWx0IGxvY2F0aW9uIHdpbGwgYmUgdXNlZC5gKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgZ2V0VXNlclBvc2l0aW9uIH1cclxufSkoKVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ2VvbG9jYXRpb24iLCJjb25zdCBzdG9yYWdlID0gKCgpID0+IHtcclxuICBmdW5jdGlvbiBzZXRTeXN0ZW1PZk1lYXN1cmVtZW50KHVuaXROYW1lKSB7XHJcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndW5pdCcsIHVuaXROYW1lKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0U3lzdGVtT2ZNZWFzdXJlbWVudCgpIHtcclxuICAgIGxldCBjaG9zZW5Vbml0ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VuaXQnKVxyXG4gICAgaWYgKGNob3NlblVuaXQgPT09ICdtZXRyaWMnIHx8IGNob3NlblVuaXQgPT09ICdpbXBlcmlhbCcpIHtcclxuICAgICAgcmV0dXJuIGNob3NlblVuaXRcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNldFN5c3RlbU9mTWVhc3VyZW1lbnQoJ21ldHJpYycpXHJcbiAgICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndW5pdCcpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgc2V0U3lzdGVtT2ZNZWFzdXJlbWVudCxcclxuICAgIGdldFN5c3RlbU9mTWVhc3VyZW1lbnQsXHJcbiAgfVxyXG59KSgpXHJcblxyXG5leHBvcnQgZGVmYXVsdCBzdG9yYWdlIiwiY29uc3QgdXRpbHMgPSAoKCkgPT4ge1xyXG4gIGZ1bmN0aW9uIF9zaG9ydGVuRGVjaW1hbChudW1iZXIpIHtcclxuICAgIHJldHVybiBOdW1iZXIoKG51bWJlcikudG9GaXhlZCgyKS5yZXBsYWNlKC9bLixdMDAkLywgXCJcIikpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb252ZXJ0Q1RvRih0ZW1wSW5DZWxjaXVzKSB7XHJcbiAgICByZXR1cm4gX3Nob3J0ZW5EZWNpbWFsKHRlbXBJbkNlbGNpdXMgKiAxLjggKyAzMilcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbnZlcnRLbWhUb01waChzcGVlZEluS21oKSB7XHJcbiAgICByZXR1cm4gX3Nob3J0ZW5EZWNpbWFsKHNwZWVkSW5LbWggLyAxLjYwOTM0NClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbnZlcnRNZXRlcnNUb0ttKG1ldGVycykge1xyXG4gICAgcmV0dXJuIF9zaG9ydGVuRGVjaW1hbChtZXRlcnMgLyAxMDAwKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29udmVydE1ldGVyc1RvTWlsZXMobWV0ZXJzKSB7XHJcbiAgICByZXR1cm4gX3Nob3J0ZW5EZWNpbWFsKG1ldGVycyAqIDAuMDAwNjIxMzcpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb252ZXJ0VGltZXN0YW1wVG9EYXkodGltZXN0YW1wLCB0aW1lem9uZSkge1xyXG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCh0aW1lc3RhbXAgKyB0aW1lem9uZSkgKiAxMDAwKVxyXG4gICAgcmV0dXJuIGRhdGUudG9Mb2NhbGVTdHJpbmcoJ2VuLVVTJywgeyB3ZWVrZGF5OiAnbG9uZycsIHRpbWVab25lOiAnVVRDJ30pXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb252ZXJ0VGltZXN0YW1wVG9Ib3VyKHRpbWVzdGFtcCwgdGltZXpvbmUsIGhvdXJGb3JtYXQpIHtcclxuICAgIGNvbnN0IGZvcm1hdCA9IChOdW1iZXIoaG91ckZvcm1hdCkgPT0gMTIpID8gdHJ1ZSA6IGZhbHNlXHJcbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKHRpbWVzdGFtcCArIHRpbWV6b25lKSAqIDEwMDApXHJcbiAgICByZXR1cm4gZGF0ZS50b0xvY2FsZVN0cmluZygnZW4tVVMnLCB7IGhvdXI6ICdudW1lcmljJywgbWludXRlOiAnbnVtZXJpYycsIHRpbWVab25lOiAnVVRDJywgaG91cjEyOiBmb3JtYXQgfSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbnZlcnRUb0ltcGVyaWFsKGRhdGEpIHtcclxuICAgIGNvbnN0IGNvbnZlcnRlZERhdGEgPSBPYmplY3QuYXNzaWduKHt9LCBkYXRhLCB7XHJcbiAgICAgIHRlbXBlcmF0dXJlOiBjb252ZXJ0Q1RvRihkYXRhLnRlbXBlcmF0dXJlKSxcclxuICAgICAgZmVlbHNMaWtlOiBjb252ZXJ0Q1RvRihkYXRhLmZlZWxzTGlrZSksXHJcbiAgICAgIG1heFRlbXA6IGNvbnZlcnRDVG9GKGRhdGEubWF4VGVtcCksXHJcbiAgICAgIG1pblRlbXA6IGNvbnZlcnRDVG9GKGRhdGEubWluVGVtcCksXHJcbiAgICAgIHdpbmRTcGVlZDogY29udmVydEttaFRvTXBoKGRhdGEud2luZFNwZWVkKSxcclxuICAgICAgdmlzaWJpbGl0eTogY29udmVydE1ldGVyc1RvTWlsZXMoZGF0YS52aXNpYmlsaXR5KSxcclxuICAgICAgc3VucmlzZVRpbWVzdGFtcDogY29udmVydFRpbWVzdGFtcFRvSG91cihkYXRhLnN1bnJpc2VUaW1lc3RhbXAsIGRhdGEudGltZXpvbmUsIDEyKSxcclxuICAgICAgc3Vuc2V0VGltZXN0YW1wOiBjb252ZXJ0VGltZXN0YW1wVG9Ib3VyKGRhdGEuc3Vuc2V0VGltZXN0YW1wLCBkYXRhLnRpbWV6b25lLCAxMiksXHJcbiAgICB9KVxyXG4gICAgcmV0dXJuIGNvbnZlcnRlZERhdGFcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbnZlcnRUb01ldHJpYyhkYXRhKSB7XHJcbiAgICBjb25zdCBjb252ZXJ0ZWREYXRhID0gT2JqZWN0LmFzc2lnbih7fSwgZGF0YSwge1xyXG4gICAgICB2aXNpYmlsaXR5OiBjb252ZXJ0TWV0ZXJzVG9LbShkYXRhLnZpc2liaWxpdHkpLFxyXG4gICAgICBzdW5yaXNlVGltZXN0YW1wOiBjb252ZXJ0VGltZXN0YW1wVG9Ib3VyKGRhdGEuc3VucmlzZVRpbWVzdGFtcCwgZGF0YS50aW1lem9uZSwgMjQpLFxyXG4gICAgICBzdW5zZXRUaW1lc3RhbXA6IGNvbnZlcnRUaW1lc3RhbXBUb0hvdXIoZGF0YS5zdW5zZXRUaW1lc3RhbXAsIGRhdGEudGltZXpvbmUsIDI0KSxcclxuICAgIH0pXHJcbiAgICByZXR1cm4gY29udmVydGVkRGF0YVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGNvbnZlcnRUaW1lc3RhbXBUb0RheSxcclxuICAgIGNvbnZlcnRUb0ltcGVyaWFsLFxyXG4gICAgY29udmVydFRvTWV0cmljLFxyXG4gIH1cclxufSkoKVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgdXRpbHMiLCJpbXBvcnQgd2VhdGhlciBmcm9tICcuL3dlYXRoZXInXHJcbmltcG9ydCBnZW9sb2NhdGlvbiBmcm9tICcuL2dlb2xvY2F0aW9uJ1xyXG5pbXBvcnQgc3RvcmFnZSBmcm9tICcuL3N0b3JhZ2UnXHJcbmltcG9ydCB1dGlscyBmcm9tICcuL3V0aWxzJ1xyXG5cclxuY29uc3QgdmlldyA9ICgoKSA9PiB7XHJcbiAgbGV0IGxhc3RGZXRjaERhdGE7XHJcblxyXG4gIGZ1bmN0aW9uIGluaXRXZWJzaXRlKCkge1xyXG4gICAgbG9hZEluaXRpYWxEYXRhKClcclxuICAgIHJlbmRlclVuaXRCdXR0b24oc3RvcmFnZS5nZXRTeXN0ZW1PZk1lYXN1cmVtZW50KCkpXHJcbiAgICBpbml0U2VhcmNoRm9ybSgpXHJcbiAgICBpbml0U3lzdGVtT2ZNZWFzdXJlbWVudFN3aXRjaCgpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW1vdmVQcmVsb2FkT3ZlcmxheSgpIHtcclxuICAgIGNvbnN0IG92ZXJsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlbG9hZC1vdmVybGF5JylcclxuICAgIG92ZXJsYXkuc3R5bGUudmlzaWJpbGl0eSA9ICdjb2xsYXBzZSdcclxuICAgIG92ZXJsYXkuc3R5bGUub3BhY2l0eSA9IDA7XHJcbiAgfVxyXG5cclxuICBhc3luYyBmdW5jdGlvbiBsb2FkSW5pdGlhbERhdGEoKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBMb2FkIGRlZmF1bHQgZGF0YSAodG8gYmUgc2hvd24gaW4gdGhlIG1lYW50aW1lIGlmIHVzZXIgaGFzbid0IHlldCBhbGxvd2VkIG9yIGJsb2NrZWQgZ2VvbG9jYXRpb24pXHJcbiAgICAgIGNvbnN0IGluaXRpYWxEYXRhID0gYXdhaXQgd2VhdGhlci5nZXREYXRhKCdOZXcgWW9yaycpXHJcbiAgICAgIGxhc3RGZXRjaERhdGEgPSBPYmplY3QuYXNzaWduKHt9LCBpbml0aWFsRGF0YSlcclxuICAgICAgcmVuZGVyVmlldyhjb252ZXJ0RGF0YShpbml0aWFsRGF0YSwgc3RvcmFnZS5nZXRTeXN0ZW1PZk1lYXN1cmVtZW50KCkpKVxyXG4gICAgICByZW1vdmVQcmVsb2FkT3ZlcmxheSgpXHJcblxyXG4gICAgICAvLyBTd2l0Y2ggdG8gbG9jYWwgZGF0YSBpZiB1c2VyIGdlb2xvY2F0aW9uIHBlcm1pc3Npb24gaXMgZ3JhbnRlZFxyXG4gICAgICBjb25zdCBwb3NpdGlvbiA9IGF3YWl0IGdlb2xvY2F0aW9uLmdldFVzZXJQb3NpdGlvbigpXHJcbiAgICAgIGlmIChwb3NpdGlvbiAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHdlYXRoZXIuZ2V0RGF0YShudWxsLCBwb3NpdGlvbilcclxuICAgICAgICBsYXN0RmV0Y2hEYXRhID0gT2JqZWN0LmFzc2lnbih7fSwgZGF0YSlcclxuICAgICAgICByZW5kZXJWaWV3KGNvbnZlcnREYXRhKGRhdGEsIHN0b3JhZ2UuZ2V0U3lzdGVtT2ZNZWFzdXJlbWVudCgpKSlcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihlcnJvcilcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHJlbW92ZVByZWxvYWRPdmVybGF5KClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGluaXRTZWFyY2hGb3JtKCkge1xyXG4gICAgY29uc3Qgc2VhcmNoRm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0nKVxyXG4gICAgc2VhcmNoRm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBzZWFyY2hMb2NhdGlvbilcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbmRlclNlYXJjaEVycm9yKG1lc3NhZ2UpIHtcclxuICAgIGNvbnN0IHNlYXJjaEZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdmb3JtJylcclxuICAgIGNvbnN0IGVycm9yU3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxyXG5cclxuICAgIGVycm9yU3Bhbi5jbGFzc0xpc3QuYWRkKCdlcnJvcicpXHJcbiAgICBlcnJvclNwYW4udGV4dENvbnRlbnQgPSBtZXNzYWdlXHJcblxyXG4gICAgc2VhcmNoRm9ybS5hcHBlbmRDaGlsZChlcnJvclNwYW4pXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW1vdmVTZWFyY2hFcnJvcigpIHtcclxuICAgIGNvbnN0IGVycm9yU3BhbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NwYW4uZXJyb3InKVxyXG4gICAgaWYgKGVycm9yU3BhbiAhPT0gbnVsbCkgZXJyb3JTcGFuLnJlbW92ZSgpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXJTZWFyY2hMb2FkZXIoKSB7XHJcbiAgICBjb25zdCBzZWFyY2hCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpXHJcbiAgICBjb25zdCBsb2FkZXJTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXHJcbiAgICBsb2FkZXJTcGFuLmNsYXNzTGlzdC5hZGQoJ2xvYWRlcicpXHJcblxyXG4gICAgaWYgKHNlYXJjaEJ1dHRvbi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzZWFyY2gtaW1nJykpIHtcclxuICAgICAgc2VhcmNoQnV0dG9uLnJlbW92ZUNoaWxkKHNlYXJjaEJ1dHRvbi5jaGlsZHJlblswXSlcclxuICAgICAgc2VhcmNoQnV0dG9uLmFwcGVuZENoaWxkKGxvYWRlclNwYW4pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW1vdmVTZWFyY2hMb2FkZXIoKSB7XHJcbiAgICBjb25zdCBzZWFyY2hCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpXHJcbiAgICBjb25zdCBzZWFyY2hJbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKVxyXG4gICAgc2VhcmNoSW1nLnNyYyA9ICcuL2ltYWdlcy9zZWFyY2guc3ZnJ1xyXG4gICAgc2VhcmNoSW1nLmhlaWdodCA9IDIwXHJcbiAgICBzZWFyY2hJbWcud2lkdGggPSAyMFxyXG4gICAgc2VhcmNoSW1nLmFsdCA9ICdTZWFyY2ggQnV0dG9uIEljb24nXHJcbiAgICBzZWFyY2hJbWcuY2xhc3NMaXN0LmFkZCgnc2VhcmNoLWltZycpXHJcblxyXG4gICAgaWYgKHNlYXJjaEJ1dHRvbi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdsb2FkZXInKSkge1xyXG4gICAgICBzZWFyY2hCdXR0b24ucmVtb3ZlQ2hpbGQoc2VhcmNoQnV0dG9uLmNoaWxkcmVuWzBdKVxyXG4gICAgICBzZWFyY2hCdXR0b24uYXBwZW5kQ2hpbGQoc2VhcmNoSW1nKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gc2VhcmNoTG9jYXRpb24oZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICByZW1vdmVTZWFyY2hFcnJvcigpXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBzZWFyY2hWYWx1ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJzZWFyY2hcIl0nKS52YWx1ZS50cmltKClcclxuICAgICAgaWYgKHNlYXJjaFZhbHVlID09PSAnJykgcmV0dXJuIHJlbmRlclNlYXJjaEVycm9yKCdQbGVhc2UgZW50ZXIgYSBsb2NhdGlvbiBuYW1lJylcclxuXHJcbiAgICAgIHJlbmRlclNlYXJjaExvYWRlcigpXHJcblxyXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgd2VhdGhlci5nZXREYXRhKHNlYXJjaFZhbHVlKVxyXG5cclxuICAgICAgaWYgKGRhdGEuY29kID09PSAyMDApIHtcclxuICAgICAgICBsYXN0RmV0Y2hEYXRhID0gT2JqZWN0LmFzc2lnbih7fSwgZGF0YSlcclxuICAgICAgICByZW5kZXJWaWV3KGNvbnZlcnREYXRhKGRhdGEsIHN0b3JhZ2UuZ2V0U3lzdGVtT2ZNZWFzdXJlbWVudCgpKSlcclxuICAgICAgICBjb25zb2xlLmxvZyhkYXRhKVxyXG4gICAgICB9IGVsc2UgaWYgKGRhdGEuY29kID09PSAnNDA0JyB8fCBkYXRhLmNvZCA9PT0gJzQwMCcpIHtcclxuICAgICAgICByZW5kZXJTZWFyY2hFcnJvcignTm8gcmVzdWx0cyBmb3VuZCcpXHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1NlYXJjaCBlcnJvcjonLCBlcnJvcilcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHJlbW92ZVNlYXJjaExvYWRlcigpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbml0U3lzdGVtT2ZNZWFzdXJlbWVudFN3aXRjaCgpIHtcclxuICAgIGNvbnN0IHN3aXRjaFdyYXBwZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc3dpdGNoLXdyYXBwZXInKVxyXG4gICAgc3dpdGNoV3JhcHBlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHN3aXRjaFN5c3RlbU9mTWVhc3VyZW1lbnQpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzd2l0Y2hTeXN0ZW1PZk1lYXN1cmVtZW50KGUpIHtcclxuICAgIGNvbnN0IHN3aXRjaEJ0bnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc3dpdGNoLWJ0bicpXHJcbiAgICBjb25zdCBzeXN0ZW1PZk1lYXN1cmVtZW50ID0gZS50YXJnZXQuZGF0YXNldC5zeXN0ZW1cclxuXHJcbiAgICBzdG9yYWdlLnNldFN5c3RlbU9mTWVhc3VyZW1lbnQoc3lzdGVtT2ZNZWFzdXJlbWVudClcclxuICAgIHN3aXRjaEJ0bnMuZm9yRWFjaChidG4gPT4gYnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpKVxyXG4gICAgZS50YXJnZXQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJylcclxuXHJcbiAgICByZW5kZXJWaWV3KGNvbnZlcnREYXRhKGxhc3RGZXRjaERhdGEsIHN5c3RlbU9mTWVhc3VyZW1lbnQpKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0VW5pdFN5bWJvbChzeXN0ZW1PZk1lYXN1cmVtZW50LCB1bml0VHlwZSkge1xyXG4gICAgY29uc3QgdW5pdFN5bWJvbHMgPSB7XHJcbiAgICAgIG1ldHJpYzoge1xyXG4gICAgICAgIHRlbXA6ICdcXHUwMEIwQycsXHJcbiAgICAgICAgc3BlZWQ6ICdLbS9oJyxcclxuICAgICAgICBkaXN0YW5jZTogJ0ttJyxcclxuICAgICAgfSxcclxuICAgICAgaW1wZXJpYWw6IHtcclxuICAgICAgICB0ZW1wOiAnXFx1MDBCMEYnLFxyXG4gICAgICAgIHNwZWVkOiAnTXBoJyxcclxuICAgICAgICBkaXN0YW5jZTogJ01pJyxcclxuICAgICAgfSxcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdW5pdFN5bWJvbHNbc3lzdGVtT2ZNZWFzdXJlbWVudF1bdW5pdFR5cGVdXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRXZWF0aGVySWNvblVSTChpY29uTmFtZSkge1xyXG4gICAgY29uc3QgaWNvbnMgPSB7XHJcbiAgICAgICcwMWQnOiAnMDFkJyxcclxuICAgICAgJzAxbic6ICcwMW4nLFxyXG4gICAgICAnMDJkJzogJzAyZCcsXHJcbiAgICAgICcwMm4nOiAnMDJuJyxcclxuICAgICAgJzAzZCc6ICcwM2RfMDNuJyxcclxuICAgICAgJzAzbic6ICcwM2RfMDNuJyxcclxuICAgICAgJzA0ZCc6ICcwNGRfMDRuJyxcclxuICAgICAgJzA0bic6ICcwNGRfMDRuJyxcclxuICAgICAgJzA5ZCc6ICcwOWRfMDluJyxcclxuICAgICAgJzA5bic6ICcwOWRfMDluJyxcclxuICAgICAgJzEwZCc6ICcxMGQnLFxyXG4gICAgICAnMTBuJzogJzEwbicsXHJcbiAgICAgICcxMWQnOiAnMTFkJyxcclxuICAgICAgJzExbic6ICcxMW4nLFxyXG4gICAgICAnMTNkJzogJzEzZF8xM24nLFxyXG4gICAgICAnMTNuJzogJzEzZF8xM24nLFxyXG4gICAgICAnNTBkJzogJzUwZF81MG4nLFxyXG4gICAgICAnNTBuJzogJzUwZF81MG4nLFxyXG4gICAgfVxyXG4gICAgY29uc3QgaW1nU3JjID0gYGltYWdlcy93ZWF0aGVyX2NvbmRpdGlvbnMvJHtpY29uc1tpY29uTmFtZV19LnN2Z2BcclxuXHJcbiAgICByZXR1cm4gaW1nU3JjXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb252ZXJ0RGF0YShkYXRhLCBvdXRwdXRNZWFzdXJlbWVudFN5c3RlbSkge1xyXG4gICAgaWYgKG91dHB1dE1lYXN1cmVtZW50U3lzdGVtID09PSAnaW1wZXJpYWwnKSB7XHJcbiAgICAgIGNvbnN0IGNvbnZlcnRlZERhdGEgPSB1dGlscy5jb252ZXJ0VG9JbXBlcmlhbChkYXRhKVxyXG4gICAgICByZXR1cm4gY29udmVydGVkRGF0YVxyXG4gICAgfSBlbHNlIGlmIChvdXRwdXRNZWFzdXJlbWVudFN5c3RlbSA9PT0gJ21ldHJpYycpIHtcclxuICAgICAgY29uc3QgY29udmVydGVkRGF0YSA9IHV0aWxzLmNvbnZlcnRUb01ldHJpYyhkYXRhKVxyXG4gICAgICByZXR1cm4gY29udmVydGVkRGF0YVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVuZGVyVmlldyhkYXRhKSB7XHJcbiAgICBjb25zdCBtZWFzdXJlbWVudFN5c3RlbSA9IHN0b3JhZ2UuZ2V0U3lzdGVtT2ZNZWFzdXJlbWVudCgpXHJcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kZXNjcmlwdGlvbicpXHJcbiAgICBjb25zdCBjb25kaXRpb25JbWcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29uZGl0aW9uJylcclxuICAgIGNvbnN0IGNpdHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2l0eScpXHJcbiAgICBjb25zdCBjb3VudHJ5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvdW50cnknKVxyXG4gICAgY29uc3QgdGVtcGVyYXR1cmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudGVtcGVyYXR1cmUnKVxyXG4gICAgY29uc3QgZGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRheScpXHJcbiAgICBjb25zdCBtaW5UZW1wID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1pbi10ZW1wJylcclxuICAgIGNvbnN0IG1heFRlbXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWF4LXRlbXAnKVxyXG4gICAgY29uc3QgZmVlbHNMaWtlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZlZWxzLWxpa2UgLnRlbXAnKVxyXG4gICAgY29uc3QgaHVtaWRpdHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaHVtaWRpdHkgLnBlcmNlbnRhZ2UnKVxyXG4gICAgY29uc3Qgd2luZFNwZWVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLndpbmQgLnNwZWVkJylcclxuICAgIGNvbnN0IHZpc2liaWxpdHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudmlzaWJpbGl0eSAuZGlzdGFuY2UnKVxyXG4gICAgY29uc3Qgc3VucmlzZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zdW5yaXNlIC50aW1lJylcclxuICAgIGNvbnN0IHN1bnNldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zdW5zZXQgLnRpbWUnKVxyXG5cclxuXHJcbiAgICBkZXNjcmlwdGlvbi50ZXh0Q29udGVudCA9IGRhdGEud2VhdGhlckRlc2NyaXB0aW9uXHJcbiAgICBjb25kaXRpb25JbWcuc3JjID0gZ2V0V2VhdGhlckljb25VUkwoZGF0YS53ZWF0aGVySWNvbilcclxuICAgIGNpdHkudGV4dENvbnRlbnQgPSBkYXRhLmNpdHlOYW1lXHJcbiAgICBjb3VudHJ5LnRleHRDb250ZW50ID0gZGF0YS5jb3VudHJ5TmFtZVxyXG4gICAgZGF5LnRleHRDb250ZW50ID0gdXRpbHMuY29udmVydFRpbWVzdGFtcFRvRGF5KGRhdGEudGltZU9mQ2FsY3VsYXRpb24sIGRhdGEudGltZXpvbmUpXHJcbiAgICB0ZW1wZXJhdHVyZS50ZXh0Q29udGVudCA9IE1hdGgucm91bmQoZGF0YS50ZW1wZXJhdHVyZSkgKyBnZXRVbml0U3ltYm9sKG1lYXN1cmVtZW50U3lzdGVtLCAndGVtcCcpXHJcbiAgICBtaW5UZW1wLnRleHRDb250ZW50ID0gTWF0aC5yb3VuZChkYXRhLm1pblRlbXApICsgZ2V0VW5pdFN5bWJvbChtZWFzdXJlbWVudFN5c3RlbSwgJ3RlbXAnKVxyXG4gICAgbWF4VGVtcC50ZXh0Q29udGVudCA9IE1hdGgucm91bmQoZGF0YS5tYXhUZW1wKSArIGdldFVuaXRTeW1ib2wobWVhc3VyZW1lbnRTeXN0ZW0sICd0ZW1wJylcclxuICAgIGZlZWxzTGlrZS50ZXh0Q29udGVudCA9IE1hdGgucm91bmQoZGF0YS5mZWVsc0xpa2UpICsgJyAnICsgZ2V0VW5pdFN5bWJvbChtZWFzdXJlbWVudFN5c3RlbSwgJ3RlbXAnKVxyXG4gICAgaHVtaWRpdHkudGV4dENvbnRlbnQgPSBkYXRhLmh1bWlkaXR5XHJcbiAgICB3aW5kU3BlZWQudGV4dENvbnRlbnQgPSBNYXRoLnJvdW5kKGRhdGEud2luZFNwZWVkKSArICcgJyArIGdldFVuaXRTeW1ib2wobWVhc3VyZW1lbnRTeXN0ZW0sICdzcGVlZCcpXHJcbiAgICB2aXNpYmlsaXR5LnRleHRDb250ZW50ID0gTWF0aC5yb3VuZChkYXRhLnZpc2liaWxpdHkpICsgJyAnICsgZ2V0VW5pdFN5bWJvbChtZWFzdXJlbWVudFN5c3RlbSwgJ2Rpc3RhbmNlJylcclxuICAgIHN1bnJpc2UudGV4dENvbnRlbnQgPSBkYXRhLnN1bnJpc2VUaW1lc3RhbXBcclxuICAgIHN1bnNldC50ZXh0Q29udGVudCA9IGRhdGEuc3Vuc2V0VGltZXN0YW1wXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXJVbml0QnV0dG9uKHVuaXQpIHtcclxuICAgIGNvbnN0IGNCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2VsY2l1cycpXHJcbiAgICBjb25zdCBmQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZhaHJlbmhlaXQnKVxyXG5cclxuICAgIGlmICh1bml0ID09PSAnbWV0cmljJykge1xyXG4gICAgICBmQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpXHJcbiAgICAgIGNCdXR0b24uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJylcclxuICAgIH0gZWxzZSBpZiAodW5pdCA9PT0gJ2ltcGVyaWFsJykge1xyXG4gICAgICBjQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpXHJcbiAgICAgIGZCdXR0b24uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7IGluaXRXZWJzaXRlIH1cclxufSkoKVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgdmlldyIsImNvbnN0IHdlYXRoZXIgPSAoKCkgPT4ge1xyXG4gIGZ1bmN0aW9uIGZpbHRlckRhdGEoZGF0YSkge1xyXG4gICAgY29uc3Qge1xyXG4gICAgICBkdDogdGltZU9mQ2FsY3VsYXRpb24sXHJcbiAgICAgIG5hbWU6IGNpdHlOYW1lLFxyXG4gICAgICBtYWluOiB7XHJcbiAgICAgICAgdGVtcDogdGVtcGVyYXR1cmUsXHJcbiAgICAgICAgZmVlbHNfbGlrZTogZmVlbHNMaWtlLFxyXG4gICAgICAgIHRlbXBfbWluOiBtaW5UZW1wLFxyXG4gICAgICAgIHRlbXBfbWF4OiBtYXhUZW1wLFxyXG4gICAgICAgIGh1bWlkaXR5LFxyXG4gICAgICB9LFxyXG4gICAgICBzeXM6IHtcclxuICAgICAgICBjb3VudHJ5OiBjb3VudHJ5TmFtZSxcclxuICAgICAgICBzdW5yaXNlOiBzdW5yaXNlVGltZXN0YW1wLFxyXG4gICAgICAgIHN1bnNldDogc3Vuc2V0VGltZXN0YW1wLFxyXG4gICAgICB9LFxyXG4gICAgICB0aW1lem9uZSxcclxuICAgICAgdmlzaWJpbGl0eSxcclxuICAgICAgd2VhdGhlcjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIG1haW46IHdlYXRoZXJOYW1lLFxyXG4gICAgICAgICAgZGVzY3JpcHRpb246IHdlYXRoZXJEZXNjcmlwdGlvbixcclxuICAgICAgICAgIGljb246IHdlYXRoZXJJY29uLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICAgIHdpbmQ6IHsgc3BlZWQ6IHdpbmRTcGVlZCB9LFxyXG4gICAgICBjb2QsXHJcbiAgICB9ID0gZGF0YVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHRpbWVPZkNhbGN1bGF0aW9uLFxyXG4gICAgICBjaXR5TmFtZSxcclxuICAgICAgY291bnRyeU5hbWUsXHJcbiAgICAgIHRlbXBlcmF0dXJlLFxyXG4gICAgICBmZWVsc0xpa2UsXHJcbiAgICAgIG1pblRlbXAsXHJcbiAgICAgIG1heFRlbXAsXHJcbiAgICAgIGh1bWlkaXR5LFxyXG4gICAgICBzdW5yaXNlVGltZXN0YW1wLFxyXG4gICAgICBzdW5zZXRUaW1lc3RhbXAsXHJcbiAgICAgIHRpbWV6b25lLFxyXG4gICAgICB2aXNpYmlsaXR5LFxyXG4gICAgICB3aW5kU3BlZWQsXHJcbiAgICAgIHdlYXRoZXJOYW1lLFxyXG4gICAgICB3ZWF0aGVyRGVzY3JpcHRpb24sXHJcbiAgICAgIHdlYXRoZXJJY29uLFxyXG4gICAgICBjb2RcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGdldERhdGEoY2l0eU5hbWUsIGNvb3JkaW5hdGVzKSB7XHJcbiAgICBjb25zdCBBUElLZXkgPSAnNGE2OTBkYjYyMGYxZGNjNWFhMTliNjRlMzhlY2VjODYnIC8vIE5vdCBzYWZlLCBidXQgaXQncyBhIGZyZWUgQVBJIGtleSBqdXN0IGZvciB0aGUgcHVycG9zZSBvZiB0aGlzIHByb2plY3QuXHJcbiAgICBjb25zdCBhcGlVUkwgPSBjb29yZGluYXRlc1xyXG4gICAgICA/IGBodHRwczovL2FwaS5vcGVud2VhdGhlcm1hcC5vcmcvZGF0YS8yLjUvd2VhdGhlcj9sYXQ9JHtjb29yZGluYXRlcy5sYXRpdHVkZX0mbG9uPSR7Y29vcmRpbmF0ZXMubG9uZ2l0dWRlfSZ1bml0cz1tZXRyaWMmYXBwaWQ9JHtBUElLZXl9YFxyXG4gICAgICA6IGBodHRwczovL2FwaS5vcGVud2VhdGhlcm1hcC5vcmcvZGF0YS8yLjUvd2VhdGhlcj9xPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGNpdHlOYW1lKX0mdW5pdHM9bWV0cmljJmFwcGlkPSR7QVBJS2V5fWBcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGFwaVVSTCwgeyBtb2RlOiAnY29ycycgfSlcclxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxyXG4gICAgICBpZiAoZGF0YS5jb2QgPT09IDIwMCkgcmV0dXJuIGZpbHRlckRhdGEoZGF0YSlcclxuICAgICAgZWxzZSByZXR1cm4gZGF0YVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRmV0Y2ggRXJyb3I6JywgZXJyb3IubWVzc2FnZSlcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHsgZ2V0RGF0YSB9XHJcbn0pKClcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHdlYXRoZXIiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB2aWV3IGZyb20gJy4vbW9kdWxlcy92aWV3J1xyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCB2aWV3LmluaXRXZWJzaXRlKSJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==