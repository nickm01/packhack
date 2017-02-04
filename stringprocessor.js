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
  var end = str.indexOf(secondCharacter, start)
  return str.substring(start, end)
}

module.exports = {
  getFirstWord,
  removeFirstWord
}
