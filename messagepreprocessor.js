
function preProcessMessage (messageText, cachedListName, fromUserName) {
  var returnText = messageText

  // For cached list name - add to the beginning
  if (cachedListName != null && (returnText.startsWith('add ') || returnText.startsWith('remove '))) {
    returnText = '#' + cachedListName + ' ' + returnText
  }

  // For get shorthand... if a signle word that starts with #, then add get
  if (returnText.startsWith('#') && returnText.indexOf(' ') >= 0) {
    returnText = 'get ' + returnText
  }

  // Replaces @me wtih @<username>
  returnText = returnText.replace('@me', '@' + fromUserName)

  console.log('preProcessMessage: ' + returnText)

  return returnText
}

module.exports = {
  preProcessMessage
}
