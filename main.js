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
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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YztBQUMzRDtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYLENBQUM7QUFDRDtBQUNBLGlFQUFlOzs7Ozs7VUNyRWY7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7OztBQ05pQztBQUNqQztBQUNBLGdDQUFnQyxpRUFBZ0IsQyIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYXRoZXItYXBwLy4vc3JjL21vZHVsZXMvZ2VvbG9jYXRpb24uanMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvbW9kdWxlcy9zdG9yYWdlLmpzIiwid2VicGFjazovL3dlYXRoZXItYXBwLy4vc3JjL21vZHVsZXMvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvbW9kdWxlcy92aWV3LmpzIiwid2VicGFjazovL3dlYXRoZXItYXBwLy4vc3JjL21vZHVsZXMvd2VhdGhlci5qcyIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3dlYXRoZXItYXBwLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGdlb2xvY2F0aW9uID0gKCgpID0+IHtcclxuICBmdW5jdGlvbiBnZXRQb3NpdGlvbigpIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxyXG4gICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKHJlc29sdmUsIHJlamVjdCwgeyB0aW1lb3V0OiA2MDAwIH0pXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICBhc3luYyBmdW5jdGlvbiBnZXRVc2VyUG9zaXRpb24oKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICBpZiAobmF2aWdhdG9yLmdlb2xvY2F0aW9uKSB7XHJcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBhd2FpdCBnZXRQb3NpdGlvbigpXHJcbiAgICAgICAgY29uc3Qge1xyXG4gICAgICAgICAgY29vcmRzOiB7IGxhdGl0dWRlLCBsb25naXR1ZGUgfSxcclxuICAgICAgICB9ID0gcG9zaXRpb25cclxuICAgICAgICByZXR1cm4geyBsYXRpdHVkZSwgbG9uZ2l0dWRlIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Jyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBnZW9sb2NhdGlvbicpXHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybihgJHtlcnJvci5tZXNzYWdlfSwgZGVmYXVsdCBsb2NhdGlvbiB3aWxsIGJlIHVzZWQuYClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7IGdldFVzZXJQb3NpdGlvbiB9XHJcbn0pKClcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdlb2xvY2F0aW9uIiwiY29uc3Qgc3RvcmFnZSA9ICgoKSA9PiB7XHJcbiAgZnVuY3Rpb24gc2V0U3lzdGVtT2ZNZWFzdXJlbWVudCh1bml0TmFtZSkge1xyXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VuaXQnLCB1bml0TmFtZSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFN5c3RlbU9mTWVhc3VyZW1lbnQoKSB7XHJcbiAgICBsZXQgY2hvc2VuVW5pdCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1bml0JylcclxuICAgIGlmIChjaG9zZW5Vbml0ID09PSAnbWV0cmljJyB8fCBjaG9zZW5Vbml0ID09PSAnaW1wZXJpYWwnKSB7XHJcbiAgICAgIHJldHVybiBjaG9zZW5Vbml0XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZXRTeXN0ZW1PZk1lYXN1cmVtZW50KCdtZXRyaWMnKVxyXG4gICAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VuaXQnKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHNldFN5c3RlbU9mTWVhc3VyZW1lbnQsXHJcbiAgICBnZXRTeXN0ZW1PZk1lYXN1cmVtZW50LFxyXG4gIH1cclxufSkoKVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgc3RvcmFnZSIsImNvbnN0IHV0aWxzID0gKCgpID0+IHtcclxuICBmdW5jdGlvbiBfc2hvcnRlbkRlY2ltYWwobnVtYmVyKSB7XHJcbiAgICByZXR1cm4gTnVtYmVyKChudW1iZXIpLnRvRml4ZWQoMikucmVwbGFjZSgvWy4sXTAwJC8sIFwiXCIpKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29udmVydENUb0YodGVtcEluQ2VsY2l1cykge1xyXG4gICAgcmV0dXJuIF9zaG9ydGVuRGVjaW1hbCh0ZW1wSW5DZWxjaXVzICogMS44ICsgMzIpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb252ZXJ0S21oVG9NcGgoc3BlZWRJbkttaCkge1xyXG4gICAgcmV0dXJuIF9zaG9ydGVuRGVjaW1hbChzcGVlZEluS21oIC8gMS42MDkzNDQpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb252ZXJ0TWV0ZXJzVG9LbShtZXRlcnMpIHtcclxuICAgIHJldHVybiBfc2hvcnRlbkRlY2ltYWwobWV0ZXJzIC8gMTAwMClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbnZlcnRNZXRlcnNUb01pbGVzKG1ldGVycykge1xyXG4gICAgcmV0dXJuIF9zaG9ydGVuRGVjaW1hbChtZXRlcnMgKiAwLjAwMDYyMTM3KVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29udmVydFRpbWVzdGFtcFRvRGF5KHRpbWVzdGFtcCkge1xyXG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHRpbWVzdGFtcCAqIDEwMDApXHJcbiAgICByZXR1cm4gZGF0ZS50b0xvY2FsZVN0cmluZygnZW4tVVMnLCB7IHdlZWtkYXk6ICdsb25nJyB9KVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29udmVydFRpbWVzdGFtcFRvSG91cih0aW1lc3RhbXAsIHRpbWV6b25lLCBob3VyRm9ybWF0KSB7XHJcbiAgICBjb25zdCBmb3JtYXQgPSAoTnVtYmVyKGhvdXJGb3JtYXQpID09IDEyKSA/IHRydWUgOiBmYWxzZVxyXG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCh0aW1lc3RhbXAgKyB0aW1lem9uZSkgKiAxMDAwKVxyXG4gICAgcmV0dXJuIGRhdGUudG9Mb2NhbGVTdHJpbmcoJ2VuLVVTJywgeyBob3VyOiAnbnVtZXJpYycsIG1pbnV0ZTogJ251bWVyaWMnLCB0aW1lWm9uZTogJ1VUQycsIGhvdXIxMjogZm9ybWF0IH0pXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb252ZXJ0VG9JbXBlcmlhbChkYXRhKSB7XHJcbiAgICBjb25zdCBjb252ZXJ0ZWREYXRhID0gT2JqZWN0LmFzc2lnbih7fSwgZGF0YSwge1xyXG4gICAgICB0ZW1wZXJhdHVyZTogY29udmVydENUb0YoZGF0YS50ZW1wZXJhdHVyZSksXHJcbiAgICAgIGZlZWxzTGlrZTogY29udmVydENUb0YoZGF0YS5mZWVsc0xpa2UpLFxyXG4gICAgICBtYXhUZW1wOiBjb252ZXJ0Q1RvRihkYXRhLm1heFRlbXApLFxyXG4gICAgICBtaW5UZW1wOiBjb252ZXJ0Q1RvRihkYXRhLm1pblRlbXApLFxyXG4gICAgICB3aW5kU3BlZWQ6IGNvbnZlcnRLbWhUb01waChkYXRhLndpbmRTcGVlZCksXHJcbiAgICAgIHZpc2liaWxpdHk6IGNvbnZlcnRNZXRlcnNUb01pbGVzKGRhdGEudmlzaWJpbGl0eSksXHJcbiAgICAgIHN1bnJpc2VUaW1lc3RhbXA6IGNvbnZlcnRUaW1lc3RhbXBUb0hvdXIoZGF0YS5zdW5yaXNlVGltZXN0YW1wLCBkYXRhLnRpbWV6b25lLCAxMiksXHJcbiAgICAgIHN1bnNldFRpbWVzdGFtcDogY29udmVydFRpbWVzdGFtcFRvSG91cihkYXRhLnN1bnNldFRpbWVzdGFtcCwgZGF0YS50aW1lem9uZSwgMTIpLFxyXG4gICAgfSlcclxuICAgIHJldHVybiBjb252ZXJ0ZWREYXRhXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb252ZXJ0VG9NZXRyaWMoZGF0YSkge1xyXG4gICAgY29uc3QgY29udmVydGVkRGF0YSA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGEsIHtcclxuICAgICAgdmlzaWJpbGl0eTogY29udmVydE1ldGVyc1RvS20oZGF0YS52aXNpYmlsaXR5KSxcclxuICAgICAgc3VucmlzZVRpbWVzdGFtcDogY29udmVydFRpbWVzdGFtcFRvSG91cihkYXRhLnN1bnJpc2VUaW1lc3RhbXAsIGRhdGEudGltZXpvbmUsIDI0KSxcclxuICAgICAgc3Vuc2V0VGltZXN0YW1wOiBjb252ZXJ0VGltZXN0YW1wVG9Ib3VyKGRhdGEuc3Vuc2V0VGltZXN0YW1wLCBkYXRhLnRpbWV6b25lLCAyNCksXHJcbiAgICB9KVxyXG4gICAgcmV0dXJuIGNvbnZlcnRlZERhdGFcclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBjb252ZXJ0VGltZXN0YW1wVG9EYXksXHJcbiAgICBjb252ZXJ0VG9JbXBlcmlhbCxcclxuICAgIGNvbnZlcnRUb01ldHJpYyxcclxuICB9XHJcbn0pKClcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHV0aWxzIiwiaW1wb3J0IHdlYXRoZXIgZnJvbSAnLi93ZWF0aGVyJ1xyXG5pbXBvcnQgZ2VvbG9jYXRpb24gZnJvbSAnLi9nZW9sb2NhdGlvbidcclxuaW1wb3J0IHN0b3JhZ2UgZnJvbSAnLi9zdG9yYWdlJ1xyXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi91dGlscydcclxuXHJcbmNvbnN0IHZpZXcgPSAoKCkgPT4ge1xyXG4gIGxldCBsYXN0RmV0Y2hEYXRhO1xyXG5cclxuICBmdW5jdGlvbiBpbml0V2Vic2l0ZSgpIHtcclxuICAgIGxvYWRJbml0aWFsRGF0YSgpXHJcbiAgICByZW5kZXJVbml0QnV0dG9uKHN0b3JhZ2UuZ2V0U3lzdGVtT2ZNZWFzdXJlbWVudCgpKVxyXG4gICAgaW5pdFNlYXJjaEZvcm0oKVxyXG4gICAgaW5pdFN5c3RlbU9mTWVhc3VyZW1lbnRTd2l0Y2goKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVtb3ZlUHJlbG9hZE92ZXJsYXkoKSB7XHJcbiAgICBjb25zdCBvdmVybGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByZWxvYWQtb3ZlcmxheScpXHJcbiAgICBvdmVybGF5LnN0eWxlLnZpc2liaWxpdHkgPSAnY29sbGFwc2UnXHJcbiAgICBvdmVybGF5LnN0eWxlLm9wYWNpdHkgPSAwO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gbG9hZEluaXRpYWxEYXRhKCkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gTG9hZCBkZWZhdWx0IGRhdGEgKHRvIGJlIHNob3duIGluIHRoZSBtZWFudGltZSBpZiB1c2VyIGhhc24ndCB5ZXQgYWxsb3dlZCBvciBibG9ja2VkIGdlb2xvY2F0aW9uKVxyXG4gICAgICBjb25zdCBpbml0aWFsRGF0YSA9IGF3YWl0IHdlYXRoZXIuZ2V0RGF0YSgnTmV3IFlvcmsnKVxyXG4gICAgICBsYXN0RmV0Y2hEYXRhID0gT2JqZWN0LmFzc2lnbih7fSwgaW5pdGlhbERhdGEpXHJcbiAgICAgIHJlbmRlclZpZXcoY29udmVydERhdGEoaW5pdGlhbERhdGEsIHN0b3JhZ2UuZ2V0U3lzdGVtT2ZNZWFzdXJlbWVudCgpKSlcclxuICAgICAgcmVtb3ZlUHJlbG9hZE92ZXJsYXkoKVxyXG5cclxuICAgICAgLy8gU3dpdGNoIHRvIGxvY2FsIGRhdGEgaWYgdXNlciBnZW9sb2NhdGlvbiBwZXJtaXNzaW9uIGlzIGdyYW50ZWRcclxuICAgICAgY29uc3QgcG9zaXRpb24gPSBhd2FpdCBnZW9sb2NhdGlvbi5nZXRVc2VyUG9zaXRpb24oKVxyXG4gICAgICBpZiAocG9zaXRpb24gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB3ZWF0aGVyLmdldERhdGEobnVsbCwgcG9zaXRpb24pXHJcbiAgICAgICAgbGFzdEZldGNoRGF0YSA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGEpXHJcbiAgICAgICAgcmVuZGVyVmlldyhjb252ZXJ0RGF0YShkYXRhLCBzdG9yYWdlLmdldFN5c3RlbU9mTWVhc3VyZW1lbnQoKSkpXHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpXHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICByZW1vdmVQcmVsb2FkT3ZlcmxheSgpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbml0U2VhcmNoRm9ybSgpIHtcclxuICAgIGNvbnN0IHNlYXJjaEZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdmb3JtJylcclxuICAgIHNlYXJjaEZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0Jywgc2VhcmNoTG9jYXRpb24pXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXJTZWFyY2hFcnJvcihtZXNzYWdlKSB7XHJcbiAgICBjb25zdCBzZWFyY2hGb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZm9ybScpXHJcbiAgICBjb25zdCBlcnJvclNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcclxuXHJcbiAgICBlcnJvclNwYW4uY2xhc3NMaXN0LmFkZCgnZXJyb3InKVxyXG4gICAgZXJyb3JTcGFuLnRleHRDb250ZW50ID0gbWVzc2FnZVxyXG5cclxuICAgIHNlYXJjaEZvcm0uYXBwZW5kQ2hpbGQoZXJyb3JTcGFuKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVtb3ZlU2VhcmNoRXJyb3IoKSB7XHJcbiAgICBjb25zdCBlcnJvclNwYW4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzcGFuLmVycm9yJylcclxuICAgIGlmIChlcnJvclNwYW4gIT09IG51bGwpIGVycm9yU3Bhbi5yZW1vdmUoKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVuZGVyU2VhcmNoTG9hZGVyKCkge1xyXG4gICAgY29uc3Qgc2VhcmNoQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKVxyXG4gICAgY29uc3QgbG9hZGVyU3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxyXG4gICAgbG9hZGVyU3Bhbi5jbGFzc0xpc3QuYWRkKCdsb2FkZXInKVxyXG5cclxuICAgIGlmIChzZWFyY2hCdXR0b24uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2VhcmNoLWltZycpKSB7XHJcbiAgICAgIHNlYXJjaEJ1dHRvbi5yZW1vdmVDaGlsZChzZWFyY2hCdXR0b24uY2hpbGRyZW5bMF0pXHJcbiAgICAgIHNlYXJjaEJ1dHRvbi5hcHBlbmRDaGlsZChsb2FkZXJTcGFuKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVtb3ZlU2VhcmNoTG9hZGVyKCkge1xyXG4gICAgY29uc3Qgc2VhcmNoQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKVxyXG4gICAgY29uc3Qgc2VhcmNoSW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJylcclxuICAgIHNlYXJjaEltZy5zcmMgPSAnLi9pbWFnZXMvc2VhcmNoLnN2ZydcclxuICAgIHNlYXJjaEltZy5oZWlnaHQgPSAyMFxyXG4gICAgc2VhcmNoSW1nLndpZHRoID0gMjBcclxuICAgIHNlYXJjaEltZy5hbHQgPSAnU2VhcmNoIEJ1dHRvbiBJY29uJ1xyXG4gICAgc2VhcmNoSW1nLmNsYXNzTGlzdC5hZGQoJ3NlYXJjaC1pbWcnKVxyXG5cclxuICAgIGlmIChzZWFyY2hCdXR0b24uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbG9hZGVyJykpIHtcclxuICAgICAgc2VhcmNoQnV0dG9uLnJlbW92ZUNoaWxkKHNlYXJjaEJ1dHRvbi5jaGlsZHJlblswXSlcclxuICAgICAgc2VhcmNoQnV0dG9uLmFwcGVuZENoaWxkKHNlYXJjaEltZylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIHNlYXJjaExvY2F0aW9uKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgcmVtb3ZlU2VhcmNoRXJyb3IoKVxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3Qgc2VhcmNoVmFsdWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdJykudmFsdWUudHJpbSgpXHJcbiAgICAgIGlmIChzZWFyY2hWYWx1ZSA9PT0gJycpIHJldHVybiByZW5kZXJTZWFyY2hFcnJvcignUGxlYXNlIGVudGVyIGEgbG9jYXRpb24gbmFtZScpXHJcblxyXG4gICAgICByZW5kZXJTZWFyY2hMb2FkZXIoKVxyXG5cclxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHdlYXRoZXIuZ2V0RGF0YShzZWFyY2hWYWx1ZSlcclxuXHJcbiAgICAgIGlmIChkYXRhLmNvZCA9PT0gMjAwKSB7XHJcbiAgICAgICAgbGFzdEZldGNoRGF0YSA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGEpXHJcbiAgICAgICAgcmVuZGVyVmlldyhjb252ZXJ0RGF0YShkYXRhLCBzdG9yYWdlLmdldFN5c3RlbU9mTWVhc3VyZW1lbnQoKSkpXHJcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS5jb2QgPT09ICc0MDQnIHx8IGRhdGEuY29kID09PSAnNDAwJykge1xyXG4gICAgICAgIHJlbmRlclNlYXJjaEVycm9yKCdObyByZXN1bHRzIGZvdW5kJylcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignU2VhcmNoIGVycm9yOicsIGVycm9yKVxyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgcmVtb3ZlU2VhcmNoTG9hZGVyKClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGluaXRTeXN0ZW1PZk1lYXN1cmVtZW50U3dpdGNoKCkge1xyXG4gICAgY29uc3Qgc3dpdGNoV3JhcHBlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zd2l0Y2gtd3JhcHBlcicpXHJcbiAgICBzd2l0Y2hXcmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc3dpdGNoU3lzdGVtT2ZNZWFzdXJlbWVudClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHN3aXRjaFN5c3RlbU9mTWVhc3VyZW1lbnQoZSkge1xyXG4gICAgY29uc3Qgc3dpdGNoQnRucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zd2l0Y2gtYnRuJylcclxuICAgIGNvbnN0IHN5c3RlbU9mTWVhc3VyZW1lbnQgPSBlLnRhcmdldC5kYXRhc2V0LnN5c3RlbVxyXG5cclxuICAgIHN0b3JhZ2Uuc2V0U3lzdGVtT2ZNZWFzdXJlbWVudChzeXN0ZW1PZk1lYXN1cmVtZW50KVxyXG4gICAgc3dpdGNoQnRucy5mb3JFYWNoKGJ0biA9PiBidG4uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJykpXHJcbiAgICBlLnRhcmdldC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKVxyXG5cclxuICAgIHJlbmRlclZpZXcoY29udmVydERhdGEobGFzdEZldGNoRGF0YSwgc3lzdGVtT2ZNZWFzdXJlbWVudCkpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRVbml0U3ltYm9sKHN5c3RlbU9mTWVhc3VyZW1lbnQsIHVuaXRUeXBlKSB7XHJcbiAgICBjb25zdCB1bml0U3ltYm9scyA9IHtcclxuICAgICAgbWV0cmljOiB7XHJcbiAgICAgICAgdGVtcDogJ1xcdTAwQjBDJyxcclxuICAgICAgICBzcGVlZDogJ0ttL2gnLFxyXG4gICAgICAgIGRpc3RhbmNlOiAnS20nLFxyXG4gICAgICB9LFxyXG4gICAgICBpbXBlcmlhbDoge1xyXG4gICAgICAgIHRlbXA6ICdcXHUwMEIwRicsXHJcbiAgICAgICAgc3BlZWQ6ICdNcGgnLFxyXG4gICAgICAgIGRpc3RhbmNlOiAnTWknLFxyXG4gICAgICB9LFxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB1bml0U3ltYm9sc1tzeXN0ZW1PZk1lYXN1cmVtZW50XVt1bml0VHlwZV1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFdlYXRoZXJJY29uVVJMKGljb25OYW1lKSB7XHJcbiAgICBjb25zdCBpY29ucyA9IHtcclxuICAgICAgJzAxZCc6ICcwMWQnLFxyXG4gICAgICAnMDFuJzogJzAxbicsXHJcbiAgICAgICcwMmQnOiAnMDJkJyxcclxuICAgICAgJzAybic6ICcwMm4nLFxyXG4gICAgICAnMDNkJzogJzAzZF8wM24nLFxyXG4gICAgICAnMDNuJzogJzAzZF8wM24nLFxyXG4gICAgICAnMDRkJzogJzA0ZF8wNG4nLFxyXG4gICAgICAnMDRuJzogJzA0ZF8wNG4nLFxyXG4gICAgICAnMDlkJzogJzA5ZF8wOW4nLFxyXG4gICAgICAnMDluJzogJzA5ZF8wOW4nLFxyXG4gICAgICAnMTBkJzogJzEwZCcsXHJcbiAgICAgICcxMG4nOiAnMTBuJyxcclxuICAgICAgJzExZCc6ICcxMWQnLFxyXG4gICAgICAnMTFuJzogJzExbicsXHJcbiAgICAgICcxM2QnOiAnMTNkXzEzbicsXHJcbiAgICAgICcxM24nOiAnMTNkXzEzbicsXHJcbiAgICAgICc1MGQnOiAnNTBkXzUwbicsXHJcbiAgICAgICc1MG4nOiAnNTBkXzUwbicsXHJcbiAgICB9XHJcbiAgICBjb25zdCBpbWdTcmMgPSBgaW1hZ2VzL3dlYXRoZXJfY29uZGl0aW9ucy8ke2ljb25zW2ljb25OYW1lXX0uc3ZnYFxyXG5cclxuICAgIHJldHVybiBpbWdTcmNcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbnZlcnREYXRhKGRhdGEsIG91dHB1dE1lYXN1cmVtZW50U3lzdGVtKSB7XHJcbiAgICBpZiAob3V0cHV0TWVhc3VyZW1lbnRTeXN0ZW0gPT09ICdpbXBlcmlhbCcpIHtcclxuICAgICAgY29uc3QgY29udmVydGVkRGF0YSA9IHV0aWxzLmNvbnZlcnRUb0ltcGVyaWFsKGRhdGEpXHJcbiAgICAgIHJldHVybiBjb252ZXJ0ZWREYXRhXHJcbiAgICB9IGVsc2UgaWYgKG91dHB1dE1lYXN1cmVtZW50U3lzdGVtID09PSAnbWV0cmljJykge1xyXG4gICAgICBjb25zdCBjb252ZXJ0ZWREYXRhID0gdXRpbHMuY29udmVydFRvTWV0cmljKGRhdGEpXHJcbiAgICAgIHJldHVybiBjb252ZXJ0ZWREYXRhXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXJWaWV3KGRhdGEpIHtcclxuICAgIGNvbnN0IG1lYXN1cmVtZW50U3lzdGVtID0gc3RvcmFnZS5nZXRTeXN0ZW1PZk1lYXN1cmVtZW50KClcclxuICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRlc2NyaXB0aW9uJylcclxuICAgIGNvbnN0IGNvbmRpdGlvbkltZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb25kaXRpb24nKVxyXG4gICAgY29uc3QgY2l0eSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jaXR5JylcclxuICAgIGNvbnN0IGNvdW50cnkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY291bnRyeScpXHJcbiAgICBjb25zdCB0ZW1wZXJhdHVyZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50ZW1wZXJhdHVyZScpXHJcbiAgICBjb25zdCBkYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZGF5JylcclxuICAgIGNvbnN0IG1pblRlbXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWluLXRlbXAnKVxyXG4gICAgY29uc3QgbWF4VGVtcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tYXgtdGVtcCcpXHJcbiAgICBjb25zdCBmZWVsc0xpa2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZmVlbHMtbGlrZSAudGVtcCcpXHJcbiAgICBjb25zdCBodW1pZGl0eSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5odW1pZGl0eSAucGVyY2VudGFnZScpXHJcbiAgICBjb25zdCB3aW5kU3BlZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcud2luZCAuc3BlZWQnKVxyXG4gICAgY29uc3QgdmlzaWJpbGl0eSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy52aXNpYmlsaXR5IC5kaXN0YW5jZScpXHJcbiAgICBjb25zdCBzdW5yaXNlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnN1bnJpc2UgLnRpbWUnKVxyXG4gICAgY29uc3Qgc3Vuc2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnN1bnNldCAudGltZScpXHJcblxyXG5cclxuICAgIGRlc2NyaXB0aW9uLnRleHRDb250ZW50ID0gZGF0YS53ZWF0aGVyRGVzY3JpcHRpb25cclxuICAgIGNvbmRpdGlvbkltZy5zcmMgPSBnZXRXZWF0aGVySWNvblVSTChkYXRhLndlYXRoZXJJY29uKVxyXG4gICAgY2l0eS50ZXh0Q29udGVudCA9IGRhdGEuY2l0eU5hbWVcclxuICAgIGNvdW50cnkudGV4dENvbnRlbnQgPSBkYXRhLmNvdW50cnlOYW1lXHJcbiAgICBkYXkudGV4dENvbnRlbnQgPSB1dGlscy5jb252ZXJ0VGltZXN0YW1wVG9EYXkoZGF0YS50aW1lT2ZDYWxjdWxhdGlvbilcclxuICAgIHRlbXBlcmF0dXJlLnRleHRDb250ZW50ID0gTWF0aC5yb3VuZChkYXRhLnRlbXBlcmF0dXJlKSArIGdldFVuaXRTeW1ib2wobWVhc3VyZW1lbnRTeXN0ZW0sICd0ZW1wJylcclxuICAgIG1pblRlbXAudGV4dENvbnRlbnQgPSBNYXRoLnJvdW5kKGRhdGEubWluVGVtcCkgKyBnZXRVbml0U3ltYm9sKG1lYXN1cmVtZW50U3lzdGVtLCAndGVtcCcpXHJcbiAgICBtYXhUZW1wLnRleHRDb250ZW50ID0gTWF0aC5yb3VuZChkYXRhLm1heFRlbXApICsgZ2V0VW5pdFN5bWJvbChtZWFzdXJlbWVudFN5c3RlbSwgJ3RlbXAnKVxyXG4gICAgZmVlbHNMaWtlLnRleHRDb250ZW50ID0gTWF0aC5yb3VuZChkYXRhLmZlZWxzTGlrZSkgKyAnICcgKyBnZXRVbml0U3ltYm9sKG1lYXN1cmVtZW50U3lzdGVtLCAndGVtcCcpXHJcbiAgICBodW1pZGl0eS50ZXh0Q29udGVudCA9IGRhdGEuaHVtaWRpdHlcclxuICAgIHdpbmRTcGVlZC50ZXh0Q29udGVudCA9IE1hdGgucm91bmQoZGF0YS53aW5kU3BlZWQpICsgJyAnICsgZ2V0VW5pdFN5bWJvbChtZWFzdXJlbWVudFN5c3RlbSwgJ3NwZWVkJylcclxuICAgIHZpc2liaWxpdHkudGV4dENvbnRlbnQgPSBNYXRoLnJvdW5kKGRhdGEudmlzaWJpbGl0eSkgKyAnICcgKyBnZXRVbml0U3ltYm9sKG1lYXN1cmVtZW50U3lzdGVtLCAnZGlzdGFuY2UnKVxyXG4gICAgc3VucmlzZS50ZXh0Q29udGVudCA9IGRhdGEuc3VucmlzZVRpbWVzdGFtcFxyXG4gICAgc3Vuc2V0LnRleHRDb250ZW50ID0gZGF0YS5zdW5zZXRUaW1lc3RhbXBcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbmRlclVuaXRCdXR0b24odW5pdCkge1xyXG4gICAgY29uc3QgY0J1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jZWxjaXVzJylcclxuICAgIGNvbnN0IGZCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZmFocmVuaGVpdCcpXHJcblxyXG4gICAgaWYgKHVuaXQgPT09ICdtZXRyaWMnKSB7XHJcbiAgICAgIGZCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJylcclxuICAgICAgY0J1dHRvbi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKVxyXG4gICAgfSBlbHNlIGlmICh1bml0ID09PSAnaW1wZXJpYWwnKSB7XHJcbiAgICAgIGNCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJylcclxuICAgICAgZkJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgaW5pdFdlYnNpdGUgfVxyXG59KSgpXHJcblxyXG5leHBvcnQgZGVmYXVsdCB2aWV3IiwiY29uc3Qgd2VhdGhlciA9ICgoKSA9PiB7XHJcbiAgZnVuY3Rpb24gZmlsdGVyRGF0YShkYXRhKSB7XHJcbiAgICBjb25zdCB7XHJcbiAgICAgIGR0OiB0aW1lT2ZDYWxjdWxhdGlvbixcclxuICAgICAgbmFtZTogY2l0eU5hbWUsXHJcbiAgICAgIG1haW46IHtcclxuICAgICAgICB0ZW1wOiB0ZW1wZXJhdHVyZSxcclxuICAgICAgICBmZWVsc19saWtlOiBmZWVsc0xpa2UsXHJcbiAgICAgICAgdGVtcF9taW46IG1pblRlbXAsXHJcbiAgICAgICAgdGVtcF9tYXg6IG1heFRlbXAsXHJcbiAgICAgICAgaHVtaWRpdHksXHJcbiAgICAgIH0sXHJcbiAgICAgIHN5czoge1xyXG4gICAgICAgIGNvdW50cnk6IGNvdW50cnlOYW1lLFxyXG4gICAgICAgIHN1bnJpc2U6IHN1bnJpc2VUaW1lc3RhbXAsXHJcbiAgICAgICAgc3Vuc2V0OiBzdW5zZXRUaW1lc3RhbXAsXHJcbiAgICAgIH0sXHJcbiAgICAgIHRpbWV6b25lLFxyXG4gICAgICB2aXNpYmlsaXR5LFxyXG4gICAgICB3ZWF0aGVyOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbWFpbjogd2VhdGhlck5hbWUsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogd2VhdGhlckRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgaWNvbjogd2VhdGhlckljb24sXHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgICAgd2luZDogeyBzcGVlZDogd2luZFNwZWVkIH0sXHJcbiAgICAgIGNvZCxcclxuICAgIH0gPSBkYXRhXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdGltZU9mQ2FsY3VsYXRpb24sXHJcbiAgICAgIGNpdHlOYW1lLFxyXG4gICAgICBjb3VudHJ5TmFtZSxcclxuICAgICAgdGVtcGVyYXR1cmUsXHJcbiAgICAgIGZlZWxzTGlrZSxcclxuICAgICAgbWluVGVtcCxcclxuICAgICAgbWF4VGVtcCxcclxuICAgICAgaHVtaWRpdHksXHJcbiAgICAgIHN1bnJpc2VUaW1lc3RhbXAsXHJcbiAgICAgIHN1bnNldFRpbWVzdGFtcCxcclxuICAgICAgdGltZXpvbmUsXHJcbiAgICAgIHZpc2liaWxpdHksXHJcbiAgICAgIHdpbmRTcGVlZCxcclxuICAgICAgd2VhdGhlck5hbWUsXHJcbiAgICAgIHdlYXRoZXJEZXNjcmlwdGlvbixcclxuICAgICAgd2VhdGhlckljb24sXHJcbiAgICAgIGNvZFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gZ2V0RGF0YShjaXR5TmFtZSwgY29vcmRpbmF0ZXMpIHtcclxuICAgIGNvbnN0IEFQSUtleSA9ICc0YTY5MGRiNjIwZjFkY2M1YWExOWI2NGUzOGVjZWM4NicgLy8gTm90IHNhZmUsIGJ1dCBpdCdzIGEgZnJlZSBBUEkga2V5IGp1c3QgZm9yIHRoZSBwdXJwb3NlIG9mIHRoaXMgcHJvamVjdC5cclxuICAgIGNvbnN0IGFwaVVSTCA9IGNvb3JkaW5hdGVzXHJcbiAgICAgID8gYGh0dHBzOi8vYXBpLm9wZW53ZWF0aGVybWFwLm9yZy9kYXRhLzIuNS93ZWF0aGVyP2xhdD0ke2Nvb3JkaW5hdGVzLmxhdGl0dWRlfSZsb249JHtjb29yZGluYXRlcy5sb25naXR1ZGV9JnVuaXRzPW1ldHJpYyZhcHBpZD0ke0FQSUtleX1gXHJcbiAgICAgIDogYGh0dHBzOi8vYXBpLm9wZW53ZWF0aGVybWFwLm9yZy9kYXRhLzIuNS93ZWF0aGVyP3E9JHtlbmNvZGVVUklDb21wb25lbnQoY2l0eU5hbWUpfSZ1bml0cz1tZXRyaWMmYXBwaWQ9JHtBUElLZXl9YFxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYXBpVVJMLCB7IG1vZGU6ICdjb3JzJyB9KVxyXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXHJcbiAgICAgIGlmIChkYXRhLmNvZCA9PT0gMjAwKSByZXR1cm4gZmlsdGVyRGF0YShkYXRhKVxyXG4gICAgICBlbHNlIHJldHVybiBkYXRhXHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdGZXRjaCBFcnJvcjonLCBlcnJvci5tZXNzYWdlKVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4geyBnZXREYXRhIH1cclxufSkoKVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgd2VhdGhlciIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHZpZXcgZnJvbSAnLi9tb2R1bGVzL3ZpZXcnXHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHZpZXcuaW5pdFdlYnNpdGUpIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9