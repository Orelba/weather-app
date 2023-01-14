import weather from './modules/weather'
import utils from './modules/utils'
import getUserPosition from './modules/geolocation'

// const date = new Date(1673655499 * 1000)
// const hour = `${date.getHours()}:${date.getMinutes()}`
// console.log(hour)

async function loadInitialData() {
  const position = await getUserPosition()
  const data = await weather.getData(null, position)
  console.log(data) // TODO: DOM function that feeds everything
}

loadInitialData()