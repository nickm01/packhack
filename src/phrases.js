// Global phrases
// Where possible should match the error codes

module.exports = {
  success: 'Done 👍',
  generalMisundertanding: '😕 Sorry don\'t understand. Type \'packhack\' for help.',
  listNotFound: '😕 Sorry, couldn\'t find #',
  suggestGetLists: 'Type \'get lists\' to see what\'s available.',
  noList: '😕 Sorry please specify a list', // Additionally uses command-specific examples below
  generalError: '😬 Sorry something unexpected happened.\nPlease try again.',
  // getList specifc
  noItems: 'Currently no items in #',
  // createList specific
  listAlreadyExists: '😕 Sorry, list already exists!',
  listNameInvalid: '😕 Sorry, list name is invalid.\nPlease don\t use spaces or reserved commands like \'create\'.',
  // addListItem or removeListItem specific
  noListItemToAdd: '😕 Sorry please specify item(s) to add.',
  // command specific exmaples
  createListExample: 'e.g. \'create my-new-list\'',
  getListExample: 'e.g. \'create my-list\'',
  deleteListExample: 'e.g. \'delete shopping\'',
  addListItemExample: 'e.g. \'#my-list add bread, milk, coffee\'.\nOr simply, \'get my-list\', followed by \'add bread, milk, coffee'
}
