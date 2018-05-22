const mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator')
const bcrypt = require('bcryptjs')
const { HOST, PORT } = require('../../../config')

var schemaOptions = {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
}

const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    photoLocation: {
      path: String, // /files/photo.jpg
      server: {
        type: String,
        enum: ['this', 'extenal', 'fileServerOne'] // this would be useful in case fileServerOne changes its address
      }
    },
    name: String
  },
  schemaOptions
)

schema.virtual('photo').get(function() {
  const firstPart = this.photoLocation.server === 'this' ? `${HOST}` : ''
  return firstPart + this.photoLocation.path
})

schema.pre('save', async function(next) {
  if (this.password) {
    try {
      const salt = await bcrypt.genSalt(10)
      this.password = await bcrypt.hash(this.password, salt)
      next()
    } catch (error) {
      next(error)
    }
  }
  next()
})

schema.methods.isValidPassword = async function(newPassword) {
  try {
    return await bcrypt.compare(newPassword, this.password)
  } catch (error) {
    throw new Error(error)
  }
}

schema.plugin(uniqueValidator)

const User = mongoose.model('User', schema)

module.exports = User
