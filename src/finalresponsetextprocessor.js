const replaceDynamicText = (data, str) => {
  console.log('44444dynamictext')
  console.log(data)
  var finalText = str
  if (data.list) {
    finalText = finalText.replace('%#list', '#' + data.list)
    finalText = finalText.replace('%#list', '#' + data.list) // TODO: Needs to find a iterative replace
  }
  if (data.person) {
    finalText = finalText.replace('%@person', '@' + data.person)
  }
  if (data.fromPerson) {
    finalText = finalText.replace('%@fromPerson', '@' + data.fromPerson)
  }
  console.log(finalText)
  return finalText
}

module.exports = {
  replaceDynamicText
}
