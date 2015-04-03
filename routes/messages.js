var _ = require('lodash');
var express = require('express');
var Handlebars = require('handlebars');
var mandrill = require('mandrill-api/mandrill');
var Message = require('../models/message');
var senators = require('../data/senators');

var messagesRouter = express.Router();

var mandrillClient = new mandrill.Mandrill(process.env.MANDRILL_APIKEY || '026t-Soj1CcaN0FPMNd0HA');

messagesRouter.post('/', Message.blockEmailDuplicates(), function(req, res, next) {
;
  var message = req.body;
  var district = parseInt(message.district);
  var matchedSenator = senators[district - 1];

  message.toName = matchedSenator.name;
  message.toEmail = matchedSenator.email;

  message.diff = Message.getMessageDiff(message);

  if (message.diff < 20) {
    mandrillClient.messages.send({
      'message': {
        'text': message.messageBody,
        'subject': message.messageTitle,
        'from_email': 'kontakt@posprzatajmyreklamy.pl',
        'from_name': message.fromName,
        'to': [{
                'email': message.toEmail ,
                'name': message.toName,
                'type': 'to'
            }],
        'headers': {
            'Reply-To': message.fromEmail
        },
        'auto_html': true
      }
  }, function(result) {
      message.status = 'send-success';
      message.sentLog = result;
      save(res, message);
    }, function(err) {
      message.status = 'send-failure';
      message.sentLog = err;
      save(res, message);
    });

  } else {
    message.status = 'modarate-waiting';
    save(res, message);
  }

  function save(res, message) {
    Message.create(message, function(err, body) {
      if (err) {
        return next(err);
      }
      res.send(body);
    });
  }

});

module.exports = messagesRouter;
