const phrases = require('./../phrases')

const processResponseTextPromise = (data) => {
  data.responseText = phrases.help
  return data
}

module.exports = {
  processResponseTextPromise
}
