const express = require('express')
const app = express()
const mongoose = require('mongoose')
const { mongoUrl } = require('./key')
const cors = require('cors')
const PORT = process.env.PORT || 5000

app.use(cors())
require('./models/Model')
require('./models/Post')
app.use(express.json())
app.use(require('./routes/auth'))
app.use(require('./routes/create'))
app.use(require('./routes/user'))
mongoose.connect(mongoUrl)

mongoose.connection.on('connected', () => {
  console.log('Successfully connected to MongoDB')
})

mongoose.connection.on('error', () => {
  console.log('Error connected to MongoDB')
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
