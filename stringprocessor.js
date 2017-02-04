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

module.exports = {
  getFirstWord,
  removeFirstWord,
  textBetween
}
