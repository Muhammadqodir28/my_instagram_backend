const jwt = require('jsonwebtoken')
const { Jwt_secret } = require('../key')
const mongoose = require('mongoose')
const User = mongoose.model('User')

module.exports = async (req, res, next) => {
  const { authorization } = req.headers
  if(!authorization) {
    return res.status(401).json({ error: 'You have to have logged' })
  }
  const token = authorization.replace('Bearer ', '')
  try {
    const payload = jwt.verify(token, Jwt_secret)
    const { _id } = payload
    const userData = await User.findById(_id)
    req.user = userData
    next()
  } catch(error) {
    return res.status(401).json({ error: 'You have to have logged' })
  }
}
