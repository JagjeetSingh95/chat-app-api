const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId, 
  senderID: { 
    // type: String,
    // required: true
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiverID : {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  message: {
    type: String,
    required: true,
  },
  created_at: {
    type: String, 
    required: true
  }
});

module.exports = mongoose.model('Chat', chatSchema); 