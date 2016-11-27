
function preProcessMessage (messageText, cachedListName, fromUserName) {
  var returnText = messageText

  // For cached list name - add to the beginning
  if (cachedListName != null && (returnText.startsWith('add ') || returnText.startsWith('remove '))) {
    returnText = '#' + cachedListName + ' ' + returnText
  }

  // Replaces @me wtih @<username>
  returnText = returnText.replace('@me', '@' + fromUserName)

  console.log('preProcessMessage: ' + returnText)

  return returnText
}

module.exports = {
  preProcessMessage
}
