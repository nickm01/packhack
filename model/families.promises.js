const mongoOp = require('./mongo')

const findFamilyPromise = (familyId) => {
  return mongoOp.Families.find({id: familyId})
    .exec()
}

const saveNewFamilyPromise = (family) => {
  var newFamily = new mongoOp.Families(family)
  return newFamily.save()
}

module.exports = {
  findFamilyPromise,
  saveNewFamilyPromise
}
