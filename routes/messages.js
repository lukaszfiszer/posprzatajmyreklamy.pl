var _ = require('lodash');
var express = require('express');
var Handlebars = require('handlebars');
var JsDiff = require('diff');
var mandrill = require('mandrill-api/mandrill');

var Message = require('../models/message');
var messageText = require('../data/message')
var senators = require('../data/senators');

var messagesRouter = express.Router();

var mandrillClient = new mandrill.Mandrill(process.env.MANDRILL_APIKEY || '026t-Soj1CcaN0FPMNd0HA');
var messageTmpl = Handlebars.compile(messageText);

messagesRouter.post('/', function(req, res, next) {

  var district = parseInt(req.body.district);
  var matchedSenator = senators[district - 1];
  var orgMessage = messageTmpl({
    message: req.body,
    senator: matchedSenator
  }).replace(/\\n/g, '\n');

  var diffs = JsDiff.diffWords(orgMessage, req.body.messageBody)

  var diffN = _.reduce(diffs, function(result, diff) {
    if (diff.added || diff.removed) {
      return result + diff.count || 0;
    } else {
      return result;
    }
  }, 0);

  var data = req.body;
  
  data.diff = diffN;
  data.toName = matchedSenator.name;
  data.toEmail = matchedSenator.email;

  var message = {
    'text': data.messageBody,
    'subject': data.messageTitle,
    'from_email': 'kontakt@posprzatajmyreklamy.pl',
    'from_name': data.fromName,
    'to': [{
            'email': data.toEmail ,
            'name': data.toName,
            'type': 'to'
        }],
    'headers': {
        'Reply-To': data.fromEmail
    },
    'auto_html': true
  };

  if (diffN  < 20) {
    mandrillClient.messages.send({"message": message}, function(result) {
      data.status = 'send-success';
      data.sentLog = result;
      save(res, data);
    }, function(err) {
      data.status = 'send-failure';
      data.sentLog = err;
      save(res, data);
    });

  } else {
    data.status = 'modarate-waiting'
    save(res, data);
  }

  function save(res, data) {
    Message.create(data, function(err, body) {
      if (err) {
        return next(err);
      }
      res.send(body);
    });
  };

});

module.exports = messagesRouter;
