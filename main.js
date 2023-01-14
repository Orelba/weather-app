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
    return { longitude: -99.1277, latitude: 19.4285 } // Mexico city default coordinates
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getUserPosition);

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

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (utils);

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
/* harmony import */ var _modules_weather__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modules/weather */ "./src/modules/weather.js");
/* harmony import */ var _modules_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./modules/utils */ "./src/modules/utils.js");
/* harmony import */ var _modules_geolocation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./modules/geolocation */ "./src/modules/geolocation.js");




// const date = new Date(1673655499 * 1000)
// const hour = `${date.getHours()}:${date.getMinutes()}`
// console.log(hour)

async function loadInitialData() {
  const position = await (0,_modules_geolocation__WEBPACK_IMPORTED_MODULE_2__["default"])()
  const data = await _modules_weather__WEBPACK_IMPORTED_MODULE_0__["default"].getData(null, position)
  console.log(data) // TODO: DOM function that feeds everything
}

loadInitialData()
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQSxnRUFBZ0UsZUFBZTtBQUMvRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLHFCQUFxQjtBQUN2QyxRQUFRO0FBQ1IsZUFBZTtBQUNmLE1BQU07QUFDTjtBQUNBO0FBQ0EsSUFBSTtBQUNKLG9CQUFvQixjQUFjO0FBQ2xDLGFBQWEseUNBQXlDO0FBQ3REO0FBQ0E7QUFDQTtBQUNBLGlFQUFlOzs7Ozs7Ozs7Ozs7OztBQ3ZCZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0EsaUVBQWU7Ozs7Ozs7Ozs7Ozs7O0FDekJmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLGNBQWMsa0JBQWtCO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtEQUErRCxxQkFBcUIsT0FBTyxzQkFBc0Isc0JBQXNCLFFBQVE7QUFDL0ksNkRBQTZELDZCQUE2QixzQkFBc0IsUUFBUTtBQUN4SDtBQUNBO0FBQ0EsNkNBQTZDLGNBQWM7QUFDM0Q7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYLENBQUM7QUFDRDtBQUNBLGlFQUFlOzs7Ozs7VUM3RGY7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7O0FDTnVDO0FBQ0o7QUFDZ0I7QUFDbkQ7QUFDQTtBQUNBLG1CQUFtQixnQkFBZ0IsR0FBRyxrQkFBa0I7QUFDeEQ7QUFDQTtBQUNBO0FBQ0EseUJBQXlCLGdFQUFlO0FBQ3hDLHFCQUFxQixnRUFBZTtBQUNwQztBQUNBO0FBQ0E7QUFDQSxpQiIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYXRoZXItYXBwLy4vc3JjL21vZHVsZXMvZ2VvbG9jYXRpb24uanMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvbW9kdWxlcy91dGlscy5qcyIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC8uL3NyYy9tb2R1bGVzL3dlYXRoZXIuanMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3dlYXRoZXItYXBwL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBnZXRQb3NpdGlvbigpIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT5cclxuICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24ocmVzb2x2ZSwgcmVqZWN0LCB7IHRpbWVvdXQ6IDYwMDAgfSlcclxuICApXHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFVzZXJQb3NpdGlvbigpIHtcclxuICB0cnkge1xyXG4gICAgaWYgKG5hdmlnYXRvci5nZW9sb2NhdGlvbikge1xyXG4gICAgICBjb25zdCBwb3NpdGlvbiA9IGF3YWl0IGdldFBvc2l0aW9uKClcclxuICAgICAgY29uc3Qge1xyXG4gICAgICAgIGNvb3JkczogeyBsYXRpdHVkZSwgbG9uZ2l0dWRlIH0sXHJcbiAgICAgIH0gPSBwb3NpdGlvblxyXG4gICAgICByZXR1cm4geyBsYXRpdHVkZSwgbG9uZ2l0dWRlIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignQnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGdlb2xvY2F0aW9uJylcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS53YXJuKGAke2Vycm9yLm1lc3NhZ2V9LCBkZWZhdWx0IGxvY2F0aW9uIHdpbGwgYmUgdXNlZC5gKVxyXG4gICAgcmV0dXJuIHsgbG9uZ2l0dWRlOiAtOTkuMTI3NywgbGF0aXR1ZGU6IDE5LjQyODUgfSAvLyBNZXhpY28gY2l0eSBkZWZhdWx0IGNvb3JkaW5hdGVzXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnZXRVc2VyUG9zaXRpb24iLCJjb25zdCB1dGlscyA9ICgoKSA9PiB7XHJcbiAgZnVuY3Rpb24gY29udmVydENUb0YodGVtcEluQ2VsY2l1cykge1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IodGVtcEluQ2VsY2l1cyAqIDEuOCArIDMyKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29udmVydEttaFRvTXBoKHNwZWVkSW5LbWgpIHtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKHNwZWVkSW5LbWggLyAxLjYwOTM0NClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbnZlcnRNZXRlcnNUb0ttKG1ldGVycykge1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IobWV0ZXJzIC8gMTAwMClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbnZlcnRNZXRlcnNUb01pbGVzKG1ldGVycykge1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IobWV0ZXJzICogMC4wMDA2MjEzNylcclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBjb252ZXJ0Q1RvRixcclxuICAgIGNvbnZlcnRLbWhUb01waCxcclxuICAgIGNvbnZlcnRNZXRlcnNUb0ttLFxyXG4gICAgY29udmVydE1ldGVyc1RvTWlsZXMsXHJcbiAgfVxyXG59KSgpXHJcblxyXG5leHBvcnQgZGVmYXVsdCB1dGlscyIsImNvbnN0IHdlYXRoZXIgPSAoKCkgPT4ge1xyXG4gIGZ1bmN0aW9uIGZpbHRlckRhdGEoZGF0YSkge1xyXG4gICAgY29uc3Qge1xyXG4gICAgICBuYW1lOiBjaXR5TmFtZSxcclxuICAgICAgbWFpbjoge1xyXG4gICAgICAgIHRlbXA6IHRlbXBlcmF0dXJlLFxyXG4gICAgICAgIGZlZWxzX2xpa2U6IGZlZWxzTGlrZSxcclxuICAgICAgICB0ZW1wX21pbjogbWluVGVtcCxcclxuICAgICAgICB0ZW1wX21heDogbWF4VGVtcCxcclxuICAgICAgICBodW1pZGl0eSxcclxuICAgICAgfSxcclxuICAgICAgc3lzOiB7XHJcbiAgICAgICAgY291bnRyeTogY291bnRyeU5hbWUsXHJcbiAgICAgICAgc3VucmlzZTogc3VucmlzZVRpbWVzdGFtcCxcclxuICAgICAgICBzdW5zZXQ6IHN1bnNldFRpbWVzdGFtcCxcclxuICAgICAgfSxcclxuICAgICAgd2luZDogeyBzcGVlZDogd2luZFNwZWVkIH0sXHJcbiAgICAgIHdlYXRoZXI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBtYWluOiB3ZWF0aGVyTmFtZSxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiB3ZWF0aGVyRGVzY3JpcHRpb24sXHJcbiAgICAgICAgICBpY29uOiB3ZWF0aGVySWNvbixcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfSA9IGRhdGFcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNpdHlOYW1lLFxyXG4gICAgICBjb3VudHJ5TmFtZSxcclxuICAgICAgdGVtcGVyYXR1cmUsXHJcbiAgICAgIGZlZWxzTGlrZSxcclxuICAgICAgbWluVGVtcCxcclxuICAgICAgbWF4VGVtcCxcclxuICAgICAgaHVtaWRpdHksXHJcbiAgICAgIHN1bnJpc2VUaW1lc3RhbXAsXHJcbiAgICAgIHN1bnNldFRpbWVzdGFtcCxcclxuICAgICAgd2luZFNwZWVkLFxyXG4gICAgICB3ZWF0aGVyTmFtZSxcclxuICAgICAgd2VhdGhlckRlc2NyaXB0aW9uLFxyXG4gICAgICB3ZWF0aGVySWNvbixcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGdldERhdGEoY2l0eU5hbWUsIGNvb3JkaW5hdGVzKSB7XHJcbiAgICBjb25zdCBBUElfS0VZID0gJzRhNjkwZGI2MjBmMWRjYzVhYTE5YjY0ZTM4ZWNlYzg2JyAvLyBOb3Qgc2FmZSwgYnV0IGl0J3MgYSBmcmVlIEFQSSBrZXkganVzdCBmb3IgdGhlIHB1cnBvc2Ugb2YgdGhpcyBwcm9qZWN0LlxyXG4gICAgY29uc3QgYXBpVVJMID0gY29vcmRpbmF0ZXNcclxuICAgICAgPyBgaHR0cHM6Ly9hcGkub3BlbndlYXRoZXJtYXAub3JnL2RhdGEvMi41L3dlYXRoZXI/bGF0PSR7Y29vcmRpbmF0ZXMubGF0aXR1ZGV9Jmxvbj0ke2Nvb3JkaW5hdGVzLmxvbmdpdHVkZX0mdW5pdHM9bWV0cmljJmFwcGlkPSR7QVBJX0tFWX1gXHJcbiAgICAgIDogYGh0dHBzOi8vYXBpLm9wZW53ZWF0aGVybWFwLm9yZy9kYXRhLzIuNS93ZWF0aGVyP3E9JHtlbmNvZGVVUklDb21wb25lbnQoY2l0eU5hbWUpfSZ1bml0cz1tZXRyaWMmYXBwaWQ9JHtBUElfS0VZfWBcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGFwaVVSTCwgeyBtb2RlOiAnY29ycycgfSlcclxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxyXG4gICAgICBpZiAoZGF0YS5jb2QgPT09IDIwMCkgcmV0dXJuIGZpbHRlckRhdGEoZGF0YSlcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGRhdGEubWVzc2FnZSlcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4geyBnZXREYXRhIH1cclxufSkoKVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgd2VhdGhlciIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHdlYXRoZXIgZnJvbSAnLi9tb2R1bGVzL3dlYXRoZXInXHJcbmltcG9ydCB1dGlscyBmcm9tICcuL21vZHVsZXMvdXRpbHMnXHJcbmltcG9ydCBnZXRVc2VyUG9zaXRpb24gZnJvbSAnLi9tb2R1bGVzL2dlb2xvY2F0aW9uJ1xyXG5cclxuLy8gY29uc3QgZGF0ZSA9IG5ldyBEYXRlKDE2NzM2NTU0OTkgKiAxMDAwKVxyXG4vLyBjb25zdCBob3VyID0gYCR7ZGF0ZS5nZXRIb3VycygpfToke2RhdGUuZ2V0TWludXRlcygpfWBcclxuLy8gY29uc29sZS5sb2coaG91cilcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGxvYWRJbml0aWFsRGF0YSgpIHtcclxuICBjb25zdCBwb3NpdGlvbiA9IGF3YWl0IGdldFVzZXJQb3NpdGlvbigpXHJcbiAgY29uc3QgZGF0YSA9IGF3YWl0IHdlYXRoZXIuZ2V0RGF0YShudWxsLCBwb3NpdGlvbilcclxuICBjb25zb2xlLmxvZyhkYXRhKSAvLyBUT0RPOiBET00gZnVuY3Rpb24gdGhhdCBmZWVkcyBldmVyeXRoaW5nXHJcbn1cclxuXHJcbmxvYWRJbml0aWFsRGF0YSgpIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9