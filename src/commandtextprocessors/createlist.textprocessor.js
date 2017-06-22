// const errors = require('./../errors')
const lists = require('../../model/lists')
const phrases = require('./../phrases')
// const Q = require('q')

const processResponseTextPromise = (data) => {
  console.log('7')
  console.log(data)
  return lists.saveNewPromise(data).then(result => {
    data.responseText = phrases.success
    return data
  })
}

const processErrorPromise = (data) => {
  // TODO: Fix
  // if (!data.listExist) {
  //   // Deal with the 'guess' that they are after a list not typing a command
  //   if (data.errorMessage === errors.errorTypes.noList) {
  //     data.responseText = 'Sorry please specify a list\ne.g. "get shopping"'
  //   } else if (data.words.length === 1 && data.originalText.charAt(0) !== '#') {
  //     data.command = undefined
  //     data.list = undefined
  //     throw data
  //   } else {
  //     data.responseText = 'Sorry, couldn\'t find #' + data.list + '\nType "get lists" to see what\'s available.'
  //   }
  // }
  // return Q.resolve(data)
}

module.exports = {
  processResponseTextPromise,
  processErrorPromise
}
