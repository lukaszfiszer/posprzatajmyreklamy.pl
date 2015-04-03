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

var Message = module.exports = mongoose.model('Message', messageSchema);

