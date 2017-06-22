// const errors = require('./../errors')
const lists = require('../../model/lists')
const phrases = require('./../phrases')
// const Q = require('q')

const processResponseTextPromise = (data) => {
  return lists.saveNewPromise(data).then(result => {
    data.responseText = phrases.success
    return data
  })
}

const processErrorPromise = (data) => {
  if (data.listExist) {
    data.responseText = phrases.listAlreadyExists
    return data
  }
}

module.exports = {
  processResponseTextPromise,
  processErrorPromise
}
