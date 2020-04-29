const mongoOp = require('./mongo')

const findFamilyPromise = (familyId) => {
  const filter = {familyId}
  return mongoOp.FamilyMembers.find(filter)
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
