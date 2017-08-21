// Global string processing functions

const stringToWords = str => {
  if (str) {
    return str.split(' ')
  } else {
    return []
  }
}

// split into array based on comma, and or double space separators
// trims and removes empty items (based on truthiness)
const splitByDelimiters = str => {
  if (str) {
    return str
      .replace(/ and /g, ',')
      .replace(/\.\s/g, ',')
      .replace(/\s\s/g, ',')
      .replace(/\n/g, ',')
      .replace(/\[\r\n]/g, ',')
      .split(',')
      .map(text => {
        return text.trim()
      })
      .filter(item => { return item })
  } else {
    return []
  }
}

const allNumeric = array => {
  return array.filter(obj => {
    return Number(obj)
  }).length === array.length
}

module.exports = {
  stringToWords,
  splitByDelimiters,
  allNumeric
}
