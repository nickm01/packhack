// Global user-facing errors (not to be confused with DB or model errors)

const errorTypes = {
  noText: 'noText',
  unrecognizedCommand: 'unrecognizedCommand',
  noList: 'noList',
  listNameInvalid: 'listNameInvalid',
  noPerson: 'noPerson',
  listAlreadyExists: 'listAlreadyExists',
  listNotFound: 'listNotFound',
  personNotFound: 'personNotFound',
  listItemNotFound: 'listItemNotFound',
  generalError: 'generalError'
}

module.exports = {
  errorTypes
}
