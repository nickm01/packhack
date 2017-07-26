const replaceDynamicText = (data, str) => {
  console.log('44444dynamictext')
  console.log(data)
  var finalText = str
  if (data.list) {
    // regex replace will replace every occurence
    finalText = finalText.replace(/%#list/g, '#' + data.list)
  }
  if (data.person) {
    finalText = finalText.replace('%@person', '@' + data.person)
  }
  if (data.fromPerson) {
    finalText = finalText.replace('%@fromPerson', '@' + data.fromPerson)
  }
  if (data.reminderUserDateText) {
    finalText = finalText.replace('%%date', data.reminderUserDateText)
  }
  console.log(finalText)
  return finalText
}

module.exports = {
  replaceDynamicText
}
