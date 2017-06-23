const lists = require('../../model/lists')
const phrases = require('./../phrases')

const processResponseTextPromise = (data) => {
  return lists.saveNewPromise(data).then(result => {
    data.responseText = phrases.success
    return data
  })
}

module.exports = {
  processResponseTextPromise
}
