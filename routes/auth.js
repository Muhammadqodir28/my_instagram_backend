const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Jwt_secret } = require('../key')
const mongoose = require('mongoose')
const User = mongoose.model('User')

// router.get('/', (req, res) => {
//   res.send('Muhammadqodir')
// })

router.post('/register', async (req, res) => {
  try {
    const { name, userName, email, password } = req.body

    if(!name || !userName || !email || !password) {
      return res.status(422).json({ error: 'Please add all the fields' })
    }

    const existingUser = await User.findOne({
      $or: [{ userName }, { email }]
    })
    if(existingUser) {
      return res.status(422).json({ error: 'User already exists with that email or userName' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = new User({ name, userName, email, password: hashedPassword })
    await user.save()
    res.json({ message: 'Registered successfully' })
  } catch(error) {
    console.log(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if(!email || !password) {
      return res.status(422).json({ error: 'Please add email and password' })
    }

    const savedUser = await User.findOne({ email })
    if(!savedUser) {
      return res.status(422).json({ error: 'Invalid email' })
    }

    const match = await bcrypt.compare(password, savedUser.password)
    if(match) {
      const token = jwt.sign({ _id: savedUser.id }, Jwt_secret)
      const { _id, name, email, userName } = savedUser
      res.json({
        token,
        user: { _id, name, email, userName, password }
      })
      console.log({
        token,
        user: { _id, name, email, userName, password }
      })
    } else {
      return res.status(422).json({ error: 'Invalid password' })
    }
  } catch(error) {
    console.log(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
