var fs = require('fs');
var _ = require('lodash');
var JsDiff = require('diff');
var Handlebars = require('handlebars');
var juice     = require('juice');

var sendgrid = require('../lib/sendgrid');

var config = require('../config');
var mongoose = require('../lib/mongoose');
var senatorMsg = fs.readFileSync('./data/senatorMessage.hbs', {encoding: 'utf8'});
var acceptMsg = fs.readFileSync('./data/acceptMessage.hbs', {encoding: 'utf8'});
var senators = require('../data/senators');

var senatorMsgTmpl = Handlebars.compile(senatorMsg);
var acceptsMsgTmpl = Handlebars.compile(acceptMsg);

var messageSchema = new mongoose.Schema({
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
  token: {
    type: String
  },
  status: {
    type: String,
    default: 'pending'
  },
  sentLog: {
    type: Object,
  }
});

messageSchema.pre('save', function (next) {
  if (!this.token) {
    this.token = Math.random().toString(36).substr(10);
  }
  next();
});

messageSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    delete ret.token;
    return ret;
  }
});

messageSchema.virtual('diff').get(function () {

  var message = this;

  var district = parseInt(message.district);
  var matchedSenator = senators[district - 1];

  var orgMessage = senatorMsgTmpl({
    message: message,
    senator: matchedSenator
  }).replace(/\\n/g, '\n');

  var diffs = JsDiff.diffWords(orgMessage, message.messageBody);

  var diff = _.reduce(diffs, function(result, diff) {
    if (diff.added || diff.removed) {
      return result + diff.count || 0;
    } else {
      return result;
    }
  }, 0);

  return diff;

});

messageSchema.virtual('acceptLink').get(function () {
  return 'http://www.uratujciedrzewa.pl/messages/' + this._id + '/moderate?token=' + this.token;
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

messageSchema.methods.send = function(cb) {

  var message = this;

  var options = {
    "html": true,
    "important": false,
    "track_opens": false,
    "track_clicks": false,
    "auto_text": true, // Convert html to text
    "auto_html": false, // Do not convert text to html
    "inline_css": true,
    "url_strip_qs": true,
    "preserve_recipients": false,
    "view_content_link": true,
    "html": juice(message.messageBody),
    "text": message.messageBody,
    "subject": message.messageTitle,
    "from": 'kontakt@uratujciedrzewa.pl',
    "fromName": message.fromName,
    "headers": {
      "Reply-To": message.fromEmail
    },
    "to": message.toEmail,
    "toname": message.toName,
  };

  var email = new sendgrid.Email(options);
  return sendgrid.send(email, function(err, result) {
    message.status = 'send-success';
    message.sentLog = result;
    console.log(err || result);
    return cb(err, result);
  });

};

messageSchema.methods.sendToModeration = function(cb) {
  var message = this;

  message.status = 'modarate-waiting';
  message.token = Math.random().toString(36).substr(6);

  var message = this;

  var options = {
    "html": true,
    "important": false,
    "track_opens": false,
    "track_clicks": false,
    "auto_text": true, // Convert html to text
    "auto_html": false, // Do not convert text to html
    "inline_css": true,
    "url_strip_qs": true,
    "preserve_recipients": false,
    "view_content_link": true,
    "html": juice(message.messageBody),
    "text": message.messageBody,
    "subject": "List do senatora - wymagana akceptacji",
    "from": "do-not-reply@uratujciedrzewa.pl",
    "fromName": "uratujciedrzewa.pl",
    "to": "kontakt@uratujciedrzewa.pl",
    "toname": "Uratujcie Drzewa"
  };

  var email = new sendgrid.Email(options);
  return sendgrid.send(email, function(err, result) {
    message.status = 'send-success';
    message.sentLog = result;
    console.log(err || result);
    return cb(err, result);
  });

};

var Message = module.exports = mongoose.model('Message', messageSchema);
