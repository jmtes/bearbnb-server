const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 32
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: 'This user has not set a bio.',
    maxlength: 200
  },
  places: {
    // Array of place IDs
    type: Array,
    default: []
  },
  reviews: {
    // Array of review IDs
    type: Array,
    default: []
  },
  reservations: {
    // Array of reservation IDs
    type: Array,
    default: []
  },
  inbox: {
    // Array of message objects
    type: Array,
    default: []
  }
});

module.exports = mongoose.model('user', UserSchema);