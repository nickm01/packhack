const lists = require('../../model/lists')
const phrases = require('./../phrases')

const processResponseTextPromise = (data) => {
  return lists.findAllPromise(data).then(data => {
    console.log(888)
    console.log(data)
    if (data.lists.length === 0) {
      data.responseText = phrases.noListsExist + '/n' + phrases.createListExample
    } else {
      const listKeys = data.lists.map(list => { return list.listKey })
      data.responseText = '#' + listKeys.join('\n#')
    }
    return data
  })
}

module.exports = {
  processResponseTextPromise
}
