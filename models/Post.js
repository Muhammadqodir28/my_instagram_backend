const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
  body: { type: String },
  photo: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    comment: { type: String },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

mongoose.model('Post', postSchema)
