var JsDiff = require('diff');
var _ = require('lodash');
var mongoose = require('../lib/mongoose');
var Handlebars = require('handlebars');

var messageText = require('../data/message');
var senators = require('../data/senators');

var messageTmpl = Handlebars.compile(messageText);

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

messageSchema.statics.isEmailUsed = function(email, cb) {
  this.find({
    fromEmail: email
  }, function(err, data) {
    if (err) {
      return cb(err);
    } else
    if (data.length > 0) {
      return cb(null, true);
    } else {
      return cb(null, false);
    }
  });
};

messageSchema.statics.blockEmailDuplicates = function(param) {
  
  param = param || 'fromEmail';

  return function(req, res, next) {
    
    Message.isEmailUsed(req.body[param], function(err, isUsed) {
      if (isUsed) {
        res.status(409).send('Sender email already used');
      } else {
        next();
      }
    });

  };

};

messageSchema.statics.getMessageDiff = function(message) {

  var district = parseInt(message.district);
  var matchedSenator = senators[district - 1];

  var orgMessage = messageTmpl({
    message: message,
    senator: matchedSenator
  }).replace(/\\n/g, '\n');

  var diffs = JsDiff.diffWords(orgMessage, message.messageBody);

  var diffN = _.reduce(diffs, function(result, diff) {
    if (diff.added || diff.removed) {
      return result + diff.count || 0;
    } else {
      return result;
    }
  }, 0);

  return diffN;

};

var Message = module.exports = mongoose.model('Message', messageSchema);

