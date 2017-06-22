const errors = require('./../errors')
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
  if (data.errorMessage === errors.errorTypes.listAlreadyExists) {
    data.responseText = phrases.listAlreadyExists
    return data
  } else {
    return data
  }
}

module.exports = {
  processResponseTextPromise,
  processErrorPromise
}
