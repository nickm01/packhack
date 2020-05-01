const mongoOp = require('./mongo')

const findFamilyPromise = (familyId) => {
  return mongoOp.FamilyMembers.find({id: familyId})
    .exec()
}

const saveNewFamilyPromise = (family) => {
  var newFamily = new mongoOp.FamilyMembers(family)
  return newFamily.save()
}

module.exports = {
  findFamilyPromise,
  saveNewFamilyPromise
}
