// Global string processing functions
const lodash = require('lodash')

function getFirstWord (str) {
  if (str.indexOf(' ') === -1) {
    return str
  } else {
    return str.substr(0, str.indexOf(' '))
  }
}

function removeFirstWord (str) {
  if (str.indexOf(' ') === -1) {
    return ''
  } else {
    return str.substr(str.indexOf(' ') + 1)
  }
}

function textBetween (str, firstCharacter, secondCharacter) {
  var start = str.indexOf(firstCharacter) + 1
  if (start === 0) { return '' }
  var end = str.indexOf(secondCharacter, start)
  if (end === -1) { end = str.length }
  return str.substring(start, end)
}

function removeTextBetween (str, firstCharacter, secondCharacter) {
  var start = str.indexOf(firstCharacter)
  if (start === -1) { return str }
  var end = str.indexOf(secondCharacter, start)
  if (end === -1) { end = str.length }
  return (str.substring(0, start) + str.substring(end + 1)).trim()
}

function stringToWords (str) {
  if (str) {
    return str.split(' ')
  } else {
    return []
  }
}

// TODO: Needs rework
function splitByCommasAndsDoubleSpaces (str) {
  if (str) {
    const items = str
      .split(',')
      .map(text => {
        return text.split(' and ')
      })
    console.log('1')
    console.log(items)
    const itemsSplitByDoubleSpaceAsWell =
      lodash.flatten(items)
        .map(text => {
          return text.split('  ')
        })
    console.log('2')
    console.log(itemsSplitByDoubleSpaceAsWell)
    const flatItems = lodash.flatten(itemsSplitByDoubleSpaceAsWell)
    console.log('3')
    console.log(flatItems)
    return flatItems
      .map(item => { return item.trim() })
      .filter(item => { return item })
  } else {
    return []
  }
}

module.exports = {
  getFirstWord,
  removeFirstWord,
  textBetween,
  removeTextBetween,
  stringToWords,
  splitByCommasAndsDoubleSpaces
}
