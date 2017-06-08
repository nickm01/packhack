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

module.exports = {
  getFirstWord,
  removeFirstWord,
  textBetween,
  removeTextBetween,
  stringToWords
}