const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Post = mongoose.model('Post')
const User = mongoose.model('User')
const middlewareLogin = require('../middlewares/middlewareLogin')

router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id })
    const post = await Post.find({ postedBy: req.params.id }).populate('postedBy', '_id')
    res.status(200).json({ user, post })
  } catch(error) {
    return res.status(404).json({ error: 'User not found' })
  }
})

router.put('/follow', middlewareLogin, async (req, res) => {
  try {
    const followedUser = await User.findByIdAndUpdate(
      req.body.followId,
      { $push: { followers: req.user._id } },
      { new: true, useFind: false }
    )

    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { following: req.body.followId } },
      { new: true, useFind: false }
    )

    res.json(followedUser)
  } catch(error) {
    return res.status(422).json({ error: error.message })
  }
})

router.put('/unfollow', middlewareLogin, async (req, res) => {
  try {
    const unfollowedUser = await User.findByIdAndUpdate(
      req.body.followId,
      { $pull: { followers: req.user._id } },
      { new: true, useFind: false }
    )

    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { following: req.body.followId } },
      { new: true, useFind: false }
    )

    res.json(unfollowedUser)
  } catch(error) {
    return res.status(422).json({ error: error.message })
  }
})

router.put('/upload-profile-picture', middlewareLogin, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { photo: req.body.picture },
      { new: true, useFind: false }
    )
    res.json(updatedUser)
  } catch(error) {
    res.status(422).json({ error: error.message })
  }
})

router.post('/search', middlewareLogin, async (req, res) => {
  const { keyword } = req.body
  const query = {}

  if(keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { userName: { $regex: keyword, $options: 'i' } }
    ]
  }

  try {
    const users = await User.find(query)
    res.json(users)
  } catch(error) {
    console.log(error)
    res.status(500).json({ error })
  }
})

module.exports = router
