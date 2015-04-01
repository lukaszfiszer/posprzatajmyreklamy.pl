var mongoose = require('../lib/mongoose');

var messageSchema = new mongoose.Schema({
  firebaseId: {
    type: String,
    unique: true,
    sparse: true
  },
  district: {
    type: Number,
    required: true,
  },
  fromEmail: {
    type: String,
    required: true,
  },
  fromName: {
    type: String,
    required: true,
  },
  toEmail: {
    type: String,
    required: true,
  },
  toName: {
    type: String,
    required: true,
  },
  messageBody: {
    type: String,
    required: true,
  },
  messageTitle: {
    type: String,
    required: true
  },
  status: {
    type: String,
  },
  sentLog: {
    type: Object,
  }
});

var Message = module.exports = mongoose.model('Message', messageSchema);

