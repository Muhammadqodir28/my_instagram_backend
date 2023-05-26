const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Post = mongoose.model('Post')
const middlewareLogin = require('../middlewares/middlewareLogin')

router.get('/all-posts', middlewareLogin, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('postedBy', '_id name photo')
      .populate('comments.postedBy', '_id name')
      .sort('-createdAt')
    res.json(posts)
  } catch(error) {
    console.log(error)
    res.status(500).json({ error })
  }
})

router.get('/my-posts', middlewareLogin, async (req, res) => {
  try {
    const myPosts = await Post.find({ postedBy: req.user._id })
      .populate('postedBy', '_id name')
      .populate('comments.postedBy', '_id name')
      .sort('-createdAt')
    res.json(myPosts)
  } catch(error) {
    console.log(error)
    res.status(500).json({ error })
  }
})

router.post('/create-post', middlewareLogin, async (req, res) => {
  try {
    const { body, picture } = req.body
    console.log(body, picture)
    if(!picture) {
      return res.status(422).json({ error: 'Please add a photo' })
    }
    console.log(req.user)
    const post = new Post({ body, photo: picture, postedBy: req.user })
    const result = await post.save()
    return res.json({ post: result })
  } catch(error) {
    console.log(error)
    res.status(500).json({ error })
  }
})

router.put('/like', middlewareLogin, async (req, res) => {
  try {
    const data = await Post.findByIdAndUpdate(
      req.body.postId,
      { $push: { likes: req.user._id } },
      { new: true }
    )
      .populate('postedBy', '_id name photo')
      .exec()
    return res.status(201).json(data)
  } catch(error) {
    console.log(error)
    res.status(422).json({ error })
  }
})

router.put('/unlike', middlewareLogin, async (req, res) => {
  try {
    const data = await Post.findByIdAndUpdate(
      req.body.postId,
      { $pull: { likes: req.user._id } },
      { new: true }
    )
      .populate('postedBy', '_id name photo')
      .exec()
    return res.status(200).json(data)
  } catch(error) {
    console.log(error)
    res.status(422).json({ error })
  }
})

router.put('/save', middlewareLogin, async (req, res) => {
  try {
    const data = await Post.findByIdAndUpdate(
      req.body.postId,
      { $push: { saves: req.user._id } },
      { new: true }
    )
      .populate('postedBy', '_id name photo')
      .exec()
    return res.status(201).json(data)
  } catch(error) {
    console.log(error)
    res.status(422).json({ error })
  }
})

router.put('/unsave', middlewareLogin, async (req, res) => {
  try {
    const data = await Post.findByIdAndUpdate(
      req.body.postId,
      { $pull: { saves: req.user._id } },
      { new: true }
    )
      .populate('postedBy', '_id name photo')
      .exec()
    return res.status(200).json(data)
  } catch(error) {
    console.log(error)
    res.status(422).json({ error })
  }
})

router.put('/comment', middlewareLogin, async (req, res) => {
  try {
    const comment = {
      comment: req.body.text,
      postedBy: req.user._id
    }
    const result = await Post.findByIdAndUpdate(
      req.body.postId,
      { $push: { comments: comment } },
      { new: true }
    )
      .populate('comments.postedBy', '_id name photo')
      .populate('postedBy', '_id name')
      .exec()
    return res.json(result)
  } catch(error) {
    console.log(error)
    res.status(422).json({ error })
  }
})

router.delete('/delete-post/:postId', middlewareLogin, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId }).populate('postedBy', '_id')
    console.log(post)
    if(!post) {
      return res.status(422).json({ error })
    }
    if(post.postedBy._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error })
    }
    await post.deleteOne()
    return res.json({ message: 'Successfully deleted' })
  } catch(error) {
    console.log(error)
    res.status(500).json({ error })
  }
})

module.exports = router
